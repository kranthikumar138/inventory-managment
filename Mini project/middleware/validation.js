app.post('/api/products', async (req, res) => {
    const { sku, name, description, price, stock } = req.body;
  

    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ error: 'SKU must be unique.' });
    }
  
  
    if (!name || !price || stock === undefined) {
      return res.status(400).json({ error: 'Name, price, and stock are required.' });
    }
  
    
    if (price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number.' });
    }
    if (stock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative.' });
    }
  
   
    const newProduct = new Product({ sku, name, description, price, stock });
    await newProduct.save();
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { sku, name, description, price, stock } = req.body;
  
   
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
  
    
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({ error: 'SKU must be unique.' });
      }
    }
  
    
    if (price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Price and stock are required.' });
    }
  
    
    if (price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number.' });
    }
    if (stock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative.' });
    }
  
    
    product.sku = sku || product.sku;
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price;
    product.stock = stock;
    await product.save();
    res.status(200).json(product);
  });

  app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
  
    
    await Product.deleteOne({ _id: id });
    res.status(204).send();
  });

  app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.status(200).json(product);
  });