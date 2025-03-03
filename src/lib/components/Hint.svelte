<script lang="ts">
    import type { Artist, Song } from "$lib/types";

    let dialog: HTMLDialogElement;
    export let artistObj: Artist;
    let defaultSongs: Song[] = new Array(); // the most popular songs of the current artist, not filtered with a search query
    const showMoreAmount: number = 10; // the amount of songs to load when clicking "show more"
    let isLoading: boolean = false; // for loading songs from search query
    let isLoadingMore: boolean = false; // for loading more songs
    let noMore: boolean = false; // for when there are no more songs to load
    export function openModal() {
        dialog.showModal();
        if (defaultSongs.length === 0) {
            handleShowMore();
        }
    }
    async function handleShowMore() {
        isLoadingMore = true;
        const response = await fetch("api/getDefaultSongs", {
            method: "POST",
            body: JSON.stringify({
                artistId: artistObj.id,
                amount: defaultSongs.length + showMoreAmount,
            }),
        });
        if (response.ok) {
            let { newSongs } = await response.json();
            defaultSongs = [...defaultSongs, ...newSongs];
            console.assert(newSongs.length > 0, "No default songs returned");
            // less songs than requested, so no more to load after this (1 unit of grace because sometimes the genius API is weird and returns less than requested)
            noMore = newSongs.length < showMoreAmount - 1;
            // console.log(noMore ? defaultSongs.length : "");
        } else {
            noMore = true;
        }
        isLoadingMore = false;
        setTimeout(() => {
            dialog.scrollTo({
                top: dialog.scrollHeight,
                behavior: "smooth",
            });
        }, 100); // delay by 1 milliseconds
    }

    let submitting = false;
</script>

<dialog
    class="modal invisible"
    id="my_modal_1"
    bind:this={dialog}
    tabindex="-1"
>
    <div class="modal-box rounded-2xl">
        <!-- <div class="bg-base-100 sticky top-0 z-50"> -->
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-0"
                disabled={submitting}
                on:click={() => dialog.close()}>✕</button
            >
        </form>
        <h3 class="text-2xl font-bold">Hint</h3>
        These are the top songs of<span class="text-primary font-bold">
            &nbsp;{artistObj?.name}</span
        >:
        <!-- </div> -->
        <div class="flex items-center justify-center mt-10">
            {#if isLoading}
                <!-- still loading -->
                <p class="mt-1">
                    <span class="loading loading-spinner"></span> Loading...
                </p>
            {:else if defaultSongs}
                <!-- display default songs -->
                <ul class="flex flex-col items-center justify-center">
                    {#each defaultSongs as hit, i}
                        <li class="w-full text-center m-1">
                            <button
                                data-index={i}
                                class="btn btn-base-content rounded-full btn-outline no-animation h-auto py-1"
                            >
                                <img
                                    class="w-8 rounded mr-1"
                                    src={hit.song_art_image_thumbnail_url}
                                    alt={hit.title}
                                    width="8"
                                    height="8"
                                />
                                <span>{hit.title}</span>
                                <span
                                    class="badge badge-primary rounded-md h-auto"
                                    >{hit.artist_names}</span
                                >
                            </button>
                        </li>
                    {/each}
                    <li class="w-full text-center m-1 mt-4">
                        <!-- Show more button, inside here because it's only needed when there's songs being listed -->
                        <button
                            class="btn btn-ghost"
                            disabled={noMore}
                            on:click={handleShowMore}
                        >
                            {#if isLoadingMore}
                                <span class="loading loading-spinner"></span> Loading...
                            {:else}
                                Show More
                            {/if}
                        </button>
                    </li>
                </ul>
            {/if}
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button disabled={submitting}></button>
    </form>
</dialog>
