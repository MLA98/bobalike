var express = require("express");
var app = express();
app.set("view engine", "ejs");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
// var user = require("./models/user");
var seedDB = require("./seeds");

// seedDB();
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res){
    res.render("landing");
});

// Campground.create(
//   {
//       name: "Huang",
//       image: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Huangshan_pic_4.jpg",
//       description: "还行，就是有点远嗷"
//   }, function(err, campground){
//       if(err){
//           console.log(err);
//       }
//       else{
//           console.log("ADDDD");
//       }
//   }
// );



app.get("/campgrounds", function(req, res){
    // Get camp from database
    Campground.find({}, function(err, allCampground){
        if(err){
            console.log(err);
        }
        else{
            res.render("campgrounds/index", {campground: allCampground});
        }
    });
});

app.post("/campgrounds", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name: name, image: image, description: desc};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newCreated){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/campgrounds");
        }
    });
    // get data from form and add campground array.
    // redirect back to campgrounds page
});

app.get("/campgrounds/new", function(req, res){
    res.render("campgrounds/new");
});

app.get("/campgrounds/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }
        else{
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

app.get("/campgrounds/:id/comments/new", function(req, res){
    // console.log("The server has started");
    // res.send("THIS WILL BE THE COMMENT FORM");
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/new", {campground: campground})
        }
    });
});

app.post("/campgrounds/:id/comments", function(req, res){
    // Lookup camground id
    // create new comment
    // connect new comments to campground
    // redirect campground
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }
        else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }
                else{
                    campground.comments =  campground.comments.concat([comment]);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

app.listen(4396, process.env.IP, function(){
    console.log("Yelp app is started");
});