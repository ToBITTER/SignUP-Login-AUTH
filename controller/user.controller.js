
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.schema');
const LoginLog = require('../models/login.schema');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';


const signup = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, isAdmin: newUser.isAdmin },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const { password: _, ...userWithoutPassword } = newUser.toObject();

        res.status(201).json({
            message: 'User created successfully',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            await LoginLog.create({
                email,
                status: 'failed',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            await LoginLog.create({
                userId: user._id,
                email,
                status: 'failed',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        await LoginLog.create({
            userId: user._id,
            email,
            status: 'success',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(200).json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    signup,
    login
};
