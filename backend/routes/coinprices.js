const router = require('express').Router();
let CoinPrice = require('../models/coinprice.model');

router.route('/').get((req, res) => {
    var firstDay = req.query.date === undefined ? new Date() : new Date(req.query.date);
  var oneDayBefore = new Date(firstDay);
  var sevenDayBefore = new Date(firstDay);
  var oneMonthBefore = new Date(firstDay);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  sevenDayBefore.setDate(sevenDayBefore.getDate() - 7);
  oneMonthBefore.setDate(oneMonthBefore.getDate() - 30);
  const query = req.query.date === undefined ? {} : {date : {$in:[firstDay, oneDayBefore, sevenDayBefore, oneMonthBefore]}};
  CoinPrice.find(query)
    .then(coinprices => {
      console.log(coinprices)
      res.json(coinprices)}) 
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;