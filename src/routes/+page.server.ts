import type { Actions, PageServerLoad } from "./$types";
import { gameActions } from "$lib/sharedActions/gameActions";
export const load: PageServerLoad = (async () => {
  return {
    isCustom: false,
  };
}) satisfies PageServerLoad;
// Provide the imported actions to the page
export const actions: Actions = gameActions;
