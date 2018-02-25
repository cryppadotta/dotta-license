const path = require('path');

// Load environment-specific configs
const suffix =
  process.env.NODE_ENV === 'production'
    ? '.production'
    : process.env.NODE_ENV === 'staging' ? '.staging' : '';
require('dotenv').config({
  path: path.resolve(process.cwd(), `.env${suffix}`)
});
