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
const http = rateLimit(axios.create(), { maxRequests: 2, perMilliseconds: 1500, maxRPS: 2 })
let rawdata = fs.readFileSync(process.env.DIST+'courses.json');
var courses = JSON.parse(rawdata);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

console.log("Getting Reviews");

for (let index = 0; index < courses.length; index++) {
    const course = courses[index];
    console.log(courses[index].id + " "+ courses[index].name)
    try {
        var reviews = JSON.parse(fs.readFileSync(process.env.DIST+"reviews/"+courses[index].id+'.json'));
        console.log("\t\t Getting Reviews:"+ reviews.length);
        reviews.forEach(review => {
            if(typeof(review.username)=="undefined" || review.username==""){
                console.log("getting user");
                http({
                    method: 'get',
                    url: endpoint+"users/"+review.user_id,
                    headers: headers
                    
                  })
                  .then(function (response) {
                        //console.log(response.data);
                        var r = response.data;
                        var user = {
                            id : r.id,
                            first_name: r.first_name,
                            last_name: r.last_name,
                            full_name: r.full_name
                        }
                        console.log("Writing "+user.id +" " +user.first_name);
                        fs.writeFileSync(process.env.DIST+'review-users/'+review.user_id+'.json', JSON.stringify(user));
                        
                  })
                  .catch(function (error) {
                    // handle error
                    //console.log(error);
                  })
            } else {
                console.log("\t\t\tskipping user")
            }

    
    
        });        
    } catch (error) {
        console.log("\t\tNo Reviews");
    }

    
    
}



// let rawdata = fs.readFileSync('people.json');
// let people = JSON.parse(rawdata);

// people.people.push({
//     'firstname': 'Steve',
//     'lastname': 'Jobs'
// });

// fs.writeFileSync('people.json', JSON.stringify(people));