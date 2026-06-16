const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../enode-restaurant-package/.env') });

const BillingConfigModel = require('../enode-restaurant-package/apps/api/src/models/billing_config');

async function check() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to:', uri);
    await mongoose.connect(uri);
    console.log('Connected.');

    const config = await BillingConfigModel.getInstance().getModel().findOne();
    console.log('Billing Config found:', JSON.stringify(config, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

check();
