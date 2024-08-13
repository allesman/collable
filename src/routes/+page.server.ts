import type { Actions, PageServerLoad } from "./$types";
import GeniusApi from "$lib/GeniusApi.js";
import { error } from "@sveltejs/kit";

export const load = (async () => {
  const geniusApi = await GeniusApi.initialize();

  // TODO: dont hardcode this and make it do something
  const startingArtist = "Ufo361";
  const goalArtist = "Quadeca";

  const artistObj = await geniusApi.getArtistInfo(startingArtist);
  if (!artistObj) {
    return error(500, "Artist not found");
  }
  return {
    artistJSON: JSON.stringify(artistObj),
  };
}) satisfies PageServerLoad;

// TODO: caching? (especially for splitting artists)
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
    // TODO: use other api call in general (song), to 1) stop user from using tactical search, but this will need own search
    try {
      const data = await geniusApi.searchGenius(finalQuery);
      let searchResults = [];
      for (let i = 0; i < data.length; i++) {
        // for debugging
        let primaryOld = data[i].result.primary_artists;
        console.assert(primaryOld.length == 1, "Primary artist length not 1");

        let primary = [data[i].result.primary_artist];
        let primaryName: string = primary[0].name;
        // Check if song has combined artist (e.g. "Lana Del Rey & Quavo")
        // TODO: ensure it's not just an artist with "&" in their name (e.g. "Simon & Garfunkel")
        if (primaryName.includes(" & ") && !artistName.includes(" & ")) {
          // Clear old primary artist
          primary = [];
          // Split into seperate artists by "&"
          let splitArtists: string[] = splitArtist(primaryName, " & ");
          for (let a of splitArtists) {
            console.log("Split artist:" + a);
            // Add full artist object to primary artists
            const artistObj = await geniusApi.getArtistInfo(a);
            if (!artistObj) {
              console.error("Artist not found: " + a);
              continue;
            }
            primary.push(artistObj);
          }
        }

        let features = data[i].result.featured_artists;
        let combinedArtists = primary.concat(features);
        // searchResults.push(data[i]); // Debug line, uncomment to see all results
        for (let element of combinedArtists) {
          if (element.id == artistId) {
            let song = data[i].result;
            song["combined_artists"] = combinedArtists;
            searchResults.push(song);
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

function splitArtist(artist: string, seperator: string): string[] {
  let splitArtists: string[] = artist.split(seperator);
  if (splitArtists[0].includes(", ")) {
    let stillToBeSplit = splitArtists.shift();
    if (stillToBeSplit) {
      splitArtists.unshift(...stillToBeSplit.split(", "));
    }
  }
  return splitArtists;
}
