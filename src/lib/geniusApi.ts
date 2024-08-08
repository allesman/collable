import { getAccessToken } from "./auth";
import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";
import {
  ClientCredentials,
  ResourceOwnerPassword,
  AuthorizationCode,
} from "simple-oauth2";
// TODO: class pattern
// TODO: singleton pattern?
class GeniusApi {
  // auth
  config = {
    client: {
      id: CLIENT_ID,
      secret: CLIENT_SECRET,
    },
    auth: {
      tokenHost: "https://api.genius.com",
    },
  };
  accessToken: string;
  async constructor() {
    const client = new ClientCredentials(this.config);
    this.accessToken = await this.getAccessToken();
  }

  async getAccessToken() {
    try {
      const tokenParams = {};
      const accessToken = await this.client.getToken(tokenParams);
      return accessToken.token.access_token;
    } catch (error: any) {
      console.error("Access Token error", error.message);
      throw error;
    }
  }

  async searchGenius(query: string) {
    const accessToken = await getAccessToken();
    const response = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async getArtistInfo(query: string) {
    const accessToken = await getAccessToken();
    const response = await fetch(
      `https://api.genius.com/artists/${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log(data.response.artist.name);
    return data;
  }
}
