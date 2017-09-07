const compression = require('compression');
const express = require('express');
const expressWinston = require('express-winston');
const fs = require('fs');
const marked = require('marked');
const path = require('path');
const Raven = require('raven');
const winston = require('winston'); // for transports.Console
const app = express();

// Must configure Raven before doing anything else with it
Raven.config(process.env.SENTRY_DSN).install();
app.use(Raven.requestHandler());

// compress our client side content before sending it over the wire
app.use(compression());

// request logging
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ],
  meta: false,
  msg: "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
}));

// we want the images cached for essentially forever
app.use('/images', express.static('public/images', { maxage: '365d' }));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// error logging
// The error handler must be before any other error middleware
app.use(Raven.errorHandler());
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ]
}));

// rendered resume
app.get('/resume', (req, res) => {
  fs.readFile(path.join(__dirname, 'src/resume.md'), 'utf8', (err, data) => {
    if (err) {
      console.error(err.message);
      return res.sendStatus(500);
    }
    marked(data, (error, content) => {
      if (error) {
        console.error(error.message);
        return res.sendStatus(500);
      }
      fs.readFile(path.join(__dirname, 'src/resume.html'), 'utf8', (err, html) => {
        if (err) {
          console.error(err.message);
          return res.sendStatus(500);
        }
        return res.send(html.replace('{{RESUME_CONTENT}}', content));
      })
    })
  });
});

app.get('/github-markdown.css', (req, res) => {
  return res.sendFile(path.join(__dirname, 'node_modules/github-markdown-css/github-markdown.css'));
});

// temporary to test sentry
app.get('/error', (req, res) => {
  throw new Error('Sentry Testing...');
});

// listen for requests
const listener = app.listen(process.env.PORT || 8080, function () {
  console.info(`Node Version: ${process.version}`);
  console.log('Listening on port: ' + listener.address().port);
});
