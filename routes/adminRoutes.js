const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const Book = require('../models/bookSchema');
const { authenticateToken, authorizeAdmin } = require('../middleware/AuthMiddleware');

// All routes here require admin access
router.use(authenticateToken);
router.use(authorizeAdmin);

// ============== USER MANAGEMENT ==============

// GET - Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            totalUsers: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET - Get user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE - Delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.userId) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User deleted successfully',
            deletedUser: {
                regNo: user.regNo,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// ============== BOOK MANAGEMENT ==============

// POST - Add a new book
router.post('/books', async (req, res) => {
    try {
        const { bookId, title, author, genre, publicationYear, availableCopies } = req.body;

        // Check if book with same bookId exists
        const existingBook = await Book.findOne({ bookId });
        if (existingBook) {
            return res.status(400).json({ message: 'Book with this ID already exists' });
        }

        const book = new Book({
            bookId,
            title,
            author,
            genre,
            publicationYear,
            availableCopies
        });

        const savedBook = await book.save();
        res.status(201).json({
            message: 'Book added successfully',
            book: savedBook
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT - Update a book
router.put('/books/:bookId', async (req, res) => {
    try {
        const book = await Book.findOneAndUpdate(
            { bookId: parseInt(req.params.bookId) },
            req.body,
            { new: true, runValidators: true }
        );

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({
            message: 'Book updated successfully',
            book
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE - Delete a book
router.delete('/books/:bookId', async (req, res) => {
    try {
        const book = await Book.findOneAndDelete({ bookId: parseInt(req.params.bookId) });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({
            message: 'Book deleted successfully',
            deletedBook: {
                bookId: book.bookId,
                title: book.title
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
