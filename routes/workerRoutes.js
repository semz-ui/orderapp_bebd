const express = require("express");
const {
  regWorker,
  loginWorker,
  getMe,
  verifyUser,
  VerificationCompletion,
  getAll,
  singleUser,
} = require("../controllers/workerController");
const { protectWorker } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", regWorker);
router.get("/all", getAll);
router.post("/login", loginWorker);
router.post("/verify", protectWorker, verifyUser);
router.get("/me", protectWorker, getMe);
router.get("/single/:id", protectWorker, singleUser);
router.post("/verify-code", protectWorker, VerificationCompletion);

module.exports = router;
