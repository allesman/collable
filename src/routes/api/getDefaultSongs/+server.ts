import { getDefaultSongs } from '$lib/gameUtils';
import type { Song } from '$lib/types';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export async function POST({ request }) {
    const { artistId, amount } = await request.json();
    if (!artistId) {
        return error(400, "ArtistId required");
    }
    let defaultSongs: Song[] = [];
    if (amount) {
        // TODO: especially, for bigger amounts, re-fetching all songs to get more songs is inefficient
        // a specific amount of songs is requested
        defaultSongs = await getDefaultSongs(artistId, parseInt(amount as string));
    }
    else {
        // default amount of songs is requested
        defaultSongs = await getDefaultSongs(artistId);
    }
    return json({ defaultSongs });
};