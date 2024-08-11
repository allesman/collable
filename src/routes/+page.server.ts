import type { Actions, PageServerLoad } from "./$types";
import GeniusApi from "$lib/GeniusApi.js";
import { error } from "@sveltejs/kit";

export const load = (async () => {
  const geniusApi = await GeniusApi.initialize();
  const data = await geniusApi.getArtistInfo("15740");
  const artistObj = data.response.artist;
  return {
    artistJSON: JSON.stringify(artistObj),
  };
}) satisfies PageServerLoad;

// TODO: caching?
export const actions = {
  search: async ({ request }) => {
    const data = await request.formData();
    // Do something with the data
    const geniusApi = await GeniusApi.initialize();
    console.assert(geniusApi, "GeniusApi not initialized");
    const query = data.get("songQuery");
    const artistId = data.get("artistId");
    if (
      !artistId ||
      !query ||
      typeof query !== "string" ||
      typeof artistId !== "string"
    ) {
      return error(400, "Query and ArtistId required");
    }
    // TODO: avoid this extra call to get artist name by passing it in from the client
    const artist = await geniusApi.getArtistInfo(artistId);
    const finalQuery = query + " " + artist.response.artist.name;
    console.log("Searching: " + finalQuery);
    const apiData = await geniusApi.searchGenius(finalQuery);
    try {
      const data = apiData.response.hits;
      let searchResults = [];
      for (let i = 0; i < data.length; i++) {
        let primary = data[i].result.primary_artists;
        let features = data[i].result.featured_artists;
        let combinedArtists = primary.concat(features);
        // searchResults.push(data[i]); // Debug line, uncomment to see all results
        for (let element of combinedArtists) {
          if (element.id == artistId) {
            searchResults.push(data[i]);
            break;
          }
        }
      }
      console.log(searchResults.length + " songs featured artist");
      // TODO: filter out results that aren't songs
      return JSON.stringify(searchResults);
    } catch (e) {
      console.error(e);
      return error(500, "Whut?");
    }
  },
} satisfies Actions;
