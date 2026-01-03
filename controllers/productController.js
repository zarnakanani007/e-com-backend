import Products from "../models/Products.js";
import { upload } from "../config/cloudinary.js";

// Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, inStock, category } = req.body;

    const product = new Products({
      name,
      description,
      price,
      inStock,
      category: category || 'Clothing', // by default add this 
      image: req.file?.path || "",
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Products 
export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;

    let filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    const products = await Products.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Product By ID
export const getProductById = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found!" });

    const { name, description, price, inStock, category } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.inStock = inStock === 'true' || inStock === true;
    product.category = category || product.category;

    if (req.file?.path) {
      product.image = req.file.path;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Products.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};