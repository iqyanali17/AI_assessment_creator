const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer so that Chrome binaries
  // are stored locally within the project directory rather than ~/.cache/puppeteer.
  // This ensures Render persists the downloaded binary between build and runtime phases.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
