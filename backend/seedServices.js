const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');

dotenv.config();

const defaultServices = [
  { name: 'Haircut', description: 'Cut & style', price: 20, duration: 30 },
  { name: 'Styling', description: 'Wash, blow-dry & style', price: 30, duration: 45 },
  { name: 'Coloring', description: 'Full color or highlights', price: 50, duration: 90 },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    for (const s of defaultServices) {
      const exists = await Service.findOne({ name: s.name });
      if (!exists) {
        await Service.create(s);
        console.log(`✅ Created: ${s.name}`);
      } else {
        console.log(`⏭ Already exists: ${s.name}`);
      }
    }
    console.log('Seeding complete!');
    process.exit();
  })
  .catch(err => {
    console.error('Failed:', err.message);
    process.exit(1);
  });