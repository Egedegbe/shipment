const mongoose = require('mongoose');
const moment = require("moment");
const shipmentSchema = new mongoose.Schema({
    trackingNumber: { type: String, required: true, unique: true },
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    senderAddress: { type: String, required: true },
    senderCountry: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    recipientPhoneNumber: { type: String, },
    recipientAddress: { type: String, required: true },
    recipientCity: { type: String, required: true },
    recipientCountry: { type: String, required: true },
    packageName: { type: String, required: true },
    packageDescription: { type: String },
    weight: { type: Number, required: true },
    // packageLocation: { type: String, required: true },
    packageValue: { type: String, required: true },
    shippingMethod: { type: String, required: true },
    shipmentDate: { type: Date, required: true },
    expectedDeliveryDate: { type: Date, required: true },
    insurance: { type: Boolean, default: false }, // Checkbox for fragile package
    packageImage: { type: String }, // URL or path to the image
    history: [
        {
          status: { type: String }, 
          currentDate: { type: Date, default: Date.now },
          notes: { type: String },   
          location: { type: String }, 
        }
      ]
},{timestamps:true});

// Virtual for formatted shipmentDate
shipmentSchema.virtual('formattedShipmentDate').get(function () {
    return moment(this.shipmentDate).format('MMMM DD, YYYY');
  });
  
  // Virtual for formatted expectedDeliveryDate
  shipmentSchema.virtual('formattedExpectedDeliveryDate').get(function () {
    return moment(this.expectedDeliveryDate).format('MMMM DD, YYYY');
  });
  shipmentSchema.virtual('formattedcurrentDate').get(function () {
    return moment(this.currentDate).format('MMMM DD, YYYY');
  });
  
  // Ensure virtual fields are serialized
  shipmentSchema.set('toJSON', { virtuals: true });
  shipmentSchema.set('toObject', { virtuals: true });
  

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;
