import type { Actions, PageServerLoad } from "./$types";
import GeniusApi from "$lib/GeniusApi.js";
import { error } from "@sveltejs/kit";

export const load = (async () => {}) satisfies PageServerLoad;

// TODO: caching?
export const actions = {
  default: async ({ request }) => {
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
      // console.log(data);
      for (let i = 0; i < data.length; i++) {
        let hasArtist = false;
        let primary = data[i].result.primary_artists;
        let features = data[i].result.featured_artists;
        // searchResults.push(data[i]); // Debug line, uncomment to see all results
        // TODO: simplify by combining primary and featured artists?
        for (let element of primary) {
          // if (element.name==artist)
          if (element.id == artistId) {
            console.log("found artist in primary");
            hasArtist = true;
            searchResults.push(data[i]);
            break;
          }
        }
        if (hasArtist) {
          continue;
        }
        for (let element of features) {
          // if(element.name==artist)
          if (element.id == artistId) {
            console.log("found artist in featured");
            searchResults.push(data[i]);
            break;
          }
        }
      }
      console.log(searchResults.length + " songs featured artist");
      // return {
      //   status: 200,
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: searchResults,
      // };
      return JSON.stringify(searchResults);
      // return "hiii";
    } catch (e) {
      console.error(e);
      return error(500, "Whut?");
    }
  },
} satisfies Actions;
