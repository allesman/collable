import { createNewGame, createNewGamesUntil } from '$lib/createNewGames';
import { json } from '@sveltejs/kit';
import dotenv from 'dotenv';

dotenv.config();

export async function GET({ url, request, fetch }) {

    const apiKey = request.headers.get('api-key');
    const validApiKey = process.env.MUSICALLE_API_KEY;
    if (!validApiKey) {
        return new Response(JSON.stringify({ error: 'haha fuck server doesn\'t have api key' }), { status: 500 });
    }
    if (apiKey !== validApiKey) {
        return new Response(JSON.stringify({ error: 'literally me when I don\'t provide the correct api key (Unauthorized)' }), { status: 401 });
    }

    const date = url.searchParams.get("d") || undefined;
    const startArtist = url.searchParams.get("s") || undefined;
    const goalArtist = url.searchParams.get("g") || undefined;
    const batch = url.searchParams.has("batch");
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    console.log("Creating new game");

    try {
        if (batch && date && dateRegex.test(date)) {
            const games = await createNewGamesUntil(date);
            // make fetch request to ensure that the code is executed
            await fetch('/', { method: 'GET' });
            return new Response(JSON.stringify({ message: `Success! Created ${games.length} games until ${date}!`, gamesCreated: games }), { status: 200 });
        }
        else if (!date && batch) {
            return new Response(JSON.stringify({ error: 'Date is required for batch mode' }), { status: 400 });
        }
        else if (!date || dateRegex.test(date)) {
            // create new game
            const game = await createNewGame(date, startArtist, goalArtist);
            // make fetch request to ensure that the code is executed
            await fetch('/', { method: 'GET' });
            // return response
            return json({ message: `Success! Created ${game.date}!`, gameCreated: game }, { status: 200 });
        }
        else {
            return new Response(JSON.stringify({ error: 'Invalid date format' }), { status: 400 });
        }
    } catch (error) {
        console.error("Error creating new game");
        if (error instanceof Error) {
            console.error(error.message);
            return new Response(JSON.stringify({ error: 'Failed to create new game', details: error.message }), { status: 500 });
            // return new Response(json({ error: 'Failed to create new game', details: error.message }, { status: 500 }));
        }
    }
}