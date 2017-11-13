const Xray = require('x-ray');
const fs = require('fs');
const json2csv = require('json2csv');
var myData = [];
const cheerios = require('cheerio');
const xray = Xray();
var fields = ['link', 'details.price', 'details.title', 'details.image'];

xray('http://www.reddit.com', '#thing_t3_7adq9w', [{
    title:'.title',
    imgLink:'a.thumbnail img@src',
    img:'a@data-href-url',
    submitTime:'.live-timestamp',
    tagline: '.author'
}])
(function(err, obj){
    for(var i = 0 ; i < obj.length; i++){
        myData.push(obj[i]);
    }
    var today = new Date();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();
    today = hours + ':' + minutes + ':' + seconds;
    fs.writeFile(today+'.csv', csv, function(err) {
        if (err) throw err;
        console.log('file saved');
      });

})