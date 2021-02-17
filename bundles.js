const fs = require('fs');
const axios = require('axios').default;
const rateLimit = require('axios-rate-limit');
const http = rateLimit(axios.create(), { maxRequests: 2, perMilliseconds: 1000, maxRPS: 2 })

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



var products = JSON.parse(fs.readFileSync(process.env.DIST+'products.json'));

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


console.log("Getting Bundles");
products.forEach(product => {
    if(product.productable_type =="Bundle"){
        console.log(product.name+":"+product.productable_id)
        http({
            method: 'get',
            url: endpoint+"bundles/"+product.productable_id,
            headers: headers
            
          })
          .then(function (response) {
                //console.log(response.data);
                fs.writeFileSync(process.env.DIST+'bundles/'+product.productable_id+'.json', JSON.stringify(response.data));
                
          })
          .catch(function (error) {
            // handle error
            //console.log(error);
          })
    }
});



// let rawdata = fs.readFileSync('people.json');
// let people = JSON.parse(rawdata);

// people.people.push({
//     'firstname': 'Steve',
//     'lastname': 'Jobs'
// });

// fs.writeFileSync('people.json', JSON.stringify(people));