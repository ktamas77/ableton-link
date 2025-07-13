const bindings = require('bindings');
const addon = bindings('abletonlink');

// Export the native AbletonLink class
module.exports.AbletonLink = addon.AbletonLink;

// Convenience export for ES6 imports
module.exports.default = addon.AbletonLink;