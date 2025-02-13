import { createNewGame } from '$lib/createNewGames';

import type { RequestEvent } from '@sveltejs/kit';

export async function get({ request }: RequestEvent) {
    try {
        await createNewGame("2026-01-01");
        return {
            status: 200,
            body: { message: 'New game created successfully' }
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            body: { error: 'Failed to create new game' }
        };
    }
}