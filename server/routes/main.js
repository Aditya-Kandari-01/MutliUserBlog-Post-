const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const Contact = require('../models/Contact');

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
        res.render('post', { locals, data, currentRoute: `/post/${slug}` })

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
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-z0-9]/g, "") // g - global flag ; all letter removes , without g only one char removes

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
module.exports = router









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
