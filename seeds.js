var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var data = [
    {
        name: "Mars", 
        image: "https://cdn.cnn.com/cnnnext/dam/assets/180725085608-01-mars-lake-radar-evidence-exlarge-169.jpg",
        description: "MARS!!!"
    },
    {
        name: "Pluto", 
        image: "https://solarsystem.nasa.gov/system/resources/detail_files/933_BIG_P_COLOR_2_TRUE_COLOR1_1980.jpg",
        description: "Pluto!!!"
    },
    {
        name: "Venus", 
        image: "https://news.wisc.edu/content/uploads/2018/03/Venus-1024x1024.jpg",
        description: "Venus!!!"
    }
];

var comment2 = {
    text: "Yea!",
    author: "YU111"
}

function seedDB(){
    // Remove all campgrounds
    Campground.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed camp");
        // add a few campgrounds
        data.forEach(function(seed){
            Campground.create(seed, function(err, campground){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Add");
                    Comment.create(comment2, function(err, comment){
                        if(err){
                            console.log(err);
                        }
                        else{
                            campground.comments =  campground.comments.concat([comment]);
                            campground.save(function(err){
                                if(err){
                                     console.log(err);
                                     return;
                                }
                            });
                            console.log(campground);
                            console.log("Created new comment");
                        }
                    });
                }
            })
        });
    });
}

module.exports = seedDB;