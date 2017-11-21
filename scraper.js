var fs = require('fs');
var json2csv = require('json2csv');//package for making csv files, last updated a month ago, with 10,000 downloads per day
var request = require('request');//package for making http calls, last updated 2 months ago, with 1.3 million downloads per day
var cheerio = require('cheerio');//package for scrapping websites, last updated 6 months ago, with 200,000 downloads per day
var path = require('path');
var fields = ['Title', 'Price', 'Image URL', 'URL'];//column names for the csv file
var dir = './data';
var output = './data/';
var error = './scrapper_error.log';
var rimraf = require('rimraf');//package for deleting files, last updated 2 months ago, with 1 million downloads in the last day
var defferedPromise = Promise.defer();//usage of promises to scrape the content
var promise = defferedPromise.promise

promise.then((err) => {
    if(!fs.existsSync(dir)){ //if data folder does not exist create the data folder
        fs.mkdirSync(dir);
    }
    else if(fs.existsSync(dir)){// if data folder does exist remove all files
        rimraf(dir, ()=>{
            fs.mkdirSync(dir);
        });
        rimraf('./scrapper_error.log',()=>{//delete the scrapper_error.log file when scraping works
           
        }); 
    }
    }).then((err,obj) => {
       var urls = [];
       request('http://www.shirts4mike.com/shirts.php', (err, res, html)=>{//entry point for the website to be scraped 
            if(err){
                var today = new Date();//generate the current date
                var errorjson = '[' + today + ']' + "There was an error when scraping the site. " + err;
                fs.writeFile('./scrapper_error.log', errorjson, (err)=>{//write error log file if connection error
                });
                console.log("There's been a 404 error. Cannot connect to http://shirts4mike.com");//log error message
            }
            if (!err && res.statusCode == 200){
                var $ = cheerio.load(html);
                var arr = [];
                var counter = 0;
                
                $('.products li').each(function(index, value){//scrape thru the individual shirt urls
                    urls.push(value.children[0].attribs['href']);
                });
                for (var i = 0 ; i < urls.length; i++){ 
                    request('http://www.shirts4mike.com/' + urls[i], (err, res, body) =>{
                        if (!err && res.statusCode == 200){
                            counter++;
                            var $ = cheerio.load(body);
                            var item = new Object();
                            var fields = ['Title', 'Price', 'Image URL', 'URL', 'Time'];
                            var today = new Date();
                            
                            $('.shirt-details h1').each((index, value) => {//scrape the title of the shirt
                                item.Title = value.children[1].data;
                            });
                            $('.price').each((index, value) => {//scrape the price of the shirt
                                item.Price = value.children[0].data;
                            });
                            $('span img').each((index, value) => {
                                item["Image URL"] = 'http://www.shirts4mike.com/'+ value.attribs['src'];//scrape the image url of the shirt
                                item.URL = ('http://www.shirts4mike.com/' + value.attribs['src']).slice(0, 27)+'shirt.php?id=' + (value.attribs['src']).slice(17,20); //scrape the url of the shirt
                                item.Time = today;  //generate the time of current date
                            });
                            arr[counter] = item;
                            var today = new Date();
                            var year = today.getFullYear();
                            var month = today.getMonth()+1;
                            var day = today.getDate();
                            if (year< 10){//make the data to YYYY-MM-DD
                                year = '0'+year;
                            }
                            if (month< 10){
                                month = '0'+month;
                            }
                            if (day< 10){
                                day = '0'+day;
                            }
                            today = year + '-' + month + '-' + day;//generate the date string
                            
                                var csv = json2csv({ data: arr, fields: fields});
                                fs.writeFile('./data/' + today +'.csv', csv, function(err) {//create the csv file containing the scraped contents and give it the name of the current data
                                    if (csv.length <= 54){//if scrapping error log human friendly error message and create the scrappe_error.log file
                                        var errorjson = "Invalid api request url";
                                        console.log('Invalid api request url');
                                        fs.writeFile('./scrapper_error.log', errorjson, (err)=>{
                                        });
                            }
                        });         
                }
            })
        } 
    }
    else{
        console.log(err);//if error log it out 
    }
});    
        }).catch((err)=>{
            console.log(err);//if error log it out
        })
        defferedPromise.resolve(); //resolve the deffered promise


          
