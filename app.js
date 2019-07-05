var express = require("express");
var app = express();
app.set("view engine", "ejs");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user")
// var user = require("./models/user");f
var seedDB = require("./seeds");

// seedDB();

// Passport configuration
app.use(require("express-session")({
    secret: "dog is liu",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

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
            res.render("campgrounds/index", {campground: allCampground, currentUser: req.user});
        };
    });
});

app.post("/campgrounds", isLoggedIn, function(req, res){
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

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
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

// AUTH ROUTES
app.get("/register", function(req, res){
    res.render("register");
})

// sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/campgrounds");
        });

    });
});

// show login form
app.get("/login", function(req, res){
    res.render("login");
});

// Login post
// Middleware
app.post("/login", passport.authenticate("local",{
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}),function(req, res){
    
});

// Logout
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

app.listen(4396, process.env.IP, function(){
    console.log("Yelp app is started");
});