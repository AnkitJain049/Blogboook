import express from "express";
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from 'body-parser';
import { Strategy } from "passport-local";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
const apiUrl = "http://localhost:4000";


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

//Route to render the register page
app.get("/register",async(req, res) => {
    try {
        res.render('register'); // EJS automatically assumes .ejs extension
    } catch (err) {
        console.error("Rendering error:", err); // Log the error
        res.status(400).send("Error rendering the page");
    }
});

// Route to render the homepage
app.get("/", (req, res) => {
    try {
        res.render('home'); // EJS automatically assumes .ejs extension
    } catch (err) {
        console.error("Rendering error:", err); // Log the error
        res.status(400).send("Error rendering the page");
    }
});

// Route to fetch and display blogs
app.get('/blogs', async (req, res) => {
    try {
        const response = await axios.get(`${apiUrl}/blogs`);
        const blogs = response.data; // Extract the data from the axios response
        res.render('blogs', { blogs }); // Pass the blogs data to the EJS template
    } catch (err) {
        console.error('Error fetching blogs:', err);
        res.status(500).send('Server Error');
    }
});

//Route to modify(Edit)
app.get("/blogs/:id",async (req,res)=>{
    try{
        const response = await axios.put(`${apiUrl}/blogs`);
    }catch(err){
        console.error('Error editing blogs:', err);
        res.status(500).send('Server Error');
    }
});


//Route to check login info and send
app.post("/",async (req,res)=>{
    try{
        const response = await axios.post(`${apiUrl}`, req.body);
    }catch(err){
        console.error('Error editing blogs:', err);
        res.status(500).send('Server Error');
    }
});

app.post("/register", async (req, res) => {
    try {
        console.log(req.body);
        const response = await axios.post(`${apiUrl}/register`, req.body);
        console.log(response.data.message);

        if (response.data.message === 'User registered successfully') {
            // Registration successful, send a JSON response
            res.json({ message: 'User registered successfully' });

        } else {
            // Send error message if registration failed
            res.status(400).json({ message: response.data.message || 'Registration failed' });
        }
        console.log(req.session);
    } catch (err) {
        console.error('Error Registering User:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
