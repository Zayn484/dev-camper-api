const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const expressMongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const expressRateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
require("colors");
const errorHanlder = require("./middleware/error");
const connectDB = require("./config/db");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// DB connection
connectDB();

// Loading routes
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

const app = express();

app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === "development") app.use(morgan("combined"));

// File uploading
app.use(fileupload());

// Sanitize data
app.use(expressMongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xssClean());

// Rate limiting of 100 requests of each IP per 10 mins
const limiter = expressRateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mounting API routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

app.use(errorHanlder);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`.yellow.red);
    // Close server and exit
    server.close(() => process.exit(1));
});
