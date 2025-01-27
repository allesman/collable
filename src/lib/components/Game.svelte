<script lang="ts">
  import Icon from "@iconify/svelte";
  import type {
    // SearchResult,
    Song,
    Artist,
    Modal,
  } from "$lib/types.js";

  // get the data from parent component
  export let data: {
    startArtist: Artist;
    goalArtist: Artist;
    isCustom: boolean;
    defaultSongs: Song[];
  };
  const startArtist: Artist = data.startArtist;
  const goalArtist: Artist = data.goalArtist;
  const isCustom: boolean = data.isCustom;
  let defaultSongs: Song[] = data.defaultSongs; // the most popular songs of the current artist, not filtered with a search query

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
  let searchResults: Song[] = []; // the songs found by the search query
  let error: string | null = null;
  let isLoading: boolean = false; // for loading songs from search query
  let isLoadingMore: boolean = false; // for loading more songs

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
      error = "Something went wrong while handling search";
    }
    form.reset();
    isLoading = false;
  }

  // for gameStage 1
  let song: Song; // the song selected by the user

  async function handleClickSong(index: number) {
    gameStage = 1;
    // searchMade = false;
    song = searchResults[index] ?? defaultSongs[index];
  }

  async function handleCloseSong() {
    gameStage = 0;
  }

  async function handleClickArtist(event: SubmitEvent) {
    event.preventDefault();
    isLoading = true;
    const form: HTMLFormElement = event.target as HTMLFormElement;
    const formData: FormData = new FormData(form);
    if (!formData.get("artistId") || event.currentTarget == null) {
      // if query is empty or form is null, don't send request
      isLoading = false;
      return;
    }
    const artistIndex: number = parseInt(
      formData.get("artistIndex") as string,
      10,
    );
    gameStage = 0;
    searchResults = [];
    // artistObj = song.combined_artists[index];
    artistObj = song.combined_artists[artistIndex];
    numGuesses++;
    searchMade = false;
    // Check for game win
    if (artistObj.id === goalArtist.id) {
      // console.log("You win!");
      isLoading = false;
      youWinModal.openModal();
      gameStage = 2;
    } else {
      // Since no game win, get new default songs for artist
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        defaultSongs = JSON.parse(JSON.parse(result.data)[0]);
        console.assert(defaultSongs.length > 0, "No default songs returned");
      } else {
        error = "Something went wrong while loading data for new artist";
      }
      console.log(song.combined_artists);
      isLoading = false;
    }
  }

  async function handleShowMore(event: SubmitEvent) {
    event.preventDefault();
    isLoadingMore = true;
    const form: HTMLFormElement = event.target as HTMLFormElement;
    const formData: FormData = new FormData(form);
    if (!formData.get("artistsAmount") || event.currentTarget == null) {
      // if query is empty or form is null, don't send request
      isLoadingMore = false;
      return;
    }
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const result = await response.json();
      defaultSongs = JSON.parse(JSON.parse(result.data)[0]);
      console.assert(defaultSongs.length > 0, "No default songs returned");
      console.assert(
        defaultSongs.length ===
          parseInt(formData.get("artistsAmount") as string, 10),
        `got ${defaultSongs.length} songs but should've gotten ${parseInt(formData.get("artistsAmount") as string, 10)}`,
      );
    } else {
      error = "Unable to load more songs";
    }
    isLoadingMore = false;
  }
</script>

<div class="flex justify-center items-center">
  <div class="inline-block card bg-base-100">
    <div class="card-body">
      <div class="flex justify-center items-center">
        Use features to get from
      </div>
      <div
        class="flex justify-center items-center pt-2 text-2xl font-bold gap-3"
      >
        <img
          class="w-10 rounded-full"
          src={startArtist.image_url}
          alt={startArtist.name}
        />
        {startArtist.name}
        <Icon icon="mdi:arrow-right-thick" />
        <img
          class="w-10 rounded-full"
          src={goalArtist.image_url}
          alt={goalArtist.name}
        />
        {goalArtist.name}
      </div>
    </div>
  </div>
