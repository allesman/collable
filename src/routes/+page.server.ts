import type { Actions, PageServerLoad } from "./$types";
import GeniusApi from "$lib/GeniusApi.js";
import { error } from "@sveltejs/kit";

export const load = (async () => {
  const geniusApi = await GeniusApi.initialize();

  // TODO: dont hardcode this and make it do something
  const startingArtist = "Quadeca";
  const goalArtist = "Quadeca";

  const artistObj = await geniusApi.getArtistInfo(startingArtist);
  if (!artistObj) {
    return error(500, "Artist not found");
  }
  // const artistObj = data.response.artist;
  return {
    artistJSON: JSON.stringify(artistObj),
  };
}) satisfies PageServerLoad;

// TODO: caching?
export const actions = {
  search: async ({ request }) => {
    const data = await request.formData();
    const geniusApi = await GeniusApi.initialize();
    console.assert(geniusApi, "GeniusApi not initialized");
    const query = data.get("songQuery");
    const artistId = data.get("artistId");
    const artistName = data.get("artistName");
    if (
      !artistId ||
      !artistName ||
      !query ||
      typeof query !== "string" ||
      typeof artistId !== "string" ||
      typeof artistName !== "string"
    ) {
      return error(400, "Query and ArtistId required");
    }
    const finalQuery = query + " " + artistName;
    console.log("Searching: " + finalQuery);
    // TODO: use other api call in general (song), to 1) stop user from using tactical search, 2) also get collab ("&") songs, but this will need own search
    try {
      const data = await geniusApi.searchGenius(finalQuery);
      let searchResults = [];
      for (let i = 0; i < data.length; i++) {
        // TODO: split artist if contains "&" and check each
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
