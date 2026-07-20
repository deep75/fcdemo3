/**
 * Format the url use in the redirection call
 * to the France Connect Authorization and logout API endpoint.
 * @see @link{ https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service# }
 */
import openidClient from 'openid-client';
import config from '../config.js';

const { Issuer, generators } = openidClient;

export const AUTHENTICATION_REDIRECT_URI = `${config.FS_URL}${config.LOGIN_CALLBACK_FS_PATH}`;
export const DATA_REDIRECT_URI = `${config.FS_URL}${config.DATA_CALLBACK_FS_PATH}`;
export const LOGOUT_REDIRECT_URI = `${config.FS_URL}${config.LOGOUT_CALLBACK_FS_PATH}`;

const AUTHENTICATION_SESSION_KEY = 'authenticationRequest';
const DATA_SESSION_KEY = 'dataRequest';
const LOGOUT_SESSION_KEY = 'logoutRequest';

let franceConnectIssuerPromise;
let authenticationClientPromise;
let dataClientPromise;

const getState = () => (process.env.NODE_ENV === 'test' ? 'test-state' : generators.state());
const getNonce = () => (process.env.NODE_ENV === 'test' ? 'test-nonce' : generators.nonce());
const getLogoutState = () => (process.env.NODE_ENV === 'test' ? 'test-logout-state' : generators.state());

const getFranceConnectIssuer = async () => {
  if (!franceConnectIssuerPromise) {
    franceConnectIssuerPromise = Issuer.discover(config.FC_URL);
  }

  return franceConnectIssuerPromise;
};

const createClient = async ({ clientId, clientSecret, redirectUri }) => {
  const issuer = await getFranceConnectIssuer();

  return new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [redirectUri],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
  });
};

const storeAuthorizationRequest = (req, sessionKey) => {
  const state = getState();
  const nonce = getNonce();

  req.session[sessionKey] = { state, nonce };

  return req.session[sessionKey];
};

const clearSessionValue = (req, sessionKey) => {
  delete req.session[sessionKey];
};

const storeLogoutRequest = (req) => {
  const state = getLogoutState();

  req.session[LOGOUT_SESSION_KEY] = { state };

  return req.session[LOGOUT_SESSION_KEY];
};

export const getAuthenticationClient = async () => {
  if (!authenticationClientPromise) {
    authenticationClientPromise = createClient({
      clientId: config.AUTHENTICATION_CLIENT_ID,
      clientSecret: config.AUTHENTICATION_CLIENT_SECRET,
      redirectUri: AUTHENTICATION_REDIRECT_URI,
    });
  }

  return authenticationClientPromise;
};

export const getDataClient = async () => {
  if (!dataClientPromise) {
    dataClientPromise = createClient({
      clientId: config.DATA_CLIENT_ID,
      clientSecret: config.DATA_CLIENT_SECRET,
      redirectUri: DATA_REDIRECT_URI,
    });
  }

  return dataClientPromise;
};

const getAuthorizationUrl = async ({
  clientPromise,
  redirectUri,
  scope,
  req,
  sessionKey,
}) => {
  const client = await clientPromise();
  const { state, nonce } = storeAuthorizationRequest(req, sessionKey);

  return client.authorizationUrl({
    scope,
    state,
    nonce,
    redirect_uri: redirectUri,
    response_type: 'code',
  });
};

export const getAuthorizationUrlForAuthentication = (req) => getAuthorizationUrl({
  clientPromise: getAuthenticationClient,
  redirectUri: AUTHENTICATION_REDIRECT_URI,
  scope: `${config.MANDATORY_SCOPES} ${config.FC_SCOPES}`,
  req,
  sessionKey: AUTHENTICATION_SESSION_KEY,
});

export const getAuthorizationUrlForData = (req) => getAuthorizationUrl({
  clientPromise: getDataClient,
  redirectUri: DATA_REDIRECT_URI,
  scope: `${config.MANDATORY_SCOPES} ${config.DGFIP_SCOPES}`,
  req,
  sessionKey: DATA_SESSION_KEY,
});

export const getAuthenticationRequest = (req) => req.session[AUTHENTICATION_SESSION_KEY];
export const clearAuthenticationRequest = (req) => clearSessionValue(
  req,
  AUTHENTICATION_SESSION_KEY,
);

export const getDataRequest = (req) => req.session[DATA_SESSION_KEY];
export const clearDataRequest = (req) => clearSessionValue(req, DATA_SESSION_KEY);

/**
 * Format the url 's that is used in a redirect call to France Connect logout API endpoint
 * @returns {string}
 */
export const getLogoutUrl = async (req) => {
  const client = await getAuthenticationClient();
  const { state } = storeLogoutRequest(req);
  const parameters = {
    state,
    post_logout_redirect_uri: LOGOUT_REDIRECT_URI,
  };

  if (req.session.idToken) {
    parameters.id_token_hint = req.session.idToken;
  }

  return client.endSessionUrl(parameters);
};

export const isValidLogoutState = (req) => req.session[LOGOUT_SESSION_KEY]
  && req.query.state === req.session[LOGOUT_SESSION_KEY].state;

export const clearLogoutRequest = (req) => clearSessionValue(req, LOGOUT_SESSION_KEY);
