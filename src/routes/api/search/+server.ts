// import { searchGenius, getArtistInfo } from "$lib/geniusApi";
import GeniusApi from "$lib/GeniusApi.js";
import { error } from "@sveltejs/kit";

// TODO: caching?
export async function GET({ url }) {
  const geniusApi = await GeniusApi.initialize();
  console.assert(geniusApi, "GeniusApi not initialized");
  const query = url.searchParams.get("query");
  const artistId = url.searchParams.get("artistId");
  if (!artistId || !query) {
    return error(400, "Query and ArtistId required");
  }
  try {
    // TODO: avoid this extra call to get artist name by passing it in from the client
    const artist = await geniusApi.getArtistInfo(artistId);
    const finalQuery = query + " " + artist.response.artist.name;
    console.log("Searching: " + finalQuery);
    const data = await geniusApi.searchGenius(finalQuery);
    // const data = await geniusApi.searchGenius(query);
    return new Response(JSON.stringify(data.response.hits), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return error(500, "Whut?");
  }
}
