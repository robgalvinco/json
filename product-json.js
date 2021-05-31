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
var collections = JSON.parse(fs.readFileSync(process.env.DIST+'collections.json'));
var instructors = JSON.parse(fs.readFileSync(process.env.DIST+'instructors.json'));
var products = JSON.parse(fs.readFileSync(process.env.DIST+'products.json'));
var courses = JSON.parse(fs.readFileSync(process.env.DIST+'courses.json'));
var product_prices = JSON.parse(fs.readFileSync(process.env.DIST+'product-prices.json'));

var products_json = [];
products.forEach(product => {
    var coming_soon = false;
    var coming_soon_price = product.price;
    var sale = false;
    var sale_price = product.price;
    var new_course = false;
    var tag = "";
    var display_price = product.price;
    var product_json = {
        "api_id":product.id,
        "productid":product.productable_id.toString(),
        "public":(!product.hidden).toString(),
        "status": product.status,
        "name": product.name,
        "image": product.card_image_url,
        "description":product.description,
        "bundlesize": "",
        "bundlecourses": "",
        "average_rating": "",
        "approved_count": "0",
        "instructor_title": "",
        "alt tag": product.name,
        "searchtags":"",
        "collections":product.collection_ids.join(),
        "collection_names":"",
        "total_time_seconds":0,
        "total_time_display":"0 hours",
        "tag_custom":"",//not going to support anymore
        "tag_color_bg":"", //not going to support anymore
        "tag_color_text":"" //not going to support anymore
    };  
    var collection_names = []
    collection_names.length = 0;
    product.collection_ids.forEach(collection_id => {
        var _index = collections.findIndex(function(collection, index) {
            if(collection.id == collection_id)
                return true;
        });  
        if(_index != -1){
            collection_names.push(collections[_index].name)
        }               
    });
    product_json.collection_names = collection_names.join();
    if(product_json.collection_names.includes("Best Seller")){
        product_json.tag_custom = "Best Seller";
    }
    if(product_json.collection_names.includes("New")){
        tag = "new";
    }
    //console.log(product.name + " " + product.collections); 
    //draft
    if(product.keywords!=null){ 
        product_json.searchtags = product.keywords;
        
    }
    if(product.status == "published"){
        product_json.draft = "false";
    } else {
        product_json.draft = "true";
    }    
    if(product.productable_id==958819){ // special course hiddn but public
        product_json.draft = "true";
    }
    if(product.hidden){
        product_json.draft = "true";
    }

    if(product.productable_type =="Course"){
        product_json.link = "https://learn.fiverr.com/courses/"+ product.slug;
        product_json.isbundle = "false";
        product_json.instructor_name = product.instructor_names;
        var _pindex = product_prices.findIndex(function(product, index) {
            if(product.productid.toString() == product_json.productid)
                return true;
        });  
        if(_pindex != -1){
            product_prices[_pindex].product_prices.forEach(price => {
                if(price.name != null){
                    if(price.name.toLowerCase().includes("sale")){
                        sale = true;
                        sale_price = price.price;
                        tag = "sale";
                    }
                    /*if(price.name.toLowerCase().includes("new")){
                        new_course = true;
                        tag = "new"
                    }*/
                    if(price.name.toLowerCase().includes("coming soon")){
                        coming_soon = true;
                        tag = "early bird price"
                        coming_soon_price = price.price;
                    }
                }
            });
        }

        /* commenting out as the API is not working - using liquid api to manually create prices json instead
        product.product_prices.forEach(price => {
            if(price.label != null){
                if(price.label.toLowerCase().includes("sale")){
                    sale = true;
                    sale_price = price.price;
                    tag = "sale";
                }
                if(price.label.toLowerCase().includes("new")){
                    new_course = true;
                    tag = "new"
                }
                if(price.label.toLowerCase().includes("coming soon")){
                    coming_soon = true;
                    tag = "early bird price"
                    coming_soon_price = price.price;
                }
            }
        });
        */
        var _index = courses.findIndex(function(course, index) {
            if(course.id.toString() == product_json.productid)
                return true;
        });  
        if(_index != -1){
            // console.log("****** FOUND COURS *****")
            var c = courses[_index];
            //console.log(c.instructor_id)
            //get instructor title
            var _index_inst = instructors.findIndex(function(instructor, index) {
                if(instructor.id == c.instructor_id)
                    return true;
            });  
            if(_index_inst != -1){
                product_json.instructor_title = instructors[_index_inst].title;
            }
            
            //get total time
            if(typeof(c.chapter_ids)!="undefined"){
                console.log("Getting chapters file: "+ c.id)
                
                var chapters = JSON.parse(fs.readFileSync(process.env.DIST+'chapters/'+c.id+'.json'));
                //console.log(JSON.stringify(chapters));
                chapters.forEach(chapter => {
                    product_json.total_time_seconds += chapter.duration_in_seconds;
                });
                var total_hours = parseFloat(product_json.total_time_seconds / 60 / 60).toFixed(1);
                console.log("Course: "+c.name+ " "+product_json.total_time_seconds + " " + total_hours);
                product_json.total_time_display = total_hours + " hours";

            }
        }               
        


    } else {
        //bundle specific stuff
        product_json.link = "https://learn.fiverr.com/bundles/"+ product.slug;
        product_json.isbundle = "true";
        product_json.instructor_name = "Multiple Instructors";
        product_json.instructor_title = product.instructor_names;
        sale = true;
        tag = "sale"; 

        //get bundle course info
        var bundle = JSON.parse(fs.readFileSync(process.env.DIST+'bundles/'+product.productable_id+'.json'));
        product_json.bundlesize = bundle.course_ids.length.toString();
        product_json.bundlecourses = bundle.course_ids.join();
        console.log("Bundle ************"+bundle.name+" : "+product_json.bundlesize + " :"+product_json.bundlecourses);
        var course_total_price = parseFloat(0);
        bundle.course_ids.forEach(course_id => {
            var _bundle_c_index = courses.findIndex(function(course, index) {
                if(course.id.toString() == course_id)
                    return true;
            });  
            if(_bundle_c_index != -1){
 
                var c = courses[_bundle_c_index];
                 console.log("****** FOUND COURS ***** "+ c.name)
                var c_time = 0;
                //get total time
                if(typeof(c.chapter_ids)!="undefined"){
                    console.log("Getting chapters file: "+ c.id)
                    
                    var chapters = JSON.parse(fs.readFileSync(process.env.DIST+'chapters/'+c.id+'.json'));
                    console.log(JSON.stringify(chapters));
                    chapters.forEach(chapter => {
                        product_json.total_time_seconds += chapter.duration_in_seconds;
                        c_time += chapter.duration_in_seconds;
                    });
                    

                }
                console.log("               course time: "+ c_time);

                //get product prices
                var _p_index = products.findIndex(function(product, index) {
                    if(product.productable_id.toString() == c.id)
                        return true;
                });  
                if(_p_index != -1){
                    //console.log("found product....")
                    products[_p_index].product_prices.forEach(price => {
                        if(price.label == null){
                            course_total_price += parseFloat(price.price);
                        }
                    });                        
                }  

                
              
            }
        });
        console.log ("Bundle course price total:"+course_total_price);
        var total_hours = parseFloat(product_json.total_time_seconds / 60 / 60).toFixed(0);
        console.log("Bundle: "+product_json.name+ " "+product_json.total_time_seconds + " " + total_hours);
        product_json.total_time_display = total_hours + " hours";        
        display_price = course_total_price.toString();          
    }

    if(coming_soon){
        current_price = coming_soon_price;
        normal_price = display_price;
    } else {
        if(sale){
            current_price = sale_price;
            normal_price = display_price;    
        } else {
            current_price = display_price;
            normal_price = "";
        }
    }
    product_json.current_price = current_price.replace(".0","");
    product_json.normal_price = normal_price.replace(".0","");;
    product_json.tag=tag;
    products_json.push(product_json);
});
// get reviews
console.log("Getting reviews");
products_json.forEach(product => {
    try {
        if(product.isbundle =="false"){
            try {
                let review_file = fs.readFileSync(process.env.DIST+'reviews/'+product.productid+'.json');
                let reviews = JSON.parse(review_file);
                console.log("Reviews: "+product.name + " "+reviews.length);
                product.approved_count = reviews.length;
                var total_rating = 0;
                reviews.forEach(review => {
                    total_rating += review.rating
                });
                var avg_rating = 0;
                if(product.approved_count!=0){
                    avg_rating = parseFloat(total_rating/product.approved_count);
                }
                
                product.average_rating = avg_rating.toFixed(1);
                    
            } catch (error) {
                console.log("No reviews for "+product.name)
            }
        } else {
            try {
                //get bundle course info
                console.log(product.name +' bundles/'+product.productid+'.json')
                var bundle = JSON.parse(fs.readFileSync(process.env.DIST+'bundles/'+product.productid+'.json'));
                //console.log("Bundle ************"+bundle.name+" : "+product_json.bundlesize + " :"+product_json.bundlecourses);
                var course_total_price = parseFloat(0);
                var total_reviews = 0 ;
                var total_rating = 0;
                bundle.course_ids.forEach(course_id => {
                    let review_file = fs.readFileSync(process.env.DIST+'reviews/'+course_id+'.json');
                    let reviews = JSON.parse(review_file);
                    total_reviews += reviews.length;
                    reviews.forEach(review => {
                        total_rating += review.rating
                    });
    
                })  
                product.approved_count = total_reviews;
                if(product.approved_count!=0){
                    product.average_rating = parseFloat(total_rating/product.approved_count).toFixed(1);
                }


            } catch (error) {
                console.log("Error loading bundle file: "+product.name +' bundles/'+product.productid+'.json')
            }

        }
    } catch (error) {
        console.log(error)
    }
    
});   
     
fs.writeFileSync(process.env.DIST+'products-json.json', JSON.stringify(products_json));