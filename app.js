require('dotenv').config();

const express = require('express') 
const expressLayout = require('express-ejs-layouts')
const methodOverride = require('method-override')

const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo').default

const connectDb = require('./server/config/db');
const {isActiveRoute} = require('./server/helpers/routeHelpers')
const session = require('express-session');

const app = express()
const port = process.env.port || 10000 
 

// Connect To Db
connectDb()

// Middleware to convert encoded datat to json file
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser())
app.use(methodOverride('_method'))

app.use(session({
    secret:process.env.session_secret,
    resave: false,
    saveUninitialized:true,
    store: MongoStore.create({
        mongoUrl : process.env.mongodb_uri
    })
}))

app.use(express.static('public'))

//Templating Engine
app.use(expressLayout)
app.set('view engine','ejs') // communicates routes <---> views
app.set('layout','./layouts/adminPage')
app.locals.isActiveRoute = isActiveRoute;

// Make currentRoute available to EJS
app.use((req, res, next) => {
    res.locals.currentRoute = req.path;
    next();
});

app.use('/',require('./server/routes/main'))
app.use('/',require('./server/routes/user'))

app.listen(port,()=>{
    console.log(`App listening on port ${port}`)
})