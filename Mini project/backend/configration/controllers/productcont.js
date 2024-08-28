const Product = require("../models/productModel");
const redis = require("redis");
const client = redis.createClient();

client.on("error", (err) => {
  console.log("Redis Client Error", err);
});
client.connect();
exports.create = async (req, res) => {
  const { name, sku, description, price, current_stock, reorder_level } =
    req.body;

  try {
    Product.create(
      { name, sku, description, price, current_stock, reorder_level },
      async (err, product) => {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }

        client.set(
          `product:${product.id}`,
          JSON.stringify(product),
          (cacheErr) => {
            if (cacheErr) {
              console.error("Failed to update cache:", cacheErr);
            }
          }
        );

        res.status(201).json({
          success: true,
          message: "Product created successfully",
          data: product,
        });
      }
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
   
    client.get("products", async (cacheErr, cachedProducts) => {
      if (cacheErr) {
        console.error("Cache read error:", cacheErr);
        return res
          .status(500)
          .json({ success: false, message: cacheErr.message });
      }

      if (cachedProducts) {
       
        return res.status(200).json({
          success: true,
          message: "All products retrieved successfully from cache",
          data: JSON.parse(cachedProducts),
        });
      }

     
      Product.readAll(async (dbErr, products) => {
        if (dbErr) {
          return res
            .status(500)
            .json({ success: false, message: dbErr.message });
        }

        
        client.set("products", JSON.stringify(products), (cacheSetErr) => {
          if (cacheSetErr) {
            console.error("Failed to update cache:", cacheSetErr);
          }
        });

        res.status(200).json({
          success: true,
          message: "All products retrieved successfully from database",
          data: products,
        });
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    
    client.get(`product:${id}`, async (cacheErr, cachedProduct) => {
      if (cacheErr) {
        console.error("Cache read error:", cacheErr);
        return res
          .status(500)
          .json({ success: false, message: cacheErr.message });
      }

      if (cachedProduct) {
    
        return res.status(200).json({
          success: true,
          message: "Product retrieved successfully from cache",
          data: JSON.parse(cachedProduct),
        });
      }

     
      Product.readById(id, (dbErr, product) => {
        if (dbErr) {
          return res
            .status(500)
            .json({ success: false, message: dbErr.message });
        }

        if (!product) {
          return res
            .status(404)
            .json({ success: false, message: "Product not found" });
        }

        
        client.set(`product:${id}`, JSON.stringify(product), (cacheSetErr) => {
          if (cacheSetErr) {
            console.error("Failed to update cache:", cacheSetErr);
          }
        });

        res.status(200).json({
          success: true,
          message: "Product retrieved successfully",
          data: product,
        });
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    Product.update(id, body, async (err, product) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
      }

      
      client.set(`product:${id}`, JSON.stringify(product), (cacheErr) => {
        if (cacheErr) {
          console.error("Failed to update cache:", cacheErr);
        }
      });

      res.status(200).json({
        success: true,
        data: product,
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  try {
    Product.delete(id, async (err, product) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      
      client.del(`product:${id}`, (cacheErr) => {
        if (cacheErr) {
          console.error("Failed to invalidate cache:", cacheErr);
        }
      });

      res.status(200).json({
        success: true,
        data: product,
      });
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getProductByName = (req, res) => {
  const { name } = req.body;

  try {
    
    client.get(`product:name:${name}`, async (cacheErr, cachedProduct) => {
      if (cacheErr) {
        console.error("Cache read error:", cacheErr);
        return res
          .status(500)
          .json({ success: false, message: cacheErr.message });
      }

      if (cachedProduct) {
        
        return res.status(200).json({
          success: true,
          data: JSON.parse(cachedProduct),
        });
      }

      
      Product.readByName(name, (dbErr, product) => {
        if (dbErr) {
          return res.status(500).json({
            success: false,
            message: dbErr.message,
          });
        }

        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        
        client.set(
          `product:name:${name}`,
          JSON.stringify(product),
          (cacheSetErr) => {
            if (cacheSetErr) {
              console.error("Failed to update cache:", cacheSetErr);
            }
          }
        );

        res.status(200).json({
          success: true,
          data: product,
        });
      });
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};