import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    // required: true,
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    // required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  expiryDate: {
    type: Date,
  },
});

const Item = mongoose.model('Item', ItemSchema);
export default Item;
