//https://iexcloud.io/console/---stock data api

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const fetch = require('node-fetch');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(function (req, res){
    var like  = req.query.like //undefined or true    
    var stockdata = []
    var stock = req.query.stock1.toUpperCase()
    var stock2 = req.query.stock2
    if (stock2) { 
      stock=[];
      stock.push(req.query.stock1.toUpperCase());
      stock.push(stock2.toUpperCase());}
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, client) {
      var ip    = req.headers['x-forwarded-for']
      var db = client.db("Stock");  
      if(Array.isArray(stock)){
        for(var i=0; i<2; i++){      
        fetch('https://cloud.iexapis.com/stable/stock/'+ stock[i] +'/quote?token=sk_7339686ee6c84a6aa6490689b505f700')
        .then(res => res.json())
        .then(json =>{
                      if (like != undefined){
                      db.collection("stock").findOneAndUpdate({stockName: json.symbol},  {'$set': {stockName: json.symbol},'$addToSet': {ip: ip}}, {returnOriginal:false, upsert: true}, function(err, docs){
                      if (err) {res.json(err);
                                console.log(err)};
                        stockdata.push({"stock":json.symbol, "price": json.latestPrice,"likes":docs.value.ip.length});
                        console.log("likes", docs.value.ip.length)
                        // console.log("like", stockdata)
                        if(stockdata.length===2){
                          console.log(json.symbol,docs.value.ip.length)
                          res.json({"stockData":[{"stock":stockdata[0].stock, "price": stockdata[0].price,"rel_likes":stockdata[0].likes-stockdata[1].likes},
                                   {"stock":stockdata[1].stock, "price": stockdata[1].price,"rel_likes":stockdata[1].likes-stockdata[0].likes}]})
                        }
                        
                      });}else{
                        db.collection("stock").findOneAndUpdate({stockName: json.symbol}, {'$set': {stockName: json.symbol}, '$setOnInsert': {ip:[]}}, {returnOriginal:false, upsert: true}, function(err, docs){
                        if (err) {res.json(err);
                                console.log(err)}  
                          
                        stockdata.push({"stock":json.symbol, "price": json.latestPrice,"likes":docs.value.ip.length});
                          console.log("likes", docs.value.ip.length)
                        // console.log("nolike", stockdata)
                        if(stockdata.length===2){
                          console.log(stockdata[0].likes)
                          console.log(stockdata[1].likes)
                          res.json({"stockData":[{"stock":stockdata[0].stock, "price": stockdata[0].price,"rel_likes":stockdata[0].likes-stockdata[1].likes},
                                      {"stock":stockdata[1].stock, "price": stockdata[1].price,"rel_likes":stockdata[1].likes-stockdata[0].likes}]})
                        }
                      });
                      }                      
                      })
          
          };
        }else{
          console.log(stock)
          fetch('https://cloud.iexapis.com/stable/stock/'+ stock +'/quote?token=sk_7339686ee6c84a6aa6490689b505f700')
        .then(res => res.json())
        .then(json =>{
                      if (like != undefined){
                      db.collection("stock").findOneAndUpdate({stockName: json.symbol},  {'$set': {stockName: json.symbol},'$addToSet': {ip: ip}}, {returnOriginal:false, upsert: true}, function(err, docs){
                      if (err) {res.json(err);
                                console.log(err)};
                        stockdata.push({"stock":json.symbol, "price": json.latestPrice,"likes":docs.value.ip.length});
                        console.log(stockdata)
                        // console.log("like", stockdata)        
                          res.json({"stockData":stockdata[0]}) 
                      });}else{
                        db.collection("stock").findOneAndUpdate({stockName: json.symbol}, {'$set': {stockName: json.symbol}, '$setOnInsert': {ip:[]}}, {returnOriginal:false, upsert: true}, function(err, docs){
                        if (err) {res.json(err);
                                console.log(err)}  
                          console.log(json.symbol,docs.value.ip.length)
                        stockdata.push({"stock":json.symbol, "price": json.latestPrice,"likes":docs.value.ip.length});
                        // console.log("nolike", stockdata)
                          res.json({"stockData":stockdata[0]})
                      });
                      }                      
                      })
          
          };
    })
        })
      }
