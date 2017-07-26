'use strict';

const restify = require('restify');

const server = restify.createServer();
const sessions = require('client-sessions');

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(sessions({
  cookieName: 'testGoogleSession', // cookie name dictates the key name added to the request object 
  secret: 'blargadeeblargblarg', // should be a large unguessable string 
  duration: 24 * 60 * 60 * 1000,
}));

const authorization = require('./js/authorization.js')(server);

server.use((req, res, next) => {
  if (req.testGoogleSession && req.testGoogleSession.accessToken) {
    return next();
  }
  authorization.authorize(req, res, next);
});

server.get('/protected/resource', (req, res, next) => {
  const name = req.testGoogleSession.name;
  const body = `<h1>Congratulations ${name}!</h1>
                <h2>You've reached the protected resource!</h2>`;

  res.set('Content-Length', Buffer.byteLength(body));
  res.set('Content-Type', 'text/html; charset=utf-8');

  res.write(body);
  res.end();
  return next();
});

console.log('Test using http://localhost:3000/protected/resource');
server.listen(3000);
