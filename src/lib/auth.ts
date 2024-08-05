import { CLIENT_ID,CLIENT_SECRET } from "$env/static/private";
const config = {
  client: {
    id: CLIENT_ID,
    secret: CLIENT_SECRET
  },
  auth: {
    tokenHost: 'https://api.genius.com'
  }
};

import { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } from 'simple-oauth2';

const client = new ClientCredentials(config);

export async function getAccessToken() {
  try {
    const tokenParams = {};
    const accessToken = await client.getToken(tokenParams);
    return accessToken.token.access_token;
  } catch (error) {
    console.error('Access Token error', error.message);
    throw error;
  }
}