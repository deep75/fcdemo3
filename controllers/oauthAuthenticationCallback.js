/**
 * Helper to get an access token from France Connect.
 * @see @link{ https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service# }
 */
import {
  AUTHENTICATION_REDIRECT_URI,
  clearAuthenticationRequest,
  clearLogoutRequest,
  getAuthenticationClient,
  getAuthenticationRequest,
  isValidLogoutState,
} from '../helpers/utils.js';

/**
 * Init FranceConnect authentication login process.
 * Make every http call to the different API endpoints.
 */
export const oauthLoginCallback = async (req, res, next) => {
  // check if the mandatory Authorization code is there
  if (!req.query.code) {
    return res.sendStatus(400);
  }

  const requestChecks = getAuthenticationRequest(req);

  if (!requestChecks?.state || !requestChecks?.nonce) {
    return res.sendStatus(400);
  }

  try {
    const client = await getAuthenticationClient();
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(AUTHENTICATION_REDIRECT_URI, params, requestChecks);
    clearAuthenticationRequest(req);

    if (!tokenSet.access_token) {
      return res.sendStatus(401);
    }

    // Store the idToken in session so it is available for logout
    req.session.idToken = tokenSet.id_token;

    // Store the user in session so it is available for future requests
    req.session.user = await client.userinfo(tokenSet);

    return res.redirect('/');
  } catch (error) {
    clearAuthenticationRequest(req);
    return next(error);
  }
};

export const oauthLogoutCallback = (req, res) => {
  if (!isValidLogoutState(req)) {
    return res.sendStatus(400);
  }

  clearLogoutRequest(req);
  // Remove idToken from session
  req.session.idToken = null;
  // Remove user from session
  req.session.user = null;

  return res.redirect('/');
};
