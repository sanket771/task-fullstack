const { default: mongoose } = require("mongoose");

const productTransactionSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    dateOfSale: Date,
    category: String,
    sold: Boolean,
  });
  
  const ProductTransaction = mongoose.model('ProductTransaction', productTransactionSchema);
  
 module.exports=ProductTransaction