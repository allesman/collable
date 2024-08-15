<!-- TODO:add eslint -->
<script lang="ts">
  import Icon from "@iconify/svelte";
  import type {
    // SearchResult,
    Song,
    Artist,
    Modal,
  } from "$lib/types.js";

  // get the data from the server
  export let data: {
    startArtist: Artist;
    goalArtist: Artist;
    isCustom: boolean;
  };
  const startArtist: Artist = data.startArtist;
  const goalArtist: Artist = data.goalArtist;
  const isCustom: boolean = data.isCustom;

  // modal shown when the user wins the game
  import YouWin from "$lib/components/YouWin.svelte";
  let youWinModal: Modal;

  // counting how many guesses the user has made
  let numGuesses: number = 0;
  // saving whether a search has been made
  let searchMade: boolean = false;

  // the different stages of the game
  // 0: select a song by the current artist
  // 1: select artist featured on the song to be new current artist -> back to 0 or 2
  // 2: win
  let gameStage: number = 0;

  // for gameStage 0
  let artistObj: Artist = startArtist; // the current artist, initialized with the start artist
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
      searchMade = true;
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
    numGuesses++;
    // Check for game win
    if (artistObj.id === goalArtist.id) {
      console.log("You win!");
      youWinModal.openModal();
      gameStage = 2;
    }
  }
</script>

<!-- <div class="mb-4">
    <div class="text-base">Start Artist:</div>
    <div class="font-bold text-primary">{startArtist.name}</div>
  </div>
  <div class="mb-4">
    <div class="text-base">Goal Artist:</div>
    <div class="font-bold text-primary">{goalArtist.name}</div>
  </div> -->
<div class="flex justify-center items-center">
  <div class="inline-block card bg-base-100">
    <div class="card-body">
      <div class="flex justify-center items-center">
        Use features to get from
      </div>
      <div
        class="flex justify-center items-center pt-2 text-2xl font-bold gap-3"
      >
        <!-- FIXME: Add images -->
        {startArtist.name}
        <Icon icon="mdi:arrow-right-thick" />
        {goalArtist.name}
      </div>
    </div>
  </div>
</div>

<div class="p-3">
  <!-- TODO: extract more into components? -->

  <!-- Name of current artist -->
  <!-- FIXME: add image -->
  <div class="text-center m-2 text-4xl text-primary">{artistObj.name}</div>

  <!-- Search Bar -->
  <form
    method="POST"
    action="?/search"
    on:submit|preventDefault={handleSearch}
    autocomplete="off"
    class="flex items-center justify-center gap-2 mt-3"
  >
    <input
      name="songQuery"
      type="text"
      placeholder="Enter Song :3"
      disabled={isLoading || gameStage != 0}
      class="input input-bordered select-none"
      required
    />
    <input type="hidden" name="artistId" bind:value={artistObj.id} />
    <input type="hidden" name="artistName" bind:value={artistObj.name} />
    <button
      type="submit"
      disabled={isLoading || gameStage != 0}
      class="btn btn-primary"
      class_alternative="btn btn-primary shadow-md shadow-primary/50"
      ><Icon icon="mdi:search" class="text-lg" />
      Search
    </button>
  </form>

  {#if gameStage === 0}
    <!-- Search Results (gameStage 0 only) -->
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
      {:else if searchMade}
        <p class="text-gray-400">
          No Results. <a
            href="https://forms.gle/8P8NAvcdbUMABW427"
            target="_blank"
            class="link">Is your song missing?</a
          >
        </p>
      {/if}
    </div>
  {:else if gameStage === 1}
    <!-- Artists of Song (gameStage 1 only) -->
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
  {:else if gameStage === 2}
    <nbsp />
  {:else}
    <!-- Error if gameStage has ValueError -->
    <p class="text-error text-center">Something went wrong</p>
  {/if}

  <!-- Error Message (if there is one) -->
  {#if error}
    <p class="text-error text-center">{error}</p>
  {/if}
</div>

<YouWin
  startArtistName={startArtist.name}
  goalArtistName={goalArtist.name}
  {numGuesses}
  {isCustom}
  bind:this={youWinModal}
/>
