import { searchGenius, getArtistInfo } from "$lib/geniusApi";
import { error } from "@sveltejs/kit";

// TODO: caching?
export async function GET({ url }) {
  const query = url.searchParams.get("query");
  const artistId = url.searchParams.get("artist");
  if (!artistId || !query) {
    return error(400, "Query and ArtistId required");
  }
  try {
    const artist = await getArtistInfo(artistId);
    const data = await searchGenius(query + " " + artist);
    return new Response(JSON.stringify(data.response.hits), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return error(500, "Whut?");
  }
}
