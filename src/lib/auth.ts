import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";
import {
  ClientCredentials,
  ResourceOwnerPassword,
  AuthorizationCode,
} from "simple-oauth2";
const config = {
  client: {
    id: CLIENT_ID,
    secret: CLIENT_SECRET,
  },
  auth: {
    tokenHost: "https://api.genius.com",
  },
};

const client = new ClientCredentials(config);

export async function getAccessToken() {
  try {
    const tokenParams = {};
    const accessToken = await client.getToken(tokenParams);
    return accessToken.token.access_token;
  } catch (error: any) {
    console.error("Access Token error", error.message);
    throw error;
  }
}
