const db = require("../config/db");

const Product = {
  create: (data, callback) => {
    const query =
      'INSERT INTO product (name, sku, description, price, current_stock, reorder_level) VALUES (?, ?, ?, ?, ?, ?);';
    db.query(
      query,
      [
        data.name,
        data.sku,
        data.description,
        data.price,
        data.current_stock,
        data.reorder_level,
      ],
      callback 
    );
  },

  readAll: (callback) => {
    const query = "SELECT * FROM product";
    db.query(query, callback); 
  },

  readById: (id, callback) => {
    const query = "SELECT * FROM product WHERE id=?";
    db.query(query, [id], callback); 
  },

  readByName: (name, callback) => {
    const query = "SELECT * FROM product WHERE name=?";
    db.query(query, [name], callback); 
  },

  update: (id, data, callback) => {
    const query =
      "UPDATE product SET name=?, sku=?, description=?, price=?, current_stock=?, reorder_level=? WHERE id=?;";
    db.query(
      query,
      [
        data.name,
        data.sku,
        data.description,
        data.price,
        data.current_stock,
        data.reorder_level,
        id,
      ],
      callback 
    );
  },

  delete: (id, callback) => {
    const query = "DELETE FROM product WHERE id=?";
    db.query(query, [id], callback); 
  },
};

module.exports = Product;