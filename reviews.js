const fs = require('fs');
const axios = require('axios').default;
const rateLimit = require('axios-rate-limit');


const dotenv = require('dotenv');
dotenv.config();

let endpoint = "https://api.thinkific.com/api/public/v1/";
let key = process.env.API_KEY;
let subdomain = process.env.API_DOMAIN;
let headers = {
    'X-Auth-API-Key': key,
    'X-Auth-Subdomain': subdomain,
    'Content-Type': 'application/json'
};
const http = rateLimit(axios.create(), { maxRequests: 2, perMilliseconds: 1000, maxRPS: 2 })
let rawdata = fs.readFileSync(process.env.DIST+'courses.json');
var courses = JSON.parse(rawdata);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
const get_reviews = function(index,page){
    var url= endpoint+"course_reviews?limit=250&course_id="+courses[index].id+"&page="+page;
    //console.log(url);
    return http({
        method: 'get',
        url: url,
        headers: headers
        
      })
      .then(function (response) {
            var items = response.data.items;
            var meta = response.data.meta;
            console.log(" got reviews "+courses[index].name + " Page: "+page+ " Items:"+items.length + " meta:"+meta.pagination.total_items);
            
            courses[index].total_reviews = meta.pagination.total_items;
            items.forEach(item => {
                if(typeof(courses[index].reviews)=="undefined"){
                    //try to load existing ones, otherwise start with blank
                    try {
                        courses[index].reviews = JSON.parse(fs.readFileSync(process.env.DIST+"reviews/"+courses[index].id+'.json'));

                    } catch (error) {
                        courses[index].reviews = [];
                    }
                    
                }
                // if already exists then do not push
                // because we do not want to overwrite the user
                var _index = courses[index].reviews.findIndex(function(review, index) {
                    if(review.id == item.id)
                        return true;
                });  
                if(_index == -1){
                    courses[index].reviews.push(item);
                    console.log("New Review")
                }
                
            });
            var keep_going = false;
            if(meta.pagination.next_page!=null){
                keep_going = true;
                if(courses[index].id==453119 && meta.pagination.next_page >2){
                    keep_going = false;
                }
            }
            if(keep_going){
                sleep(2000).then(() => { return get_reviews(index,meta.pagination.next_page) });                
                
            } else {
                console.log("Writing review file: "+ courses[index].id)
                fs.writeFileSync(process.env.DIST+"reviews/"+courses[index].id+'.json', JSON.stringify(courses[index].reviews));
                return;
            }
      })
      .catch(function (error) {
        // handle error
        console.log("Error getting reviews")
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
          }
          console.log(error.config);        
      })
}

console.log("Getting Reviews");

for (let index = 0; index < courses.length; index++) {
    const element = courses[index];
    get_reviews(index,1)
    
}



// let rawdata = fs.readFileSync('people.json');
// let people = JSON.parse(rawdata);

// people.people.push({
//     'firstname': 'Steve',
//     'lastname': 'Jobs'
// });

// fs.writeFileSync('people.json', JSON.stringify(people));