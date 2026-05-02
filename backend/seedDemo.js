const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const demoAccounts = [
  {
    name: 'Demo Customer',
    email: 'customer@demo.com',
    password: 'demo1234',
    role: 'customer',
  },
  {
    name: 'Demo Staff',
    email: 'staff@demo.com',
    password: 'demo1234',
    role: 'staff',
  },
  {
    name: 'Demo Admin',
    email: 'admin@demo.com',
    password: 'demo1234',
    role: 'admin',
  },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    for (const account of demoAccounts) {
      const exists = await User.findOne({ email: account.email });
      if (!exists) {
        await User.create(account);
        console.log(`✅ Created: ${account.role} — ${account.email}`);
      } else {
        console.log(`⏭ Already exists: ${account.email}`);
      }
    }
    console.log('Demo seeding complete!');
    process.exit();
  })
  .catch(err => {
    console.error('Failed:', err.message);
    process.exit(1);
  });