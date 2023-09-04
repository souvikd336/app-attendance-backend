const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");

const crypto = require("crypto");
const bigPromise = require("../middlewares/bigPromise");

exports.signup = BigPromise(async (req, res, next) => {
    //let result;
  
    const { name, email, password, course, coursetype} = req.body;
  
    if (!email || !name || !password || !course || !coursetype) {
      return next(new CustomError("Name, email, password, course and course type are required", 400));
    }
  
    const user = await User.create({
      name,
      email,
      password,
      course,
      coursetype,
    });
  
    cookieToken(user, res);
  });

  exports.login = bigPromise(async (req, res, next) => {
    const { email, password } = req.body;

    // check for presence of email and password
    if(!email || !password){
      return next(new CustomError("Please provide email and password", 400));
    }

    // get user from DB
    const user = await User.findOne({email}).select("+password");

    // if user not found in DB
    if (!user) {
      return next(
        new CustomError("Email or password does not match or exist", 400)
      );
    }

     // match the password
    const isPasswordCorrect = await user.isValidatedPassword(password);

    //if password do not match
    if (!isPasswordCorrect) {
      return next(
        new CustomError("Email or password does not match or exist", 400)
      );
    }

    // if all goes good and we send the token
    cookieToken(user, res);
  })

  exports.logout = bigPromise(async (req, res, next) => {
    //clear the cookie
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true, 
    });
    //send JSON response for success
    res.status(200).json({
      succes: true,
      message: "Logout success",
    });
  });