const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Worker = require("../model/workerModel");

const protectWorker = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get token from header
      token = req.headers.authorization.split(" ")[1];
      //Verify token
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      // get user from database
      req.user = await Worker.findById(decode.id).select("-password");
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({
        message: "Not Authorized to access this route",
      });
    }
  }
  if (!token) {
    res.status(401).json({
      message: "Not Authorized No token",
    });
  }
});

module.exports = {
  protectWorker,
};