</div>

<div class="p-3">
  <!-- TODO: extract more into components? -->

  <!-- Name of current artist -->
  <div class="m-2 text-4xl text-primary flex justify-center items-center">
    <img
      class="w-12 rounded-full m-2 mr-5"
      src={artistObj.image_url}
      alt={artistObj.name}
    />{artistObj.name}
  </div>

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
      placeholder="Find Song..."
      disabled={isLoading || gameStage != 0}
      class="input input-bordered select-none"
      required
    />
    <input type="hidden" name="artistId" bind:value={artistObj.id} />
    <input type="hidden" name="artistName" bind:value={artistObj.name} />
    <button
      type="submit"
      disabled={isLoading || gameStage != 0}
      class="btn btn-primary x_shadow-md x_shadow-primary/50 text-base"
      ><Icon icon="mdi:search" class="text-lg" />
      Search
    </button>
  </form>

  {#if gameStage === 0}
    <!-- Songs (gameStage 0 only) -->
    <div class="flex items-center justify-center mt-10">
      {#if isLoading}
        <!-- still loading -->
        <p class="mt-1">Loading...</p>
      {:else if (searchMade && searchResults.length > 0) || !searchMade}
        <!-- search made and had results, display them / no search made yet, display default songs -->
        <ul class="flex flex-col items-center justify-center">
          {#each searchMade ? searchResults : defaultSongs as hit, i}
            <li class="w-full text-center m-1">
              <button
                on:click={() => handleClickSong(i)}
                data-index={i}
                class="btn btn-secondary btn-outline"
              >
                <img
                  class="w-8 rounded mr-1"
                  src={hit.song_art_image_thumbnail_url}
                  alt={hit.title}
                />
                {hit.title}
                <!-- combined artists: {hit.combined_artists} <br /> -->
                <span class="badge badge-secondary">{hit.artist_names}</span>
              </button>
            </li>
          {/each}
          <li class="w-full text-center m-1 mt-4">
            <!-- Show more button, inside here because it's only needed when there's songs being listed -->
            <!-- FIXME: fake ass form, again -->
            <form action="?/getSongs" on:submit|preventDefault={handleShowMore}>
              <input
                type="hidden"
                name="artistsAmount"
                value={defaultSongs.length + 10}
              />
              <input type="hidden" name="artistId" value={artistObj.id} />
              <button class="btn btn-ghost" disabled={searchMade} type="submit">
                <!-- TODO: could also put || isLoadingMore up there in disabled but idk tbh -->
                {isLoadingMore ? "Loading..." : "Show More"}
              </button>
            </form>
          </li>
        </ul>
      {:else if searchMade}
        <!-- no search results even though a search was made-->
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
    <div class="flex flex-col items-center justify-center mt-10">
      <button class="btn btn-secondary" on:click={handleCloseSong}>
        {#if song}
          <img
            class="w-8 rounded mr-1"
            src={song.song_art_image_thumbnail_url}
            alt={song.title}
          />
          {song.title}
        {/if}
        <span class="ml-1">✕</span>
      </button>
      <!-- lowkey fake form to pass artistid to backend when clicked -->
      <!-- FIXME: just use custom api instead of fake form?  -->
      <ul class="flex flex-col items-center justify-center mt-5">
        {#each song.combined_artists as artist, i}
          {#if artist.id !== artistObj.id}
            <li class="w-full text-center m-1">
              <form
                method="POST"
                action="?/getSongs"
                on:submit|preventDefault={handleClickArtist}
              >
                <input type="hidden" name="artistIndex" value={i} />
                <input type="hidden" name="artistId" value={artist.id} />
                <button type="submit" class="btn btn-secondary btn-outline"
                  >{artist.name}</button
                >
              </form>
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  {:else if gameStage === 2}
    <nbsp />
  {:else}
    <!-- Error if gameStage has ValueError -->
    <p class="text-error text-center">
      Something went wrong. Debug information: gameStage={gameStage}
    </p>
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
