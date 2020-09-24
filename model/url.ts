var mongoose = require('mongoose')

var ShortUrlSchema = mongoose.Schema({
    shortUrl: String, //investor
    fullUrl: String
})

module.exports = mongoose.model('ShortUrl', ShortUrlSchema)