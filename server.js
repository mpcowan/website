const compression = require('compression');
const express = require('express');
const app = express();

// compress our client side content before sending it over the wire
app.use(compression());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// listen for requests
const listener = app.listen(process.env.PORT, function () {
  console.info(`Node Version: ${process.version}`);
  console.log('Listening on port: ' + listener.address().port);
});
