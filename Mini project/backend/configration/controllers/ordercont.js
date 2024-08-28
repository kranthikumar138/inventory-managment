const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const PurchaseOrder = require("../models/purchaseOrderModel");
const redis = require('redis');
const client = redis.createClient();

client.on('error', (err) => {
  console.log('Redis Client Error', err);
});
client.connect();


exports.createOrder = async (req, res) => {
  const { product_id, quantity, order_date, status } = req.body;

  try {
    
    const cachedProduct = await client.get(`product_${product_id}`);

    let product;
    if (cachedProduct) {
      product = JSON.parse(cachedProduct);
    } else {
      
      product = await Product.readById(product_id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      await client.set(`product_${product_id}`, JSON.stringify(product), 'EX', 3600); // Cache for 1 hour
    }

   
    if (product.current_stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

   
    const order = await Order.create({ product_id, quantity, order_date, status });
    if (!order) {
      return res.status(500).json({ error: "Failed to create order" });
    }

   
    product.current_stock -= quantity;
    await product.save();

    
    await client.set(`product_${product_id}`, JSON.stringify(product), 'EX', 3600); // Refresh the cache

    
    if (product.current_stock < product.reorder_level) {
      
      await PurchaseOrder.create({
        product_id: product.id,
        quantity: product.reorder_level * 2, 
        status: "ordered",
      });

    
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (err) {
    console.error("An error occurred while creating the order:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the order",
    });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    
    const cachedOrders = await client.get("all_orders");

    if (cachedOrders) {
     
      return res.status(200).json({
        success: true,
        message: "All Orders retrieved successfully from cache",
        data: JSON.parse(cachedOrders),
      });
    }

  
    Order.readAll(async (err, orders) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      
      await client.set("all_orders", JSON.stringify(orders), 'EX', 3600); 
      res.status(200).json({
        success: true,
        message: "All Orders retrieved successfully",
        data: orders,
      });
    });
  } catch (err) {
    console.error("Error while retrieving all orders:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
   
    const cachedOrder = await client.get(`order:${id}`);
    if (cachedOrder) {
      return res.status(200).json({
        success: true,
        message: "Order retrieved successfully from cache",
        data: JSON.parse(cachedOrder),
      });
    }

   
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

   
    await client.set(`order:${id}`, JSON.stringify(order), 'EX', 3600); // Cache for 1 hour

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (err) {
    console.error("Error while retrieving the order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    
    Order.update(id, body, async (err, order) => {
      if (err) {
        console.error("Error while updating order:", err);
        return res.status(500).json({ success: false, message: "Error while updating: " + err.message });
      }

      
      if (body.status === 'completed') {
        const product = await Product.readById(body.product_id);

        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }

        product.current_stock += order.quantity; 
        await product.save(); 
      }

      // 
      await client.set(`order:${id}`, JSON.stringify(order), 'EX', 3600); 

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
    });
  } catch (err) {
    console.error("Error in catch block while updating order:", err);
    res.status(500).json({ success: false, message: "Error while updating: " + err.message });
  }
};

exports.deleteOrder = (req, res) => {
  const { id } = req.params;

  try {
    Order.delete(id, async (err, order) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      
      client.del(`order:${id}`, (cacheErr) => {
        if (cacheErr) {
          console.error('Failed to delete cache:', cacheErr);
        }
        
        res.status(200).json({
          success: true,
          data: order,
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
