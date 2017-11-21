var fs = require('fs');
var json2csv = require('json2csv');
var request = require('request');
var cheerio = require('cheerio');//scrapping package
var path = require('path');
var fields = ['Title', 'Price', 'ImageURL', 'URL'];//column names for csv file
var dir = './data';
var output = './data/';//path of the output data
var error = './scrapper_error.log';//log file that will be created in case of an error 
var fileSaver = require('file-saver');
var rimraf = require('rimraf');//package to delete files
var defferedPromise = Promise.defer();//promise object
var promise = defferedPromise.promise

promise.then((err) => {
    if(!fs.existsSync(dir)){ //making data folder if data folder does not exist
        fs.mkdirSync(dir);
    }
    else if(fs.existsSync(dir)){//if data folder exists delete current files 
        rimraf(dir, ()=>{
            fs.mkdirSync(dir);
        });
        rimraf('./scrapper_error.log',()=>{//delete error .log file if internet connection is avaiable
            console.log('deleted log file');
        }); 
    }
    }).then((err,obj) => {
       var urls = [];
       request('http://www.shirts4mike.com/shirts.php', (err, res, html)=>{//the entry point of the website to be scrapped
            if(err){
                var today = new Date();
                var errorjson = '[' + today + ']' + err;
                fs.writeFile('./scrapper_error.log', errorjson, (err)=>{
                });
                console.log("There's been a 404 error. Cannot connect to http://shirts4mike.com");
            }
            if (!err && res.statusCode == 200){//if no errors load cheerio
                var $ = cheerio.load(html);
                var arr = [];
                var counter = 0;
                
                $('.products li').each(function(index, value){//look in .products li for the hrefs of the shirt urls to be scrapped
                    urls.push(value.children[0].attribs['href']);
                });
                for (var i = 0 ; i < urls.length; i++){ //look in each of the shirt urls for the relevant information
                    request('http://www.shirts4mike.com/' + urls[i], (err, res, body) =>{
                        if (!err && res.statusCode == 200){
                            counter++;
                            var $ = cheerio.load(body);
                            var item = new Object();
                            var fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
                            var today = new Date();
                            
                            $('.shirt-details h1').each((index, value) => {//scraping the title of the shirt
                                item.Title = value.children[1].data;
                            });
                            $('.price').each((index, value) => {
                                item.Price = value.children[0].data;//scraping the price of the shirt
                            });
                            $('span img').each((index, value) => {
                                item.ImageURL = 'http://www.shirts4mike.com/'+ value.attribs['src'];//scraping the image url of the shirt
                                item.URL = ('http://www.shirts4mike.com/' + value.attribs['src']).slice(0, 27)+'shirt.php?id=' + (value.attribs['src']).slice(17,20);//scraping the url of the shirt
                                item.Time = today;//assigning the time of when the scraping was done 
                            });
                            arr[counter] = item;//sending shirt information object to an array
                            var today = new Date();//getting the current date
                            var year = today.getFullYear();
                            var month = today.getMonth()+1;
                            var day = today.getDate();
                            if (year< 10){//formating the data to YYYY-MM-DD
                                year = '0'+year;
                            }
                            if (month< 10){//formating the data to YYYY-MM-DD
                                month = '0'+month;
                            }
                            if (day< 10){//formating the data to YYYY-MM-DD
                                day = '0'+day;
                            }
                            today = year + '-' + month + '-' + day;//making the current data string
                            
                                var csv = json2csv({ data: arr, fields: fields});
                                fs.writeFile('./data/' + today +'.csv', csv, function(err) {//writing the csv file containing the scraped shirt information and giving it the name of the current date
                                    if (csv.length <= 54){//if scraping failed make error file 
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
        console.log(err);
    }
});    
        }).then((arr) => {
            console.log(arr);//console.log errrors
        }).catch((err)=>{
            console.log('!!!');//console.log errors
        })
        defferedPromise.resolve();//starting the resolve function of the deffered promise


          
