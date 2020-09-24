import express=require('express');
import {GlobalData} from "../config/global"

const app:express.Application=express();
var redis = require('../config/redisutils.ts')
var global=new GlobalData()

var mongoose = require('mongoose')
var configDB = require('../config/database.ts')
var client = redis.tedis

client.on('error', function (error:string) {
    console.log("redis connection failed")
    global.redisConnected = false;
})

client.on('connect', function (error:string) {
    console.log("redis connection done")
    global.redisConnected = true;
})

mongoose.connect(configDB.url)
mongoose.connection.on('error',function(error:any) {
    global.dbConnected = false;
})
mongoose.connection.on('connected',function(error:any) {
    global.dbConnected = true;
})
app.use(require('body-parser')());
app.set('view engine', 'ejs')

require("./router.ts")(app,client,global)
    
app.listen(8888,function(){
    console.log('Example app listening on port 8888!');
})