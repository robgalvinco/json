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
        reviews.forEach((review,i) => {
            try {
                console.log("\t\t Getting user: "+review.user_id);
                var user = JSON.parse(fs.readFileSync(process.env.DIST+"review-users/"+review.user_id+'.json'));
                reviews[i].username = user.full_name;
            } catch (error) {
                console.log("No user found");
            }
    
    
        }); 
        fs.writeFileSync(process.env.DIST+"reviews/"+courses[index].id+'.json', JSON.stringify(reviews));       
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