# Instructions

## Requirements
1. Node.JS must be installed
2. NPM Must be installed
3. For deploy script must have git installed and access to the repo

## Initial setup
1 Run `npm install` command at terminal from this folder

2 Create a file `.env` and put these contents inside

    API_KEY=[GET KEY FROM API PAGE]
    API_DOMAIN=[GET DOMAIN FROM API PAGE]
    DIST=public/


## Updating Reviews JSON
1. Run `./reviews.sh` command at terminal from this folder

This will update all of the JSON files (locally) for reviews 

## Creating JSON
1. Run `./generate.sh` command at terminal from this folder

This will update all of the JSON files (locally) for product info


## Deploying
1. Run `./deploy.sh` command at terminal from this folder

This will push all of the local changes

* do reviews
* do generate
* do deploy
* copy product_json to theme settings on fiverr site

** Update Badges JSON for new courses before updating product JSON

## Files

`https://cdn.jsdelivr.net/gh/robgalvinco/json@latest/public/products-json.json` : will be the json that is used for the full product catalog
`https://cdn.jsdelivr.net/gh/robgalvinco/json@latest/public/reviews/[COURSE ID].json`: will contain the reviews for course [COURSE ID] ex: `https://cdn.jsdelivr.net/gh/robgalvinco/json@latest/public/reviews/340905.json`
