import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config({ path: './config.env' });

const connStr = process.env.CONN_STR;
const dbPassword = encodeURIComponent(process.env.DB_PASSWORD);
if (!connStr || !dbPassword) {
    throw new Error('Missing connection string or database password');
}

const db = connStr.replace('<PASSWORD>', dbPassword);
mongoose.connect(db)
.then(() => console.log('Success DB Connection'))
.catch(err => console.error('DB Connection Error:', err));

// Schema definition
const BlogSchema = new mongoose.Schema({
    Author: {
        type: String,
        required: [true, "Author must have a name"]
    },
    Title: {
        type: String,
        required: [true, "Blog must have a title"]
    },
    Content: {
        type: String,
        required: [true, "Blog must have some content"]
    },
    username: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    Date: {
        type: Date,
        default: Date.now
    }
});
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true
    }
});

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Model creation
const Blog = mongoose.model('Blog', BlogSchema);
const User = mongoose.model('User', userSchema);


export { Blog, User };

