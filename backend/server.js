const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const bodyparser = require('body-parser');
const authRoute = require('./routes/authRoute');

dotenv.config();
const app = express();

const Port = process.env.PORT || 3000;


//connect database
connectDB();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(bodyparser.urlencoded({extended:true}));

//routes
app.use('/api/auth',authRoute);

app.get('/',(req,res)=>{
    return res.send('Server is running');
})

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});