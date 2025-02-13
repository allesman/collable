import { createNewGame, createNewGamesUntil } from '$lib/createNewGames';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
    const date = url.searchParams.get("d");
    const startArtist = url.searchParams.get("s");
    const goalArtist = url.searchParams.get("g");
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