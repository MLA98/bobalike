var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, function(req, res){
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

router.post("/campgrounds/:id/comments", function(req, res){
    // Lookup camground id
    // create new comment
    // connect new comments to campground
    // redirect campground
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            req.flash("error", "Something went wrong.");
            res.redirect("/campgrounds");
        }
        else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }
                else{
                    // add username and id to comment 

                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    console.log(req.user.username);
                    comment.save();
                    campground.comments =  campground.comments.concat([comment]);
                    campground.save();
                    req.flash("success", "Successfully added comment.");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// Comment edit route
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            req.flash("error", "Something went wrong.");
            redirect("back");
        }
        else{
            req.flash("success", "Successfully edited comment.");
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
});

// Comment Update
router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            req.flash("error", "Something went wrong.");
            res.redirect("back");
        }
        else{
            req.flash("success", "Successfully edited comment.");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// Comment destroy
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash("error", "Something went wrong.");
            res.redirect("back");
        }
        else{
            req.flash("success", "Successfully deleted comment.");
            res.redirect("back");
        }
    });
});



module.exports = router;