import axios from 'axios';
import config from '../config.js';
import {
  clearDataRequest,
  DATA_REDIRECT_URI,
  getDataClient,
  getDataRequest,
} from '../helpers/utils.js';

/**
 * Use to send the access token to an data provider.
 * @return Response with the queried data from the provider.
 * @see @link{ https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-donnees }
 * @see @link{ https://github.com/france-connect/data-providers-examples }
 */
const oauthDataCallback = async (req, res, next) => {
  // check if the mandatory Authorization code is there
  if (!req.query.code) {
    return res.sendStatus(400);
  }

  const requestChecks = getDataRequest(req);

  if (!requestChecks?.state || !requestChecks?.nonce) {
    return res.sendStatus(400);
  }

  try {
    const client = await getDataClient();
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(DATA_REDIRECT_URI, params, requestChecks);
    clearDataRequest(req);

    if (!tokenSet.access_token) {
      return res.sendStatus(401);
    }

    // Only valid if it's used with https://github.com/france-connect/data-provider-example/
    // If you want to use your own code change the url's value in the config/config.json file.
    const { data } = await axios.get(
      `${config.FD_URL}${config.DGFIP_DATA_FD_PATH}`,
      {
        headers: { Authorization: `Bearer ${tokenSet.access_token}` },
      },
    );

    return res.render('pages/data', {
      data: JSON.stringify(data, null, 2),
    });
  } catch (error) {
    clearDataRequest(req);
    return next(error);
  }
};

export default oauthDataCallback;
