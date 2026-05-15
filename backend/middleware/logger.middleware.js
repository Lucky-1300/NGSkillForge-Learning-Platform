const morgan = require("morgan");

const loggerMiddleware = morgan("dev");

module.exports = loggerMiddleware;