const compression = require('compression');
const express = require('express');
const expressWinston = require('express-winston');
const winston = require('winston'); // for transports.Console
const app = express();

// compress our client side content before sending it over the wire
app.use(compression());

// request logging
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ]
}));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// error logging
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ]
}));

// listen for requests
const listener = app.listen(process.env.PORT, function () {
  console.info(`Node Version: ${process.version}`);
  console.log('Listening on port: ' + listener.address().port);
});
