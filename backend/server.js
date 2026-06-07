const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
dotenv.config();
const app = express();

const Port = process.env.PORT || 3000;
connectDB();
app.get('/',(req,res)=>{
    return res.send('Server is running');
})

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});