import express = require('express');
import { Tedis, TedisPool } from "tedis";
import {GlobalData} from "../config/global"

const app: express.Application = express();
const redisObj = require('../config/redisutils.ts')
// 记录 redis和 mongoodb的连接状态,是否连接
const global=new GlobalData()


const mongoose = require('mongoose')
const dbconfig = require('../config/database.ts')
const redisConn: Tedis = redisObj.tedis

// redis connection event
redisConn.on('error', function (error:string) {
    console.log("redis connection failed")
    global.redisConnected = false;
})

redisConn.on('connect', function (error:string) {
    console.log("redis connection done")
    global.redisConnected = true;
})


mongoose.connect(dbconfig.url)
// mongoodb connection event
mongoose.connection.on('error',function(error:any) {
    global.dbConnected = false;
})
mongoose.connection.on('connected',function(error:any) {
    global.dbConnected = true;
})

// form body parse
app.use(require('body-parser')());
//view engine
app.set('view engine', 'ejs')
// route script
require("./router.ts")(app, redisConn, global)

// start listen
app.listen(8888,function(){
    console.log('Example app listening on port 8888!');
})