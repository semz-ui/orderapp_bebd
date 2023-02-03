const asyncHandler = require("express-async-handler");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY);
const Worker = require("../model/workerModel");
const Token = require("../model/tokenModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// create user
// route Post users/api/

const regWorker = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, status, password, bio, verified } =
    req.body;
  if (!firstName || !lastName || !email || !status || !password || !verified) {
    res.status(400).json({
      message: "Please input all fields",
    });
  }

  //hashedPassword
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const customer = await stripe.customers.create({
    email: req.body.email,
    description: "New customer",
    payment_method: "pm_card_visa", // Example payment method
    invoice_settings: {
      default_payment_method: "pm_card_visa",
    },
    metadata: { user_id: req.body.user_id },
  });
  // res.send({ customer_id: customer.id, customer });

  const userExists = await Worker.findOne({ email });
  if (userExists) {
    res.status(400).json({
      message: "User Exists",
    });
  } else {
    //create worker
    const worker = await Worker.create({
      firstName,
      lastName,
      email,
      status,
      bio,
      verified,
      stripeId: customer.id,
      password: hashedPassword,
    });
    if (worker) {
      res.status(201).json({
        _id: worker.id,
        firstName: worker.firstName,
        lastName: worker.lastName,
        email: worker.email,
        verified: worker.verified,
        bio: worker.bio,
        status: worker.status,
        stripeId: customer.id,
        token: generateToken(worker._id),
      });
    } else {
      res.status(400).json({
        message: "Can't create User",
      });
    }
    console.log(worker);
  }
});

// user login
//route: Post users/api/login

const loginWorker = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      message: "Please input all fields",
    });
  }
  const worker = await Worker.findOne({ email });
  if (!worker) {
    res.status(400).json({
      message: "User doen't exist",
    });
  }
  if (worker && (await bcrypt.compare(password, worker.password))) {
    res.status(200).json({
      _id: worker.id,
      firstName: worker.firstName,
      lastName: worker.lastName,
      email: worker.email,
      status: worker.status,
      token: generateToken(worker._id),
    });
  }
  console.log(worker);
});

// desc get user data
// route Post api/users/me
//access Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

const getAll = asyncHandler(async (req, res) => {
  const worker = await Worker.find();
  res.status(200).json(worker);
});

// desc get single goal
// route Get api/goals/:id
//access Private
const singleUser = asyncHandler(async (req, res) => {
  const user = await Worker.findById(req.params.id);

  if (!user) {
    res.status(400);
    throw new Error("Goal not found");
  }

  // Make sure user is owner of goal
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});

// desc send verify code
//access Public
const verifyUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await Worker.findOne({ email: email });
  console.log(user);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  // Generate a verification token
  const token = await new Token({
    userId: user._id,
    email: email,
    token: crypto.randomBytes(2).toString("hex"),
  }).save();
  console.log(token);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification",
    text: `Code for verification ${token.token}`,
  };
  console.log("sendin email");

  transporter.sendMail(mailOptions, function (err, res) {
    if (err) {
      console.log("error", err);
    } else {
      console.log("email sent", res);
    }
  });
  res.status(200).json({ message: "email sent", token });
});

const VerificationCompletion = asyncHandler(async (req, res) => {
  const { token, email } = req.body;
  if (!token) {
    res.status(400);
    throw new Error("Token is required");
  }
  //Find User
  const user = await Worker.findOne({ email: email });
  if (!user) {
    res.status(400).json({
      message: "Invalid Link",
    });
  }
  // Find token
  const VerifyToken = await Token.findOne({ email: email });

  if (!VerifyToken) {
    res.status(400).json({
      message: "Please Reset verification token",
    });
  }
  await Worker.findByIdAndUpdate(user._id, { verified: "true" });
  await VerifyToken.remove();
  res.status(200).json({
    message: "Verified successfully",
    user,
  });
  console.log(user);
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports = {
  regWorker,
  loginWorker,
  getMe,
  verifyUser,
  VerificationCompletion,
  getAll,
  singleUser,
};
