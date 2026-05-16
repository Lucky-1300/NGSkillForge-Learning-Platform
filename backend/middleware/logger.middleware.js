// This middleware prints request details in the console.
const morgan = require("morgan");

const loggerMiddleware = morgan("dev");

module.exports = loggerMiddleware;