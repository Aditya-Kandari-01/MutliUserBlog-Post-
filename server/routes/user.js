const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const registerationLayout = '../views/layouts/registeration'
const loginLayout = '../views/layouts/login'
const userLayout = '../views/layouts/userLayout'

const upload = require('../config/upload')

// MiddleWare Function to keep the legit user logged in
// Check Login

const authMiddleWare = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.session_secret)
        req.user = decoded; // userId and username 
        next()
    }
    catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}


// Registeration Page ( getting the registeration page )
router.get('/register', async (req, res) => {
    try {
        const locals = {
            title: "User",
            description: "Simple Blog for the user by Aditya"
        }
        res.render('authentication/register', {
            locals, layout: registerationLayout, currentRoute: '/register'
        })

    } catch (error) {
        console.log(error)
    }
})
// Registeration Page ( posting the details on the db)
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword })
            return res.render('authentication/success',{
                currentRoute:'/register',
                message: 'You have registered successfully!'
            })
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ message: 'User already in use' })
            }
            res.status(500).json({ message: 'Internal Server Error' })
            console.log(error)
        }

    } catch (error) {
        console.log(error)
    }
})

// Login Page ( getting the login page )
router.get('/login', async (req, res) => {
    try {
        const locals = {
            title: "User",
            description: "Simple Blog for the user by Aditya"
        }
        res.render('authentication/login', {
            locals, layout: loginLayout, currentRoute: '/register'
        })

    } catch (error) {
        console.log(error)
    }
})

// Login Page ( getting the dashboard for valid user)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.session_secret, { expiresIn: '1d' })

        res.cookie('token', token, { httpOnly: true })
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error)
    }
})

// User Dashboard (getting the dashboard)
router.get('/dashboard', authMiddleWare, async (req, res) => {
    try {
        const username = req.user.username;
        const locals = {
            title: username,
            description: "Simple Blog Post for multiple users"
        }
        const u_id = req.user.userId;
        const data = await Post.find({ userId: u_id });
        res.render('posts/dashboard-posts', { locals, data, layout: userLayout, currentRoute: '/dashboard' })
    } catch (error) {
        console.log(error)

    }
})
// Dashboard Posts ( getting the post to show it to the user)
router.get('/u/post/:id', authMiddleWare, async (req, res) => {
    try {
        let postId = req.params.id;
        const data = await Post.findOne({ userId: req.user.userId, _id: postId })

        const locals = {
            title: data.title,
            description: "Simple Blog Post for multiple users"
        }
        res.render('post', { locals, data, layout: userLayout, currentRoute: '/dashboard' })

    } catch (error) {
        console.log(error)
        res.status(500).send("Server Error");
    }

})
// Picture uploading on the page [POST request]
// only single file upload with name of 'image'
router.post('/upload-profile', authMiddleWare, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.redirect('/home?error=invalid');
        }
        next();
    });
}, async (req, res) => {
    try {
        const url = req.file.path; //image url
        if (!req.file) {
            return res.redirect('/home?error=nofile');
        }

        await User.findByIdAndUpdate(req.user.userId, {
            image: url
        })
        res.redirect('/home?success=1');

    } catch (error) {
        console.log(error);
        res.redirect('/home?error=upload');
    }
})


// User's Home Page
router.get('/home', authMiddleWare, async (req, res) => {
    try {
        const u_id = req.user.userId;
        const username = req.user.username;
        const user = await User.findById(u_id);
        const locals = {
            title: username,
            description: "Simple Blog Post for multiple users"
        }
        let perPage = 2;
        let page = req.query.page || 1; // taking the value from the url as an object ({page:2})
        let skipPages = page * perPage - perPage;
        const data = await Post.aggregate([
            {
                $match:
                {
                    userId: new mongoose.Types.ObjectId(u_id)
                }
            },
            {
                $sort:
                {
                    createdAt: -1
                }
            }
        ]).skip(skipPages).limit(perPage).exec();

        const count = await Post.countDocuments({ userId: u_id });//Number of posts
        const nextPage = parseInt(page) + 1;// Next page value in int
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        const hasPrevPage = parseInt(page) > 1;
        const prevPage = parseInt(page) - 1;

        res.render('userHomePage', { locals, data, user,u_id, layout: userLayout, nextPage: hasNextPage ? nextPage : null,prevPage : hasPrevPage ? prevPage: null ,currentRoute: '/home' })

    } catch (error) {
        console.log(error)
    }
})
// User's New Post (getting the add post page)
router.get('/add-post', authMiddleWare, async (req, res) => {
    try {
        const locals = {
            title: "Add Posts",
            description: "Simple Blog Post for multiple users"
        }
        const u_id = req.user.userId;
        const data = await Post.find({ userId: u_id });
        res.render('posts/add-post', { locals, data, layout: userLayout, currentRoute: '/dashboard' })
    } catch (error) {
        console.log(error)
    }
})

// User's New Post (posting the data on the home page)
router.post('/add-post', authMiddleWare, async (req, res) => {
    try {
        try {
            const locals = {
                title: "Add Posts",
                description: "Simple Blog Post for multiple users"
            }
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body,
                userId: req.user.userId
            })
            await Post.create(newPost);
            res.render('posts/add-post', { locals, layout: userLayout, currentRoute: '/dashboard' })
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error)
    }
})

// User's Post (Edit) [Get]
router.get('/edit-post/:id', authMiddleWare, async (req, res) => {
    try {
        const locals = {
            title: "Edit Post",
            description: "Simple Blog Post for multiple users"
        }
        const data = await Post.findOne({ _id: req.params.id, userId: req.user.userId })
        res.render('posts/edit-post', {
            locals,
            data,
            layout: userLayout,
            currentRoute: '/dashboard'
        })

    } catch (error) {
        console.log(error)
    }
})


// User's Post (Edit) [Post] (It is actually a put) 
// We will user method override to make post as put
// by using ?_method=PUT in the form to converto post --> put
// as because html only understand get and post
router.put('/edit-post/:id', authMiddleWare, async (req, res) => {
    try {
        await Post.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, {
            title: req.body.title,
            body: req.body.body
        });
        res.redirect(`/edit-post/${req.params.id}`)
    } catch (error) {
        console.log(error)
    }
})


// User Delete Post [Delete]
router.delete('/delete-post/:id', authMiddleWare, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id, userId: req.user.userId })
        res.redirect('/dashboard')
    } catch {
        res.status(404).render('404', { message: "Post not found" })
    }
})
// User Logout from the webpage [Deleting the token from cookie]
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect("/")
})

module.exports = router