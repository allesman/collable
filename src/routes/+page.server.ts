import type { Actions, PageServerLoad } from "./$types";
import GeniusApi from "$lib/GeniusApi.ts";
import { error } from "@sveltejs/kit";
import type { Artist } from "$lib/types";
import { fetchData } from "$lib/readDB";
import { gameActions } from "$lib/sharedActions/gameActions";

let startArtist: Artist;
let goalArtist: Artist;

export const load = (async () => {
  // Access Genius API
  const geniusApi = await GeniusApi.initialize();
  // Access database
  const data = await fetchData();

  // Since start and goal artist are not custom set, set them to default values of the day from the database
  const startArtistName: string = data.startArtist;
  const goalArtistName: string = data.goalArtist;

  startArtist = await geniusApi.getArtistInfoFromName(startArtistName);
  if (!startArtist) {
    return error(500, `Artist "${startArtistName}" not found`);
  }
  goalArtist = await geniusApi.getArtistInfoFromName(goalArtistName);
  if (!goalArtist) {
    return error(500, `Artist "${goalArtistName}" not found`);
  }
  return {
    startArtist: startArtist,
    goalArtist: goalArtist,
    isCustom: false,
  };
}) satisfies PageServerLoad;

// Provide the imported actions to the page
export const actions: Actions = gameActions;
