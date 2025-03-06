import { getDefaultSongs } from '$lib/gameUtils';
import type { Song } from '$lib/types';
import { error, json } from '@sveltejs/kit';

// TODO: caching
export async function POST({ request }) {
    const { artistId, amount, featuringOnly } = await request.json();
    if (!artistId) {
        return error(400, "ArtistId required");
    }
    let newSongs: Song[] = [];
    if (amount) {
        // a specific amount of songs is requested
        newSongs = await getDefaultSongs(artistId, parseInt(amount as string), featuringOnly);
    }
    else {
        // default amount of songs is requested
        newSongs = await getDefaultSongs(artistId);
    }
    return json({ newSongs });
};