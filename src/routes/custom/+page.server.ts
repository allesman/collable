import GeniusApi from "$lib/GeniusApi";
import { error, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { gameActions } from "$lib/sharedActions/gameActions";

export const load = (async ({ url }) => {
  // Access Genius API
  const geniusApi = await GeniusApi.initialize();

  // Get custom artist IDs from URL
  const startArtistId = url.searchParams.get("s");
  const goalArtistId = url.searchParams.get("g");

  // Check if artist IDs are provided
  if (!startArtistId || !goalArtistId) {
    return error(400, "Missing artist IDs");
  }

  // get full artist info
  const startArtist = await geniusApi.getArtistInfoFromId(startArtistId);
  const goalArtist = await geniusApi.getArtistInfoFromId(goalArtistId);
  return {
    startArtist: startArtist,
    goalArtist: goalArtist,
    isCustom: true,
  };
}) satisfies PageServerLoad;

// Provide the imported actions to the page
export const actions: Actions = gameActions;
