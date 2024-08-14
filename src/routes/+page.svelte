<!-- TODO:add eslint -->
<script lang="ts">
  import type {
    // SearchResult,
    Song,
    Artist,
  } from "$lib/types.js";

  // get the data from the server
  export let data: { artistJSON: string };

  // the different stages of the game
  // 0: select a song by the current artist
  // 1: select artist featured on the song to be new current artist -> back to 0
  let gameStage: number = 0;

  // for gameStage 0
  let artistObj: Artist = JSON.parse(data.artistJSON); // the current artist, initialized with the artist from the server
  let searchResults: Song[] = [];
  let error: string | null = null;
  let isLoading: boolean = false;

  async function handleSearch(event: SubmitEvent) {
    event.preventDefault();
    isLoading = true;
    const form: HTMLFormElement = event.target as HTMLFormElement;
    const formData: FormData = new FormData(form);
    if (!formData.get("songQuery") || event.currentTarget == null) {
      // if query is empty or form is null, don't send request
      isLoading = false;
      return;
    }
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const result = await response.json();
      searchResults = JSON.parse(JSON.parse(result.data)[0]);
      // console.log(searchResults);
    } else {
      error = "Something went wrong";
    }
    form.reset();
    isLoading = false;
  }

  // for gameStage 1
  let song: Song; // the song selected by the user

  async function handleClickSong(index: number) {
    gameStage = 1;
    song = searchResults[index];
  }

  async function handleClickArtist(index: number) {
    gameStage = 0;
    searchResults = [];
    artistObj = song.combined_artists[index];
  }
</script>

<!-- TODO: extract more into components? -->

<!-- Name of current artist -->
<!-- FIXME: add image -->
<div class="text-center m-2 text-4xl text-primary">{artistObj.name}</div>

<!-- Search Bar -->
<div class="flex items-center justify-center">
  <form
    method="POST"
    on:submit|preventDefault={handleSearch}
    action="?/search"
    autocomplete="off"
    class="w-full max-w-xs"
  >
    <input
      name="songQuery"
      type="text"
      placeholder="Enter Song :3"
      disabled={isLoading || gameStage != 0}
      class="input input-bordered select-none"
    />
    <input type="hidden" name="artistId" bind:value={artistObj.id} />
    <input type="hidden" name="artistName" bind:value={artistObj.name} />
    <button
      type="submit"
      disabled={isLoading || gameStage != 0}
      class="btn mt-2 btn-primary">Search</button
    >
  </form>
</div>

<!-- Search Results (gameStage 0 only) -->
{#if gameStage === 0}
  <div class="flex items-center justify-center mt-10">
    {#if isLoading}
      <p class="mt-1">Loading...</p>
    {:else if searchResults.length > 0}
      <ul class="flex flex-col items-center justify-center">
        {#each searchResults as hit, i}
          <li class="w-full text-center m-1">
            <button
              on:click={() => handleClickSong(i)}
              data-index={i}
              class="btn btn-secondary btn-outline"
            >
              <!-- FIXME: add image -->
              {hit.title}
              <span class="badge badge-secondary">{hit.artist_names}</span>
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <!-- TODO: readd and also link to page which enables submission of missing songs -->
      <!-- <p class="text-gray-400">No Results</p>  -->
    {/if}
  </div>

  <!-- Artists of Song (gameStage 1 only) -->
{:else if gameStage === 1}
  <!-- FIXME: close out of this view? and then hide current artist -->
  <div class="flex flex-col items-center justify-center mt-10">
    <button class="btn btn-secondary no-animation">
      {#if song}
        {song.title}
      {/if}
    </button>
    <ul class="flex flex-col items-center justify-center mt-5">
      {#each song.combined_artists as artist, i}
        <li class="w-full text-center m-1">
          <button
            on:click={() => handleClickArtist(i)}
            data-index={i}
            class="btn btn-secondary btn-outline">{artist.name}</button
          >
        </li>
      {/each}
    </ul>
  </div>
  <!-- Error if gameStage has ValueError -->
{:else}
  <p class="text-error text-center">Something went wrong</p>
{/if}

<!-- Error Message (if there is one) -->
{#if error}
  <p class="text-error text-center">{error}</p>
{/if}
