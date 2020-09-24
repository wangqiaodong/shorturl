import express=require('express');
import { Tedis } from 'tedis';
import {GlobalData} from "../config/global"
var ShortUrl = require('../model/url.ts')
const stringRandom = require('string-random');

const urlprefix="http://111.229.246.43:8888/s/";
module.exports = function (app:express.Application,redis:Tedis, global:GlobalData) {
    
    app.get('/',function(req,res) {
        res.render("index.ejs")
    });
    app.post('/link/short',async function(req,res){
        if(req.body.url == null
            || req.body.url == undefined
            || req.body.url=="")
            {
                return res.send("参数错误").end();
            }

            if(!req.body.url.toString().startsWith("https://")
            &&!req.body.url.toString().startsWith("http://"))
            {
                return res.send("参数错误").end();
            }
        var result = undefined
        if(global.redisConnected)
        {
            result = await redis.get(req.body.url);
        }
        if(result==undefined||result==null||result=="")
        {
            if(!global.dbConnected) {
                var url = new ShortUrl();
                url.shortUrl=urlprefix+ stringRandom();
                url.fullUrl = req.body.url;
                if(redis!=null&&redis !=undefined)
                {
                    redis.set(url.fullUrl,url.shortUrl);
                    redis.set(url.shortUrl,url.fullUrl);
                }
                res.send(url.shortUrl).end();
                return;
            }else{
                console.log("connected");
                //再查找数据库
                ShortUrl.findOne({'fullUrl':req.body.url},function(error: any,shorturl: any) {
                    if(shorturl != null)
                    {
                        res.send(shorturl.shortUrl);
                        return res.end();
                    }else{
						console.log("new url entity into db");
                        //new
                        var url = new ShortUrl();
                        url.shortUrl=urlprefix + stringRandom();
                        url.fullUrl = req.body.url;
                        if(redis!=null&&redis !=undefined)
                        {
                            redis.set(url.fullUrl,url.shortUrl);
                            redis.set(url.shortUrl,url.fullUrl);
                        }  
                        url.save(function(error:any) {
                            console.log("save "+ error);
                        })

                        res.send(url.shortUrl);
                        return res.end();
                        
                        
                    }
                })
            }
            
            
        }else{
            res.send(result)
            return res.end();
        }
        //res.send(result);
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
		
        var result = undefined
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
		var shorturl = urlprefix+req.params.url;
		
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