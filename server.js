const compression = require('compression');
const express = require('express');
const expressWinston = require('express-winston');
const fs = require('fs');
const marked = require('marked');
const path = require('path');
const Sentry = require('@sentry/node');
const winston = require('winston'); // for transports.Console
const app = express();

// Must configure Raven before doing anything else with it
Sentry.init({ dsn: process.env.SENTRY_DSN });

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

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

// The error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + '\n');
});

// listen for requests
const listener = app.listen(process.env.PORT || 8080, function () {
  console.info(`Node Version: ${process.version}`);
  console.log('Listening on port: ' + listener.address().port);
});
