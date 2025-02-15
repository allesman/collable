import { createNewGame, createNewGamesUntil } from '$lib/createNewGames';
import { json } from '@sveltejs/kit';
import dotenv from 'dotenv';

dotenv.config();

export async function GET({ url, request }) {

    const apiKey = request.headers.get('api-key');
    const validApiKey = process.env.MUSICALLE_API_KEY;
    if (!validApiKey) {
        return json({ error: 'haha fuck server doesn\'t have api key' }, { status: 500 });
    }
    if (apiKey !== validApiKey) {
        return json({ error: 'literally me when I don\'t provide the correct api key (Unauthorized)' }, { status: 401 });
    }

    const date = url.searchParams.get("d") || undefined;
    const startArtist = url.searchParams.get("s") || undefined;
    const goalArtist = url.searchParams.get("g") || undefined;
    const batch: boolean = url.searchParams.get("batch") === "true";
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    try {
        if (batch && date && dateRegex.test(date)) {
            let games = await createNewGamesUntil(date);
            return json({ message: `Success! Created games until ${date}!`, gamesCreated: games }, { status: 200 });
        }
        else if (!date && batch) {
            return json({ error: 'Date is required for batch mode' }, { status: 400 });
        }
        else if (!date || dateRegex.test(date)) {
            let game = await createNewGame(date, startArtist, goalArtist);
            return json({ message: `Success! Created ${date || "today's"}!`, gameCreated: game }, { status: 200 });
        }
        else {
            return json({ error: 'Invalid date format' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error creating new game:', error);
        if (error instanceof Error) {
            return json({ error: 'Failed to create new game', details: error.message }, { status: 500 });
        }
    }
}