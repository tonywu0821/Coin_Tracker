import React, { Component } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Coin = props => (
  <tr>
    <td>{props.coin.currency}</td>
    <td>{props.coin.price !== undefined ? `US$${props.coin.price.toLocaleString()}`: 'no data'}</td>
    <td style = {props.changeStyle(props.coin.d24H)}>{props.coin.d24H !== undefined ? `${props.coin.d24H.toFixed(1)}%` : 'no data'}</td>
    <td style = {props.changeStyle(props.coin.d7D)}>{props.coin.d7D !== undefined ? `${props.coin.d7D.toFixed(1)}%` : 'no data'}</td>
    <td style = {props.changeStyle(props.coin.d30D)}>{props.coin.d30D !== undefined ? `${props.coin.d30D.toFixed(1)}%` : 'no data'}</td>
    <td>{props.coin.volume !== undefined ? `US$${props.coin.volume.toLocaleString()}` : 'no data'}</td>
    <td>{props.coin.marketCap !== undefined ? `US$${props.coin.marketCap.toLocaleString()}` : 'no data'}</td>
  </tr>
)

export default class CoinsList extends Component {
  constructor(props) {
    super(props);
    //var date = new Date();
    //date.getTimezoneOffset();
    //console.log("DATE",new Date(date.getTime() - (date.getTimezoneOffset()*60*1000)).toISOString());
    this.state = {
      date : new Date('2019-12-04'),
      sortConfig: {key:'marketCap', direction:'descending'},
      coins:[]};
    this.onChangeDate = this.onChangeDate.bind(this);
    this.requestSort = this.requestSort.bind(this);
  }
  
  changeStyle(data){
    if(data === undefined){
      return { 
        
      };
    }
    return {
      color: (data <= 0) ? '#4caf50' : '#e53935'
    }
  }

  componentDidMount() {
    this.getCoinData(this.state.date);
  }

  getCoinData(date) {
    console.log("getCoinData",date.toISOString());
    axios.get('http://localhost:5000/coinprices/',{ params: {date : date}})
      .then(response => {
        if(response.data.length === 0){
          this.setState({coins:[]});
          return;
        }
        this.processCoinData(response.data, date);
    })
      .catch((error) => {
        console.log(error)
      })
  }
  
  processCoinData(data, date) {

    var coinDic = {};
    let processedData = [];
    data.forEach(element => {
      if (!(element.currency in coinDic)) {
        coinDic[element.currency] = [] ;
        coinDic[element.currency].push(element)
      } else {
        coinDic[element.currency].push(element)
      }
    });

    var firstDay = date;
    var oneDayBefore = new Date(firstDay);
    var sevenDayBefore = new Date(firstDay);
    var oneMonthBefore = new Date(firstDay);
    oneDayBefore.setDate(sevenDayBefore.getDate() - 1);
    sevenDayBefore.setDate(sevenDayBefore.getDate() - 7);
    oneMonthBefore.setDate(oneMonthBefore.getDate() - 30);

    var firstDayString = firstDay.toISOString();
    var oneDayBeforeString = oneDayBefore.toISOString();
    var sevenDayBeforeString = sevenDayBefore.toISOString();
    var oneMonthBeforeString = oneMonthBefore.toISOString();

    for (var key in coinDic) {
      var id;
      var currency = key;
      var firstDayPrice;
      var oneDayBeforePrice;
      var sevenDayBeforePrice;
      var oneMonthBeforePrice;
      var volume;
      var marketCap; 
      // set vars
      coinDic[key].forEach(element => {
        if( element.date === firstDayString) {
          id = element._id;
          firstDayPrice = element.close;
          volume = element.volume;
          marketCap = element.marketCap;
        } else if (element.date === oneDayBeforeString) {
          oneDayBeforePrice = element.close;
        } else if (element.date === sevenDayBeforeString) {
          sevenDayBeforePrice = element.close;
        } else if (element.date === oneMonthBeforeString) {
          oneMonthBeforePrice = element.close;
        }
      });

      var d24H;
      var d7D;
      var d30D;

      if (firstDayPrice && oneDayBeforePrice) {
        d24H = ((firstDayPrice - oneDayBeforePrice) / oneDayBeforePrice) * 100;
      } 
      if (firstDayPrice && sevenDayBeforePrice) {
        d7D = ((firstDayPrice - sevenDayBeforePrice) / sevenDayBeforePrice) * 100;
      }
      if (firstDayPrice && oneMonthBeforePrice) {
        d30D = ((firstDayPrice - oneMonthBeforePrice) / oneMonthBeforePrice) * 100;
      }
      
      processedData.push({
        id: id,
        currency: currency, 
        price: firstDayPrice, 
        d24H: d24H,
        d7D: d7D, 
        d30D: d30D, 
        volume: volume, 
        marketCap: marketCap
      })
    }

    processedData.sort((a,b)=> { 
      if (a.marketCap > b.marketCap) {
        return 1;
      }
      if (a.marketCap < b.marketCap) {
        return -1;
      }
      return 0;
    })

    this.setState({coins:processedData});
  }

  onChangeDate(date) {
    this.setState({
      date: date
    })
    console.log("changed date:",date.toISOString());
    this.getCoinData(date);
  }

  requestSort(key){
    let direction = "ascending";
    if (
      this.state.sortConfig &&
      this.state.sortConfig.key === key &&
      this.state.sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    this.setState({ sortConfig: { key, direction }});
    this.sortCoins(key,direction);
  }

  sortCoins(key,direction){
    this.state.coins.sort((a, b) => {
      if (a[key] < b[key]){
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]){
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    })
  }

  coinList() {
    console.log("coinList:",this.state.coins);
    return this.state.coins.map(currentCoin => {
      return <Coin coin={currentCoin} date = {this.state.date} changeStyle = {this.changeStyle} key = {currentCoin.id}/>;
    })
  }

  render() {
    return (
      <div className= "resposiveTable">
        <h3 style = {{color:'#FFFFFF'}}>Coin Tracker</h3>
        <div style = {{color:'#FFFFFF'}}>DateFilter:     
          <DatePicker 
            selected = {this.state.date}
            onChange = {this.onChangeDate}
          />
        </div>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Coin</th>
              <th><button onClick = {() => this.requestSort('price')}>Price</button></th>
              <th>24h</th>
              <th>7d</th>
              <th>30d</th>
              <th><button onClick = {() => this.requestSort('volume')}>24h volume</button></th>
              <th><button onClick = {() => this.requestSort('marketCap')}>Market Cap​</button></th>
            </tr>
          </thead>
          <tbody>
            { this.coinList() }
          </tbody>
        </table>
      </div>
    );
  }
}
