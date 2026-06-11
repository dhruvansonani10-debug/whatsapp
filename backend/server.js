const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const bodyparser = require('body-parser');
const authRoute = require('./routes/authRoute');
const chatRoute = require('./routes/chatRoute'); 
const http = require('http');
const initializeSocket = require('./services/socketservice.js');
const { Socket } = require('socket.io');
const statusRoute = require('./routes/statusRoute');

dotenv.config();
const app = express();

const Port = process.env.PORT || 3000;




const corsOptions={
    origin:process.env.FRONTEND_URL,
    credentials:true
}

app.use(cors(corsOptions));

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(bodyparser.urlencoded({extended:true}));

//connect database
connectDB();

//vreate server
const server = http.createServer(app);

const io = initializeSocket(server);

//socket io for real time communication , share socket instance to all routes
app.use((req,res,next)=>{
    req.io = io;
    req.socketUserMap = io.socketUserMap;
    next();
})

//routes
app.use('/api/auth',authRoute);
app.use('/api/chat',chatRoute);
app.use('/api/status',statusRoute);


server.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});