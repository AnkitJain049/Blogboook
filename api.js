    import express from 'express';
    import dotenv from 'dotenv';
    import session from "express-session";
    import { Blog, User } from './models.js';
    import passport from "./auth.js"
    import cors from 'cors';

    dotenv.config({ path: './config.env' });
    const app = express();
    const PORT = process.env.API_PORT || 4000;
    app.use(session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie:{maxAge:3600000}
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.json()); // Middleware to parse JSON
    app.use(express.urlencoded({ extended: true }));
    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true
    }));

    // Create a new blog------PENDING
    app.post('/blogs', async (req, res) => {
        try {
            const { Author, Title, Content, email } = req.body;
            const newBlog = new Blog({ Author, Title, Content, email });
            await newBlog.save();
            res.status(201).json(newBlog);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

    //Login Route
    app.post("/",passport.authenticate("local",{
        successRedirect: "/secrets",
        failureRedirect: "/login",
        })
    );

    //Register Post
    app.post("/register", async (req, res) => {
        try {
            // Destructure fields from request body
            const { firstName, lastName, username, password, confirmPassword } = req.body;
            if (password !== confirmPassword) {
                return res.status(400).json({ message: "Passwords do not match" });
            }

            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }
            const newUser = new User({
                firstName,
                lastName,
                username,
                password
            });
            await newUser.save();
            req.login(newUser, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error logging in after registration' });
                }
                console.log('Session after login:', req.session);
                res.status(201).json({ message: 'User registered successfully' });
            });
        } catch (err) {
            console.error("Error registering user:", err);
            res.status(500).send("Error Registering User");
        }
    });


    // Read all blogs
    app.get('/blogs', async (req, res) => {
        try {
            const blogs = await Blog.find();
            res.status(200).json(blogs);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Read a single blog by ID
    app.get('/blogs/:id', async (req, res) => {
        try {
            const blog = await Blog.findById(req.params.id);
            if (!blog) return res.status(404).json({ message: 'Blog not found' });
            res.status(200).json(blog);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Update a blog by ID------PENDING
    app.put('/blogs/:id', async (req, res) => {
        try {
            const updatedBlog = await Blog.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!updatedBlog) return res.status(404).json({ message: 'Blog not found' });
            res.status(200).json(updatedBlog);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

    // Delete a blog by ID-------PENDING
    app.delete('/blogs/:id', async (req, res) => {
        try {
            const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
            if (!deletedBlog) return res.status(404).json({ message: 'Blog not found' });
            res.status(200).json({ message: 'Blog deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}`);
    });
