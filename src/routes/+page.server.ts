import type { Actions, PageServerLoad } from "./$types";
import GeniusApi from "$lib/GeniusApi.ts";
import { error } from "@sveltejs/kit";
import type { Artist, Song, StoredData } from "$lib/types";
import { fetchData } from "$lib/dbUtil";
import { gameActions } from "$lib/sharedActions/gameActions";
import { getDefaultSongs } from "$lib/gameUtils";
import { DateTime } from "luxon";

let startArtist: Artist;
let goalArtist: Artist;

export const load = (async () => {
  // Access Genius API
  const geniusApi = await GeniusApi.initialize();
  // Access database
  const data: StoredData = await fetchData();
  // Since start and goal artist are not custom set, set them to default values of the day from the database
  let dateDependentData: { [key: string]: any } = {};
  for (const date of Object.keys(data)) {
    try {
      const startArtistInfo = await geniusApi.getArtistInfoFromName(data[date].startArtist);
      const goalArtistInfo = await geniusApi.getArtistInfoFromName(data[date].goalArtist);
      const defaultSongs = await getDefaultSongs(startArtistInfo.id);

      dateDependentData[date] = {
        startArtist: startArtistInfo,
        goalArtist: goalArtistInfo,
        defaultSongs: defaultSongs,
        date: DateTime.fromISO(date).toFormat("M/d/yyyy"),
      };
    } catch (e) {
      console.error(`Problem with reading Stored Data aka ${JSON.stringify(data)}, could be because data after doesnt exist yet: ` + e);
    }
  }

  // console.log(DateTime.now());
  return {
    dateDependentData: dateDependentData,
    isCustom: false,
  };
}) satisfies PageServerLoad;

// Provide the imported actions to the page
export const actions: Actions = gameActions;
