var mongoose = require('mongoose')

//������schema
var ShortUrlSchema = mongoose.Schema({
    shortUrl: String, //�������ֶΣ�
    fullUrl: String //�������ֶ�
})

module.exports = mongoose.model('ShortUrl', ShortUrlSchema)