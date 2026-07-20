// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock';
import {
  createPublicKey,
  createSign,
  generateKeyPairSync,
} from 'node:crypto';
import config from '../../config.js';

const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const publicJwk = createPublicKey(privateKey).export({ format: 'jwk' });
const encodeSegment = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const jwtHeader = { alg: 'RS256', kid: 'test-key-id', typ: 'JWT' };
const createIdToken = () => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: config.FC_URL,
    sub: '54ec12223fcaf10189cacb7111a24ef358539ff9dc550952c4279d9f57e6d7bdv1',
    aud: config.AUTHENTICATION_CLIENT_ID,
    exp: now + 3600,
    iat: now,
    nonce: 'test-nonce',
    idp: 'FC',
    acr: 'eidas2',
    amr: [],
  };
  const signingInput = `${encodeSegment(jwtHeader)}.${encodeSegment(payload)}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();

  return `${signingInput}.${signer.sign(privateKey).toString('base64url')}`;
};

// get https://fcp.dev.dev-franceconnect.fr/api/v1/token
export const validTokenConf = {
  reponseHttpStatusCode: 200,
  requestHeaders: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  requestBodyQuery: {
    grant_type: 'authorization_code',
    redirect_uri: `${config.FS_URL}${config.LOGIN_CALLBACK_FS_PATH}`,
    client_id: config.AUTHENTICATION_CLIENT_ID,
    client_secret: config.AUTHENTICATION_CLIENT_SECRET,
    code: '5b55b5616c607ee6b84d0cec2a8b82c58f31a03d17264d4e294ae14413a2f19b',
  },
  responseBody: {
    access_token: 'ae3b27ba14bdc9f864f5c5e396b507c1c1064fc951eb68bb8bab6283e81e7d75',
    token_type: 'Bearer',
    expires_in: 1200,
    id_token: createIdToken(),
  },
};
export const invalidTokenConf = {
  reponseHttpStatusCode: 400,
  requestHeaders: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  requestBodyQuery: {
    grant_type: 'authorization_code',
    redirect_uri: `${config.FS_URL}${config.LOGIN_CALLBACK_FS_PATH}`,
    client_id: config.AUTHENTICATION_CLIENT_ID,
    client_secret: config.AUTHENTICATION_CLIENT_SECRET,
    code: 'invalid-code',
  },
  responseBody: { status: 'fail', message: 'invalid_grant' },
};

export const discoveryConf = {
  responseHttpStatusCode: 200,
  responseBody: {
    issuer: config.FC_URL,
    authorization_endpoint: `${config.FC_URL}${config.AUTHORIZATION_FC_PATH}`,
    token_endpoint: `${config.FC_URL}${config.TOKEN_FC_PATH}`,
    userinfo_endpoint: `${config.FC_URL}${config.USERINFO_FC_PATH}`,
    end_session_endpoint: `${config.FC_URL}${config.LOGOUT_FC_PATH}`,
    jwks_uri: `${config.FC_URL}/jwks`,
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    token_endpoint_auth_methods_supported: ['client_secret_post'],
    claims_supported: ['sub', 'given_name', 'family_name'],
  },
};

// get https://fcp.dev.dev-franceconnect.fr/api/v1/userinfo
export const validUserInfoConf = {
  reponseHttpStatusCode: 200,
  requestHeaders: {
    Authorization: 'Bearer ae3b27ba14bdc9f864f5c5e396b507c1c1064fc951eb68bb8bab6283e81e7d75',
  },
  responseBody: {
    sub: '54ec12223fcaf10189cacb7111a24ef358539ff9dc550952c4279d9f57e6d7bdv1',
    _claim_names: {},
    _claim_sources: {
      src1: {
        JWT: 'foo.bar.baz',
      },
    },
    given_name: 'Melaine',
    family_name: 'TROIS',
    gender: 'female',
    birthdate: '1981-07-27',
    preferred_username: 'MELAINETROIS',
    birthplace: '',
    birthcountry: '99100',
  },
};

// This will intercepts every calls made to france connect server and returns a mocked response
export const initializeMocks = () => {
  nock(config.FC_URL)
    .persist()
    .get('/.well-known/openid-configuration')
    .reply(discoveryConf.responseHttpStatusCode, discoveryConf.responseBody);

  nock(config.FC_URL)
    .persist()
    .get('/jwks')
    .reply(200, {
      keys: [{
        ...publicJwk,
        use: 'sig',
        alg: 'RS256',
        kid: 'test-key-id',
      }],
    });

  nock(config.FC_URL)
    .persist()
    .post(
      config.TOKEN_FC_PATH,
      (body) => new URLSearchParams(body).get('code') === validTokenConf.requestBodyQuery.code,
    )
    .reply(validTokenConf.reponseHttpStatusCode, validTokenConf.responseBody);

  nock(config.FC_URL)
    .persist()
    .post(
      config.TOKEN_FC_PATH,
      (body) => new URLSearchParams(body).get('code') === invalidTokenConf.requestBodyQuery.code,
    )
    .reply(invalidTokenConf.reponseHttpStatusCode, invalidTokenConf.responseBody);

  nock(config.FC_URL)
    .persist()
    .get(config.USERINFO_FC_PATH)
    .reply(validUserInfoConf.reponseHttpStatusCode, validUserInfoConf.responseBody);
};

export const cleanMocks = nock.cleanAll;
