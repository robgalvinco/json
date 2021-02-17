const fs = require('fs');
const axios = require('axios').default;

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
var courses = [];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


console.log("Getting Instructors");
axios({
    method: 'get',
    url: endpoint+"instructors?limit=250",
    headers: headers
    
  })
  .then(function (c_response) {
        var items = c_response.data.items;
        items.forEach(item => {
            fs.writeFileSync(process.env.DIST+'instructors/'+item.id+'.json', JSON.stringify(item));
            courses.push(item);
        });
      
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
      fs.writeFileSync(process.env.DIST+'instructors.json', JSON.stringify(courses));
      console.log("done");
  });


// let rawdata = fs.readFileSync('people.json');
// let people = JSON.parse(rawdata);

// people.people.push({
//     'firstname': 'Steve',
//     'lastname': 'Jobs'
// });

// fs.writeFileSync('people.json', JSON.stringify(people));