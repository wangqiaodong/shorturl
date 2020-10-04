import express=require('express');
import { Tedis } from 'tedis';
import {GlobalData} from "../config/global"
let ShortUrl = require('../model/url.ts')
const stringRandom = require('string-random');

const urlprefix="http://111.229.246.43:8888/s/";
module.exports = function (app:express.Application,redis:Tedis, global:GlobalData) {
    
    app.get('/',function(req,res) {
        res.render("index.ejs")
    });

    // short link response
  app.post('/link/short', async function (req, res) {
    // validate url param
    if (req.body.url == null
      || req.body.url == undefined
      || req.body.url == "") {
      return res.send("参数错误").end();
    }

    // check if it start from https or http
    // for the moment, only support http because of my own web server
    if (!req.body.url.toString().startsWith("https://")
      && !req.body.url.toString().startsWith("http://")) {
      return res.send("参数错误").end();
    }

    let result = undefined
    if (global.redisConnected
      && redis != null
      && redis != undefined) {
      result = await redis.get(req.body.url);
    }

    // it is not set or not in redis
    if (result == undefined || result == null || result == "") {
      // mongoose not ready
      if (!global.dbConnected) {
        let url = new ShortUrl();
        url.shortUrl = urlprefix + stringRandom();
        url.fullUrl = req.body.url;
        if (redis != null && redis != undefined) {
          redis.set(url.fullUrl, url.shortUrl);
          redis.set(url.shortUrl, url.fullUrl);
        }
        res.send(url.shortUrl).end();
        return;
      } else {
        //search from database
        ShortUrl.findOne({ 'fullUrl': req.body.url }, function (error: any, shorturl: any) {
          if (shorturl != null) {
            res.send(shorturl.shortUrl);
            return res.end();
          } else {
            //new
            let url = new ShortUrl();
            url.shortUrl = urlprefix + stringRandom();
            url.fullUrl = req.body.url;
            if (redis != null
              && redis != undefined
              && global.redisConnected) {
              redis.set(url.fullUrl, url.shortUrl);
              redis.set(url.shortUrl, url.fullUrl);
            }
            url.save(function (error: any) {
              console.log("save to db:" + error);
            })

            res.send(url.shortUrl);
            return res.end();


          }
        })
      }


    } else {
      res.send(result)
      return res.end();
    }
  });

	
    app.post('/link/full/',async function(req,res){
        if(req.body.url == null
            || req.body.url == undefined
            || req.body.url==""
			|| !req.body.url.startsWith(urlprefix))
            {
                return res.send("参数错误").end();
            }
			
		return getfullUrl(req.body.url,function(r:string){
			return res.send(r).end();
		});
		
        let result = undefined
        if(global.redisConnected)
        {
            result = await redis.get(req.body.url);
            
        }
        if(result==undefined||result==null||result=="")
        {
            if(!global.dbConnected) {
                return res.send("not found！").end();
            }else{
                //再查找数据库
                ShortUrl.findOne({'shortUrl':req.body.url},function(error: any,shorturl: any) {
                    if(shorturl != null)
                    {
                        return res.send(shorturl.fullUrl).end();
                    }else{
                       
                        return res.send("not found！").end();
                    }
                })
            }
            
            
        }else{
            return res.send(result).end();
        }
    });

    app.get('/s/:url',function(req,res){
		//res.send(req.params.url).end();
		let shorturl = urlprefix+req.params.url;
		
		return getfullUrl(shorturl,function(r:string){
			if(r.startsWith("http"))
				res.redirect(r);
			else res.send(r).end();
		});
    });
	
	
	async function getfullUrl(shortUrl:string,func:any)
	{
		var result = undefined
        if(global.redisConnected)
        {
            result = await redis.get(shortUrl);
            
        }
        if(result==undefined||result==null||result=="")
        {
            if(!global.dbConnected) {
                //return res.send("not found！").end();
				return func("not found！");
            }else{
                //再查找数据库
                ShortUrl.findOne({'shortUrl':shortUrl},function(error: any,shorturl: any) {
                    if(shorturl != null)
                    {
                        //return res.send(shorturl.fullUrl).end
						return func(shorturl.fullUrl);
                    }else{
                       
                        //return res.send("not found！").end();
						return func("not found！");
                    }
                })
            }
            
            
        }else{
            //return res.send(result).end();
			return func(result);
        }
	}
}  