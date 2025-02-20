import { DateTime } from 'luxon';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

let relevantData;
export const load: PageLoad = (async ({ parent, data }) => {
    await parent();
    const { dateDependentData, isCustom } = data;
    if (dateDependentData.length === 1) {
        // (just 1 entry becuase no timezone troubles because old game) -> searching for today's data would be wrong
        relevantData = dateDependentData[dateDependentData.keys()[0]];
    } else {
        // needs to be done client-side to have the correct timezone
        relevantData = dateDependentData[DateTime.now().toFormat("yyyy-MM-dd")];
        if (!relevantData || !relevantData.goalArtist || !relevantData.startArtist) {
            return error(500, `No/incomplete data for today (${DateTime.now().toFormat("M/d/yyyy")}) provided by the server`);
        }
    }
    return {
        startArtist: relevantData.startArtist,
        goalArtist: relevantData.goalArtist,
        isCustom: isCustom,
        // defaultSongs: relevantData.defaultSongs,
        dateStamp: relevantData.date,
    };
}) satisfies PageLoad;