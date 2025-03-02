import GeniusApi from '$lib/GeniusApi';
import { json } from '@sveltejs/kit';
import dotenv from 'dotenv';

dotenv.config();

export async function POST({ request }) {
    const { songId } = await request.json();
    const geniusApi = await GeniusApi.initialize();
    const songInfo = await geniusApi.getSongInfoFromId(songId);
    return json({ apple_music_id: songInfo.apple_music_id });

}