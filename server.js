// importing dependencies
const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const passport = require("passport");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

// importing custom setups
const passportSetup = require("./src/config/passport_setup");

// importing env
require("dotenv").config();

// variables
const port = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);
var io = socketio(server);

const httpServer = createServer();
io = new Server(httpServer, { /* options */ });

let count = 0;
io.on("connection", (socket) => {
    // ...
    console.log("New Websocket connection");
    // count++;

    socket.on('increment', () => {
        count++;
        io.emit('countUpdated', count)
    })
});

// socket.on('countUpdated', (count) =>{
//     console.log("count had updated to ", count)
// })

httpServer.listen(3000);

const fs = require("fs");

// const corsOptions = {
//     origin: "http://localhost:3001", // for local testing
//     optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

// middlewares
app.use(
    cookieSession({
        maxAge: 24 * 60 * 60 * 1000,
        keys: process.env.JWT_SECRET,
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb", parameterLimit: 50000 }));
// app.use(express.urlencoded({ extended: true}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    })
);

app.use("/uploads", express.static("./src/uploads"));

// set view engine
const path = require("path");
app.set("views", path.join(__dirname, "./src/views"));
app.set("view engine", "ejs");

// Connecting database using async / await
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_ATLAS_DATABASE, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected!!");
    } catch (err) {
        console.log("Failed to connect to MongoDB", err);
    }
};

connectDB();

// ping route
app.get("/ping", (req, res) => {
    return res.send({
        error: false,
        message: "server is healthy",
    });
});

app.get("/", (req, res) => {
    return res.render("home");
});

// routes
const adminRoutes = require("./src/routes/admin_route");
const astroRoutes = require("./src/routes/astro_route");
const userRoutes = require("./src/routes/user_route");
const oauthRoutes = require("./src/routes/oauth_route");
const transactionRoutes = require("./src/routes/transaction_route");
const queryRoutes = require("./src/routes/query_route");
const followRoutes = require("./src/routes/follow_route");
const userBirthProfileRoutes = require("./src/routes/user_birthprofile_route");
const withdrawlRoutes = require('./src/routes/withdrawl_route');

app.use("/admin", adminRoutes);
app.use("/astro", astroRoutes);
app.use("/user", userRoutes);
app.use("/auth", oauthRoutes);
app.use("/transaction", transactionRoutes);
app.use("/query", queryRoutes);
app.use("/follow", followRoutes);
app.use("/userBirthProfile", userBirthProfileRoutes);
app.use('/withdrawl', withdrawlRoutes);

// socket events
io.on("connection", () => {
    console.log("New Websocket connection");
});

io.on('disconnect', () => { console.log('Websocket disconnected'); });

// running server on port
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});