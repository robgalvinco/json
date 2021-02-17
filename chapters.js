/* gets all chapters for courses and creates a course_id.json inside of the chapters folder */
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
let rawdata = fs.readFileSync(process.env.DIST+'courses.json');
var courses = JSON.parse(rawdata);
const http = rateLimit(axios.create(), { maxRequests: 2, perMilliseconds: 1000, maxRPS: 2 })

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const get_chapters = function(course_id,page){
    var url= endpoint+"courses/"+course_id+"/chapters?limit=250&page="+page;
    console.log(url);
    return http({
        method: 'get',
        url: url,
        headers: headers
        
      })
      .then(function (response) {
            var items = response.data.items;
            var meta = response.data.meta;
            fs.writeFileSync(process.env.DIST+"chapters/"+course_id+'.json', JSON.stringify(items));
            var keep_going = false;
            if(meta.pagination.next_page!=null){
                keep_going = true;
                
            }
            if(keep_going){
                sleep(2000).then(() => { return get_chapters(index,meta.pagination.next_page) });                
                
            } else {
                return;
            }
      })
      .catch(function (error) {
        // handle error
        console.log("Error getting items")
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



console.log("Getting Chapters");
courses.forEach(course => {
  
    get_chapters(course.id,1)
  
  
});



// let rawdata = fs.readFileSync('people.json');
// let people = JSON.parse(rawdata);

// people.people.push({
//     'firstname': 'Steve',
//     'lastname': 'Jobs'
// });

// fs.writeFileSync('people.json', JSON.stringify(people));