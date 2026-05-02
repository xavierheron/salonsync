const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: String,
    required: [true, 'Service is required']
  },
  date: {
    type: String,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  status: {
    type: String,
    enum: ['Pending Payment', 'Paid', 'Completed'],
    default: 'Pending Payment'
  },
  price: {
    type: Number,
    default: 0
  }
}, { timestamps: true });



module.exports = mongoose.model('Appointment', appointmentSchema);