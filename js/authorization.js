'use strict';

const Issuer = require('openid-client').Issuer;

let client;

Issuer.discover('https://accounts.google.com') // => Promise 
  .then((googleIssuer) => {
    console.log('Discovered issuer Google');
    client = new googleIssuer.Client({
      client_id: '<id>',
      client_secret: '<secret>',
    });
  });

function authorize(req, res, next) {
  req.testGoogleSession.originalUrl = req.url;
  const url = client.authorizationUrl({
    redirect_uri: 'http://localhost:3000/callback',
    scope: 'profile',
  }); // => String (URL) 
  res.redirect(url, next);
}

module.exports = function (server) {
  server.get('/callback', (req, res, next) => {
    const code = req.query.code;
    const access_type = 'offline';
    client.authorizationCallback('http://localhost:3000/callback', { code, access_type }) // => Promise 
      .then((tokenSet) => {
        req.testGoogleSession.accessToken = tokenSet.access_token;
        req.testGoogleSession.name = tokenSet.claims.name;
        res.redirect(req.testGoogleSession.originalUrl, next);
      })
      .catch((error) => {
        console.error('Error processing callback', err);
        req.testGoogleSession.reset();
        res.send(500, { error });
      });
  });

  return { authorize };
};
