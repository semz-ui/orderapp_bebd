const express = require("express");
const {
  subscribe,
  createProduct,
  createPlan,
  fetchPlan,
  createPrice,
  retrieveCustomer,
  paymentUpdate,
} = require("../controllers/paymentConroller");

const router = express.Router();

router.post("/create-product", createProduct);
router.post("/create-plan", createPlan);
router.post("/subscribe", subscribe);
router.post("/create-price", createPrice);
router.post("/pay-update", paymentUpdate);
router.get("/fetch-plan", fetchPlan);
router.get("/retrieve-customer", retrieveCustomer);

module.exports = router;
