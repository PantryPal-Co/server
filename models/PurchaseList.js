import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const PurchaseListSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  items: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Item',
    },
  ],
  purchaseListTotal: {
    type: Number,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const PurchaseList = mongoose.model('PurchaseList', PurchaseListSchema);
export default PurchaseList;
