const path = require('path');

// Load environment-specific configs
const suffix = process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '';
require('dotenv').config({
  path: path.resolve(process.cwd(), `.env${suffix}`)
});
