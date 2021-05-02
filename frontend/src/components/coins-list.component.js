import React, { useState, useEffect } from 'react';
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

export default function CoinsList(props){
  const [date, setDate] = useState(new Date('2019-12-04'));
  const [coins, setCoins] = useState([]);
  const [sortConfig,setSortConfig] = useState({key:'marketCap', direction:'descending'});

  useEffect (() => {
    console.log("getCoinData",date.toISOString());
    axios.get('http://localhost:5000/coinprices/',{params: {date : date}})
      .then(response => {
        if(response.data.length === 0){
          setDate([]);
          return;
        }
        processCoinData(response.data, date);
    })
      .catch((error) => {
        console.log(error)
      })
  }, [date]);

  const processCoinData = (data, date) => {
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
        return -1;
      }
      if (a.marketCap < b.marketCap) {
        return 1;
      }
      return 0;
    })
    setCoins(processedData);
  }
  
  const requestSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    sortCoins(key,direction);
  }

  const coinList = () => {
    console.log("coinList:",coins);
    return coins.map(currentCoin => {
      return <Coin coin={currentCoin} changeStyle = {changeStyle} key = {currentCoin.id}/>;
    })
  }

  const sortCoins = (key,direction) => {
    console.log(direction)
    coins.sort((a, b) => {
      if (a[key] < b[key]){
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]){
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    })
  }

  const changeStyle = (data) => {
    if(data === undefined){
      return { 
        
      };
    }
    return {
      color: (data <= 0) ? '#4caf50' : '#e53935'
    }
  }
  
  return (
    <div className= "resposiveTable">
      <h3 style = {{color:'#FFFFFF'}}>Coin Tracker</h3>
      <div style = {{color:'#FFFFFF'}}>DateFilter:     
        <DatePicker 
          selected = {date}
          onChange = {(date) => setDate(date)}
        />
      </div>
      <table className="table">
        <thead className="thead-light">
          <tr>
            <th>Coin</th>
            <th><button onClick = {() => requestSort('price')}>Price</button></th>
            <th>24h</th>
            <th>7d</th>
            <th>30d</th>
            <th><button onClick = {() => requestSort('volume')}>24h volume</button></th>
            <th><button onClick = {() => requestSort('marketCap')}>Market Cap​</button></th>
          </tr>
        </thead>
        <tbody>
          {coinList()}
        </tbody>
      </table>
    </div>
  );
}