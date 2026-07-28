const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const Contact = require('../models/Contact');
const otherUsersPageLayout = './layouts/otherUsersPage'

const mongoose = require('mongoose')

// Admin home page (without pagination)
router.get('', async (req, res) => {
    try {
        const locals = {
            title: "NodeJs Blog",
            description: "Simple Blog Post for multiple users"
        }
        let perPage = 2;
        let page = req.query.page || 1; // taking the value from the url as an object ({page:2})
        let skipPages = page * perPage - perPage;
        const adminUser = await User.findById(process.env.admin_id)
        const data = await Post.aggregate([
            {
                $match:
                {
                    userId: new mongoose.Types.ObjectId(process.env.admin_id)
                }
            },
            {
                $sort:
                {
                    createdAt: -1
                }
            }
        ]).skip(skipPages).limit(perPage).exec();

        const count = await Post.countDocuments({ userId: process.env.admin_id });//Number of posts
        const nextPage = parseInt(page) + 1;// Next page value in int
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        const hasPrevPage = parseInt(page) > 1;
        const prevPage = parseInt(page) - 1;

        res.render('adminHomePage', { locals, data, adminUser, current: page, nextPage: hasNextPage ? nextPage : null, prevPage: hasPrevPage ? prevPage : null, userId: process.env.admin_id, currentRoute: '/' })

    } catch (error) {
        console.log(error)
    }

})
// Admin about page
router.get('/about', async (req, res) => {
    const locals = {
        title: "About",
        description: "Simple Blog Post for multiple users"
    }
    res.render('adminAbout', { locals, currentRoute: '/about' })
})

// Admin contact page [GET]
router.get('/contact', async (req, res) => {
    const locals = {
        title: "Contact",
        description: "Simple Blog Post for multiple users"
    }
    res.render('adminContact', { locals, currentRoute: '/contact', success: false, error: null  })
})
// Admin contact page [POST]
router.post('/contact', async (req, res) => {
    const locals = { 
        title: "Contact", 
        description: "Simple Blog Post for multiple users" 
    }
    try { 
        const feedback = new Contact({ 
            name: req.body.name, 
            email: req.body.email, 
            message: req.body.message, 
        }); 
        await feedback.save(); 
        res.render('adminContact', {locals, success: true , currentRoute: '/contact'}); 
    } catch (error) { 
        console.error(error); 
        let errorMessage = "Something went wrong"; 
        if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map(err => err.message).join(', '); 
        }
        res.render('adminContact', { locals, success: false,error: errorMessage ,currentRoute: '/contact' }) 
    } 
})

// Admin Posts
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const data = await Post.findOne({ userId: process.env.admin_id, _id: slug })
        const locals = {
            title: data.title,
            description: "Simple Blog Post for multiple users"
        }
        if (!data) {
            return res.status(404).render('404', {
                message: "Post not found"
            });
        }
        let page = req.query.page || 1; 
        let perPage = 2;
        const count = await Post.countDocuments({ userId: process.env.admin_id })
        const nextPage = parseInt(page) + 1;// Next page value in int
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        const hasPrevPage = parseInt(page) > 1;
        const prevPage = parseInt(page) - 1;
        console.log(page)
        console.log(nextPage)
        console.log(prevPage)
        console.log('nextpage')
        res.render('post', { locals, data, current: page, currentRoute: `/post/${slug}` })

    } catch (error) {
        console.log(error)
    }

})


// Admin Search

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "Simple Blog Post for multiple users"
        }
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "") // g - global flag ; all letter removes , without g only one char removes

        const data = await Post.find({
            userId: process.env.admin_id,
            $or: [
                {
                    title: { $regex: new RegExp(searchNoSpecialChar), $options: "i" }
                },
                {
                    body: { $regex: new RegExp(searchNoSpecialChar), $options: "i" }
                }
            ]
        });

        res.render("search", {
            data, locals
        });

    } catch (error) {
        console.log(error)
    }

})

// Users Page 
router.get('/home/:username', async (req, res) => {
    try {
        const locals = {
            title: "NodeJs Blog",
            description: "Simple Blog Post for multiple users"
        }
        let perPage = 2;
        let page = req.query.page || 1; // taking the value from the url as an object ({page:2})
        let skipPages = page * perPage - perPage;
        const userDetails = await User.findOne({username:req.params.username})
        if(!userDetails){
            res.redirect('/404');
        }
        const data = await Post.aggregate([
            {
                $match:
                {
                    userId: userDetails._id
                }
            },
            {
                $sort:
                {
                    createdAt: -1
                }
            }
        ]).skip(skipPages).limit(perPage).exec();

        const count = await Post.countDocuments({userId:userDetails._id});//Number of posts
        const nextPage = parseInt(page) + 1;// Next page value in int
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        const hasPrevPage = parseInt(page) > 1;
        const prevPage = parseInt(page) - 1;

        res.render('userPage', { locals, data, userDetails,layout:otherUsersPageLayout, current: page, nextPage: hasNextPage ? nextPage : null, prevPage: hasPrevPage ? prevPage : null, userId: userDetails._id, currentRoute: '/' })

    } catch (error) {
        console.log(error);
        res.redirect('/404');
    }
})

// user's post
router.get('/home/:username/:id', async (req, res) => {
    const userDetails = await User.findOne({username:req.params.username})
    try {
        const locals = {
            title: "NodeJs Blog",
            description: "Simple Blog Post for multiple users"
        }
        const data = await Post.findById(req.params.id);

        if (!data) {
            return res.redirect('/404');
        }


        res.render('userPost', {
            locals,data,userDetails
        });

    } catch (error) {
        console.log(error);
        res.redirect('/404');
    }
});


module.exports = router


// User's search 


router.post('/home/:username/search', async (req, res) => {
    const userDetails = await User.findOne({username:req.params.username})
    try {
        const locals = {
            title: "Search",
            description: "Simple Blog Post for multiple users"
        }
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "") // g - global flag ; all letter removes , without g only one char removes

        const data = await Post.find({
            userId: userDetails._id,
            $or: [
                {
                    title: { $regex: new RegExp(searchNoSpecialChar), $options: "i" }
                },
                {
                    body: { $regex: new RegExp(searchNoSpecialChar), $options: "i" }
                }
            ]
        });

        res.render("userSearch", {
            data, locals,userDetails,
        });

    } catch (error) {
        console.log(error)
    }

})




// function insertPostData () {
//     Post.insertMany([
//         {
//             userId:"697a5d6e7a2155fb946a2e33",
//             title:"Building a Blog",
//             body:"To engage users"
//         },
//     ])
// }

// insertPostData();

// // Admin home page (without pagination)
// router.get('',async (req,res)=>{
//     const locals = {
//         title : "NodeJs Blog",
//         description : "Simple Blog Post for multiple users"
//     }
//     try {
//         const data = await Post.find()
//         res.render('adminHomePage',{locals,data})
//     } catch (error) {
//         console.log(error)
//     }

// })
