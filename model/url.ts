var mongoose = require('mongoose')

//短域名schema
var ShortUrlSchema = mongoose.Schema({
    shortUrl: String, //短域名字段，
    fullUrl: String //长域名字段
})

module.exports = mongoose.model('ShortUrl', ShortUrlSchema)