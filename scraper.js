var fs = require('fs');
var json2csv = require('json2csv');
var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var fields = ['Title', 'Price', 'ImageURL', 'URL'];
var dir = './data';
var output = './data/';
var error = './scrapper_error.log';
var fileSaver = require('file-saver');
var rimraf = require('rimraf');
var defferedPromise = Promise.defer();
var promise = defferedPromise.promise

promise.then((err) => {
    if(!fs.existsSync(dir)){ 
        fs.mkdirSync(dir);
    }
    else if(fs.existsSync(dir)){
        rimraf(dir, ()=>{
            fs.mkdirSync(dir);
        });
        rimraf('./scrapper_error.log',()=>{
            console.log('deleted log file');
        }); 
    }
    }).then((err,obj) => {
       var urls = [];
       request('http://www.shirts4mike.com/shirts.php', (err, res, html)=>{
            if(err){
                var today = new Date();
                var errorjson = '[' + today + ']' + err;
                fs.writeFile('./scrapper_error.log', errorjson, (err)=>{
                });
                console.log("There's been a 404 error. Cannot connect to http://shirts4mike.com");
            }
            if (!err && res.statusCode == 200){
                var $ = cheerio.load(html);
                var arr = [];
                var counter = 0;
                
                $('.products li').each(function(index, value){
                    urls.push(value.children[0].attribs['href']);
                });
                for (var i = 0 ; i < urls.length; i++){ 
                    request('http://www.shirts4mike.com/' + urls[i], (err, res, body) =>{
                        if (!err && res.statusCode == 200){
                            counter++;
                            var $ = cheerio.load(body);
                            var item = new Object();
                            var fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
                            var today = new Date();
                            
                            $('.shirt-details h1').each((index, value) => {
                                item.Title = value.children[1].data;
                            });
                            $('.price').each((index, value) => {
                                item.Price = value.children[0].data;
                            });
                            $('span img').each((index, value) => {
                                item.ImageURL = 'http://www.shirts4mike.com/'+ value.attribs['src'];
                                item.URL = ('http://www.shirts4mike.com/' + value.attribs['src']).slice(0, 27)+'shirt.php?id=' + (value.attribs['src']).slice(17,20);
                                item.Time = today;   
                            });
                            arr[counter] = item;
                            var today = new Date();
                            var year = today.getFullYear();
                            var month = today.getMonth()+1;
                            var day = today.getDate();
                            if (year< 10){
                                year = '0'+year;
                            }
                            if (month< 10){
                                month = '0'+month;
                            }
                            if (day< 10){
                                day = '0'+day;
                            }
                            today = year + '-' + month + '-' + day;
                            
                                var csv = json2csv({ data: arr, fields: fields});
                                fs.writeFile('./data/' + today +'.csv', csv, function(err) {
                                    if (csv.length <= 54){
                                    var errorjson = "Invalid api request url";
                                    fs.writeFile('./scrapper_error.log', errorjson, (err)=>{
                                    });
                            }
                        });         
                }
            })
        } 
    }
    else{
        console.log(err);
    }
});    
        }).then((arr) => {
            console.log(arr);
        }).catch((err)=>{
            console.log('!!!');
        })
        defferedPromise.resolve(); 


          