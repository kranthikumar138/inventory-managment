const db = require("../config/db");

const PS = {
  create: (data, callback) => {
    const query =
      "INSERT INTO product_suppliers (product_id, supplier_id) VALUES (?, ?);";
    db.query(
      query,
      [
        data.product_id,
        data.supplier_id,
      ],
      callback 
    );
  },

  readAll: (productId, supplierId, callback) => {
    const query = "SELECT * FROM product_suppliers WHERE product_id = ? AND supplier_id = ?";
    db.query(query, [productId, supplierId], callback); 
  },

  delete: (product_id, supplier_id, callback) => {
    const query = "DELETE FROM product_suppliers WHERE product_id = ? AND supplier_id = ?;";
    db.query(query, [product_id, supplier_id], callback); 
  },
};

module.exports = PS;