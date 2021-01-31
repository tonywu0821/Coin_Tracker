//const mongodb = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const CoinPrice = require('./models/coinprice.model');
const csvtojson = require("csvtojson");

let uri = "mongodb+srv://metestapi:metestapi@cluster0.ix6fw.gcp.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
  );
  
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
 
  var i = 0;
  csvtojson()
  .fromFile("crypto_historical_data.csv")
  .then(csvData => {
    csvData.forEach(element => {
      const currency = element['Currency'];
      // because the data string is someting like 'Nov 30, 19' 
      const date = Date.parse(element['Date']) - (new Date().getTimezoneOffset() * 60 * 1000);
      const open = Number(element['Open'].replace(/,/g,""));
      const high = Number(element['High'].replace(/,/g,""));
      const low = Number(element['Low'].replace(/,/g,""));
      const close = Number(element['Close'].replace(/,/g,""));
      const volume = Number(element['Volume'].replace(/,/g,""));
      const marketCap = Number(element['Market Cap'].replace(/,/g,""));
      const newCoinPrice = new CoinPrice({
        currency,
        date,
        open,
        high,
        low,
        close,
        volume,
        marketCap,
      });
      //console.log(i);
      //console.log(newCoinPrice);
      newCoinPrice.save(function(err, doc) {
      if (err) return console.error(newCoinPrice);
      console.log("Document inserted succussfully!");
      });
      i += 1;
    });
    console.log("end..")
  });
})

  