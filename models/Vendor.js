import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const VendroSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
});

const Vendor = mongoose.model('Vendor', VendroSchema);
export default Vendor;
