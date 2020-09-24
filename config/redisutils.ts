import { Tedis, TedisPool } from "tedis";
var _ip ='127.0.0.1'
var _port =6379
module.exports = {
    ip: _ip,
    port:_port,
    tedis : new Tedis({
        port: _port,
        host: _ip
      })
  }