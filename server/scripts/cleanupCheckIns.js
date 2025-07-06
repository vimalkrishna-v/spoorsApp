// scripts/cleanupCheckIns.js
// Usage: node scripts/cleanupCheckIns.js

const mongoose = require('mongoose');
const CheckIn = require('../models/CheckIn');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spoorsApp';

async function cleanupCheckIns() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // 1. Set status to 'checked-out' if checkOutTime is not null
  const res1 = await CheckIn.updateMany(
    { status: 'checked-in', checkOutTime: { $ne: null } },
    { $set: { status: 'checked-out' } }
  );
  console.log('Updated records with checkOutTime:', res1.modifiedCount);

  // 2. Set checkOutTime to null if status is 'checked-in' and checkOutTime missing
  const res2 = await CheckIn.updateMany(
    { status: 'checked-in', $or: [ { checkOutTime: { $exists: false } }, { checkOutTime: null } ] },
    { $set: { checkOutTime: null } }
  );
  console.log('Ensured checkOutTime is null for active check-ins:', res2.modifiedCount);

  // 3. For each user/operator, ensure only one active check-in
  const activeCheckIns = await CheckIn.aggregate([
    { $match: { status: 'checked-in', checkOutTime: null } },
    { $group: {
      _id: { userId: '$userId', operatorId: '$operatorId' },
      ids: { $push: '$_id' },
      count: { $sum: 1 },
      minId: { $min: '$_id' }
    } }
  ]);

  let closed = 0;
  for (const group of activeCheckIns) {
    if (group.count > 1) {
      // Keep the earliest, close the rest
      const toClose = group.ids.filter(id => id.toString() !== group.minId.toString());
      const res = await CheckIn.updateMany(
        { _id: { $in: toClose } },
        { $set: { status: 'checked-out', checkOutTime: new Date() } }
      );
      closed += res.modifiedCount;
    }
  }
  console.log('Closed duplicate active check-ins:', closed);

  await mongoose.disconnect();
  console.log('Cleanup complete.');
}

cleanupCheckIns().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
