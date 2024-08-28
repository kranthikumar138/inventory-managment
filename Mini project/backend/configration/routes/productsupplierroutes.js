const express = require("express");
const router = express.Router();
const supplierproductController = require("../controllers/productsupplierController");

router.post(
  "/products/suppliers",
  supplierproductController.addSupplierToProduct
);
router.get( "/products/suppliers",
  supplierproductController.getAllProductSuppliers)

router.delete(
  "/products/suppliers",
  supplierproductController.removeSupplierFromProduct
);

module.exports = router;