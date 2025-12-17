const express = require('express');
const connectDB = require('./db');
const app = express();
const port = 3000;
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');

connectDB();

// -------middleware-------

app.use(express.json());
const DeleteBlockMiddleware = (req, res, next) => {
    if(req.method === 'DELETE'){
        return res.status(400).json({message: "Not permitted for DELETE Request"})
    }
    next();
}
// app.use(DeleteBlockMiddleware);
    
const logger = (req, res, next) => {
    console.log('logger middleware working');
    next();
}
app.use(logger);    


app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});
app.use('/books', bookRoutes);
app.use('/users', userRoutes);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});