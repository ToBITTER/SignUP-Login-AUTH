const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/user.schema');
const {signup, login} = require('./controller/user.controller');
const authRoutes = require('./routes/auth.routes');
const auth = require('./routes/auth');

dotenv.config();


const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3200;

app.get('/protected', auth, (req, res) => {
    res.json({ message: 'Access granted!', user: req.user });
});


app.get('/', (req, res) => {
    res.send('Welcome to the Sign Up Service');
});

console.log('Connecting to MongoDB...');

app.use('/api/auth', authRoutes);


app.listen (PORT, () => {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('MongoDB connected successfully');
        })
        .catch((error) => {
            console.error('MongoDB connection failed:', error);
            process.exit(1);
        });
    console.log(`Server is running on localhost://${PORT}`);
    });

