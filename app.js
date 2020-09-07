require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const session = require("client-sessions");
var path = require("path");
const cors = require("cors");
//app settings
const port = process.env.PORT || "3100";
const app = express();

// Letting all origins to pass
// app.use(cors());
// app.options("*", cors());
const corsConfig = {
  origin: true,
  credentials: true,
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

//print request logs
app.use(morgan(":method :url :status :response-time ms"));
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());
/*app.use(express.json()); // parse application/json*/

//settings cookies config
app.use(
  session({
    cookieName: "session", // the cookie key name
    secret: process.env.COOKIE_SECRET, // the encryption key
    duration: 5 * 60 * 1000, // expired after 5 minutes
    activeDuration: 5 * 60 * 1000, // if expiresIn < activeDuration,
    //the session will be extended by activeDuration milliseconds
    cookie: {
      httpOnly: false,
    },
  })
);
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files

//routes:
const users = require("./routes/users/users");
const userVerify = require("./routes/users/userVerify");
const recipes = require("./routes/recipes/recipes");

app.get("/test", (req, res) => res.send("test worked"));
//routing:
app.use("/users", users);
app.use("/recipes", recipes);
app.use(userVerify);

//if non of the above:
app.use((req, res) => {
  res.sendStatus(404);
});

app.use(function (err, req, res, next) {
  console.error(err);
  res
    .status(err.status || 500)
    .send({ message: err.message || "Internal Server Error", success: false });
});

const server = app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});

process.on("SIGINT", function () {
  if (server) {
    server.close(() => console.log("server closed"));
  }
  process.exit();
});
