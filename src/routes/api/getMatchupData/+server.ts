import { fetchData } from '$lib/dbUtil.js';
import GeniusApi from '$lib/GeniusApi.js';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { DailyGame } from '$lib/types.js';

export async function POST({ request }) {
    const { date } = await request.json();
    // Access Genius API
    const geniusApi = await GeniusApi.initialize();
    // Access database
    console.log(`Fetching data for ${date}`);
    const game: DailyGame = await fetchData(date);

    try {
        const startArtist = await geniusApi.getArtistInfoFromName(game.startArtist);
        const goalArtist = await geniusApi.getArtistInfoFromName(game.goalArtist);
        const dateStamp = game.date;
        return json({ startArtist, goalArtist, dateStamp });
    } catch (e) {
        console.error(`Problem with reading Stored Data aka ${JSON.stringify(game)}`);
    }
    return json({ message: "hi" });
}