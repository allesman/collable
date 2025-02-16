import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";
import { error } from "console";
import { ClientCredentials, type AccessToken } from "simple-oauth2";

export default class GeniusApi {
  // singleton

  static #instance: GeniusApi;

  // auth

  #accessToken: AccessToken;

  private constructor(my_access_token: AccessToken) {
    this.#accessToken = my_access_token;
  }

  static async initialize() {
    if (this.#instance) {
      // Instance already exists, so return it
      return this.#instance;
    }

    // Instance does not exist, so create it

    // Create a client object with the client id and secret
    const config = {
      client: {
        id: CLIENT_ID,
        secret: CLIENT_SECRET,
      },
      auth: {
        tokenHost: "https://api.genius.com",
      },
    };
    const client: ClientCredentials = new ClientCredentials(config);

    // Get an access token using the client object
    try {
      const tokenParams = {};
      const accessToken = await client.getToken(tokenParams);
      if (!accessToken) {
        throw new Error("Access token not found");
      }
      // Create a new instance of GeniusApi with the access token and return it
      this.#instance = new GeniusApi(
        accessToken.token.access_token as AccessToken
      );
      return this.#instance;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Access Token error", error.message);
      }
      throw error;
    }
  }

  // methods the class provides for interacting with the Genius API

  async getSongs(artistId: string, per_page: number, page: number) {
    const response = await fetch(
      `https://api.genius.com/artists/${artistId}/songs?per_page=${per_page}&page=${page}&sort=popularity`,
      {
        headers: {
          Authorization: `Bearer ${this.#accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.songs;
  }

  async searchGenius(query: string) {
    const response = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${this.#accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.hits;
  }

  // new version, takes artist name
  async getArtistInfoFromName(artistName: string) {
    if (!artistName) {
      console.log(error(422, "No artist name provided"));
      return null;
    }
    const response = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(artistName)}`,
      {
        headers: {
          Authorization: `Bearer ${this.#accessToken}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    for (const hit of data.response.hits) {
      if (
        hit.result.primary_artist.name
          .toLowerCase()
          .trim()
          .replace("\u200B", "") // remove zero-width space
          .replace(String.fromCharCode(160), " ") === // remove non-breaking space
        artistName.toLowerCase()
      ) {
        return hit.result.primary_artist;
      }
    }

    return null;
  }

  async getArtistInfoFromId(id: string) {
    const response = await fetch(
      `https://api.genius.com/artists/${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Bearer ${this.#accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.artist;
  }
}
