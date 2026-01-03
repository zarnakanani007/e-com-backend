
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Shoes', 'Clothing', 'Electronics', 'Accessories', 'Books', 'Sports', 'Home', 'Beauty'],
    default: 'Clothing'
  }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;