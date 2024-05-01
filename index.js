require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const user = require('./models/user');
const post = require('./models/post');
const { body, validationResult } = require('express-validator')
const passport = require('passport');
const { initializePassport, isAuthenticated, isNotAuthenticated } = require('./passportConfig');
const expressSession = require('express-session');
const connectToDB = require('./mongodb');
const upload = require('./multer');

connectToDB();

initializePassport(passport);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', "ejs");
app.use(expressSession({ secret: "yusuf is great", resave: false, saveUninitialized: false }))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));



app.get('/', function (req, res) {
    res.render('index');
})

app.get('/login', isNotAuthenticated, function (req, res) {
    res.render('login', { error: "" });
})

app.get('/signup', isNotAuthenticated, function (req, res) {
    res.render("signup", { error: "" });
})

app.post('/signup',  // Validate user input
    body('username', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 }),
    async (req, res) => {

        const userExist = await user.findOne({ email: req.body.email });
        if (userExist) {
            return res.render('signup', { error: [{ msg: 'User already exists with that email id' }] });
        }


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If there are validation errors, render the signup page with the error messages
            return res.status(400).render("signup", { error: errors.array() });
        }


        try {
            const newuser = await user.create({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            });
            // Respond with success message or redirect to another page
            res.status(200).render('login', { error: '' });
        } catch (error) {
            console.error(error); // Log the error for debugging
            res.status(500).json("Server problem");
        }
    });

app.post('/login', passport.authenticate('local'), (req, res) => {
    console.log(req.user._id);
    res.redirect('/profile');
});

app.get('/profile', isAuthenticated, async (req, res) => {

    const posts = await post.find({ owner: req.user._id }).populate("owner");
    if(req.user.post){
        res.render('profile', { username: req.user.username, post: posts[0] });
    }else{
        const post={
            owner:"yusuf saify"
        }
        res.render('profile', { username: req.user.username, post});

    }
})


app.get('/editprofile', isAuthenticated, async (req, res) => {
    const posts = await post.find({ owner: req.user._id });
    res.render('editprofile', { user: req.user, posts });
})

app.get('/edituserdetail', isAuthenticated, (req, res) => {
    res.render('edituserprofiledetail', { user: req.user });
})

app.post('/updateuserprofiledetail', isAuthenticated, upload.single('image'), async (req, res) => {
    if (req.file) {
        const updateduser = await user.findOneAndUpdate({ username: req.user.username }, {
            username: req.body.username,
            image: req.file.filename,
            about: req.body.about
        }, {});
    } else {
        const updateduser = await user.findOneAndUpdate({ username: req.user.username }, {
            username: req.body.username,
            about: req.body.about
        }, {});
    }
    // console.log(updateduser);
    res.redirect('/editprofile');
})

app.get('/createpost', isAuthenticated, (req, res) => {
    res.render('createpost', { user: req.user });

})

app.post('/createpost', isAuthenticated, upload.single('image'), async (req, res) => {

    const categoriesToAdd = req.body.category.split(" ");

    // Create the post object and concatenate categories in one step
    const createdpost = await post.create({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        owner: req.user._id,
        image: req.file.filename,
        category: categoriesToAdd // Concatenating categories directly
    });


    console.log(req.body.category.split(" "));

    const finduser = await user.findOne({ email: req.user.email });

    finduser.posts.push(createdpost._id);
    await finduser.save();
    res.redirect('/editprofile');
})
app.get('/show/:postid', isAuthenticated, async (req, res) => {
    const foundpost = await post.findOne({ _id: req.params.postid }).populate("owner");
    res.render('showpost', { post: foundpost });
})

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('login');
    });
});

app.listen(process.env.PORT, () => {
    console.log("server started....");
});

