/**
 * Entry point of the service provider(FS) demo app.
 * @see @link{ https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service# }
 */
import express from 'express';
import logger from 'morgan';
import session from 'express-session';
import sessionstore from 'sessionstore';
import config from './config.js';
import {
  getAuthorizationUrlForAuthentication,
  getAuthorizationUrlForData,
  getLogoutUrl,
} from './helpers/utils.js';
import { oauthLoginCallback, oauthLogoutCallback } from './controllers/oauthAuthenticationCallback.js';
import oauthDataCallback from './controllers/oauthDataCallback.js';

const app = express();
const sessionSecret = process.env.SESSION_SECRET || 'demo-secret-change-in-production';

if (!process.env.SESSION_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('SESSION_SECRET is not set; using the demo fallback secret. Set SESSION_SECRET in production.');
}

// Note this enable to store user session in memory
// As a consequence, restarting the node process will wipe all sessions data
app.use(session({
  store: sessionstore.createSessionStore(),
  secret: sessionSecret,
  cookie: {},
  saveUninitialized: true,
  resave: true,
}));

if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

app.use(express.static('public'));

app.set('view engine', 'ejs');

// define variable globally for the footer
app.locals.franceConnectKitUrl = `${config.FC_URL}${config.FRANCE_CONNECT_KIT_PATH}`;

// pass the user data from session to template global variables
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.get('/', (req, res) => res.render('pages/home'));

app.get('/login', (req, res) => res.render('pages/login'));

app.get('/login-with-france-connect', async (req, res, next) => {
  try {
    res.redirect(await getAuthorizationUrlForAuthentication(req));
  } catch (error) {
    next(error);
  }
});

app.get('/login-callback', oauthLoginCallback);

app.get('/logout', async (req, res, next) => {
  try {
    res.redirect(await getLogoutUrl(req));
  } catch (error) {
    next(error);
  }
});

app.get('/logout-callback', oauthLogoutCallback);

app.get('/data', async (req, res, next) => {
  try {
    res.redirect(await getAuthorizationUrlForData(req));
  } catch (error) {
    next(error);
  }
});

app.get('/data-callback', oauthDataCallback);

// Setting app port
const port = process.env.PORT || '3000';
// Starting server
const server = app.listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`\x1b[32mServer listening on http://0.0.0.0:${port}\x1b[0m`);
});

export default server;
