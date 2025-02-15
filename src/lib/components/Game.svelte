<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { PageData } from "../../routes/$types";
  import type {
    // SearchResult,
    Song,
    Artist,
    Modal,
  } from "$lib/types.js";

  // get the data from parent component
  export let data: PageData;
  const startArtist: Artist = data.startArtist;
  const goalArtist: Artist = data.goalArtist;
  const isCustom: boolean = data.isCustom;
  let defaultSongs: Song[] = data.defaultSongs; // the most popular songs of the current artist, not filtered with a search query
  const dateStamp: string = data.dateStamp;

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
  let query: string = ""; // the search query
  let error: string | null = null;
  let isLoading: boolean = false; // for loading songs from search query
  let isLoadingMore: boolean = false; // for loading more songs
  let noMore: boolean = false; // for when there are no more songs to load

  async function handleSearch(event: SubmitEvent) {
    event.preventDefault();
    isLoading = true;
    error = null;
    query = "";
    // noMore = false;
    const form: HTMLFormElement = event.target as HTMLFormElement;
    const formData: FormData = new FormData(form);
    if (!formData.get("songQuery") || event.currentTarget == null) {
      // if query is empty or form is null, reset to default songs
      handleClickArtist(event);
      return;
    }
    const response = await fetch("?/search", {
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
    error = null;
    // searchMade = false;
    song = searchResults[index] ?? defaultSongs[index];
  }

  async function handleCloseSong() {
    gameStage = 0;
  }

  async function handleClickArtist(event: SubmitEvent) {
    event.preventDefault();
    isLoading = true;
    noMore = false;
    const form: HTMLFormElement = event.target as HTMLFormElement;
    const formData: FormData = new FormData(form);
    // if (!formData.get("artistId") || event.currentTarget == null) {
    //   // if query is empty or form is null, don't send request
    //   isLoading = false;
    //   return;
    // }
    if (formData.get("artistIndex")) {
      // If this method was actually called from clicking an artist, set them as the new artist (otherwise, keep the current artist)
      const artistIndex = parseInt(formData.get("artistIndex") as string, 10);
      artistObj = song.combined_artists[artistIndex];
      // also only then increment the number of guesses
      numGuesses++;
    }
    gameStage = 0;
    searchResults = [];
    // artistObj = song.combined_artists[index];
    searchMade = false;
    // Check for game win
    if (artistObj.id === goalArtist.id) {
      // console.log("You win!");
      isLoading = false;
      youWinModal.openModal();
      gameStage = 2;
    } else {
      // Since no game win, get new default songs for artist
      console.log("getting new default songs");
      const response = await fetch("?/getSongs", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        defaultSongs = JSON.parse(JSON.parse(result.data)[0]);
        console.assert(defaultSongs.length > 0, "No default songs returned");
        if (defaultSongs.length % 10 !== 0) {
          noMore = true;
        }
      } else {
        error = "Something went wrong while loading data for new artist";
      }
      isLoading = false;
    }
  }

  async function handleShowMore(event: SubmitEvent) {
    event.preventDefault();
    isLoadingMore = true;
    // noMore = false;
    const form: HTMLFormElement = event.target as HTMLFormElement;
    const formData: FormData = new FormData(form);
    if (!formData.get("artistsAmount") || event.currentTarget == null) {
      // if query is empty or form is null, don't send request
      isLoadingMore = false;
      return;
    }
    const response = await fetch("?/getSongs", {
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
      if (defaultSongs.length % 10 !== 0) {
        noMore = true;
      }
    } else {
      noMore = true;
    }
    isLoadingMore = false;
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 1); // delay by 1 milliseconds
  }
</script>

<div class="flex justify-center items-center">
  <div class="inline-block rounded-3xl card bg-base-100">
    <div class="card-body pb-5">
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
      <!-- TODO: not 100% happy with this design yet -->
      <div class="flex justify-center mt-3">
        <div class="badge badge-ghost rounded-full text-neutral-600">
          {isCustom ? "custom" : dateStamp}
        </div>
      </div>
    </div>
  </div>
</div>

<div class="p-3">
  <!-- TODO: extract more into components? -->

  <!-- Name of current artist -->
  <div class="m-2 text-4xl font-bold flex justify-center items-center">
    <img
      class="w-12 rounded-full m-2 mr-5"
      src={artistObj.image_url}
      alt={artistObj.name}
    />{artistObj.name}
  </div>

  <!-- Search Bar -->
  <form
    method="POST"
    on:submit|preventDefault={handleSearch}
    autocomplete="off"
    class="flex items-center justify-center gap-2 mt-3"
  >
    <input
      name="songQuery"
      type="text"
      placeholder="Find Song..."
      disabled={isLoading || gameStage != 0}
      class="input input-bordered select-none rounded-xl"
      bind:value={query}
    />
    <input type="hidden" name="artistId" bind:value={artistObj.id} />
    <input type="hidden" name="artistName" bind:value={artistObj.name} />
    <button
      type="submit"
      disabled={isLoading || gameStage != 0}
      class="btn {!query && searchMade
        ? 'btn-ghost'
        : 'btn-secondary'} x_shadow-md x_shadow-primary/50 text-base rounded-2xl"
      ><Icon
        icon={!query && searchMade ? "mdi:close" : "mdi:search"}
        class="text-lg"
      />
      {!query && searchMade ? "Clear" : "Search"}
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
                class="btn btn-base-content rounded-full btn-outline"
              >
                <img
                  class="w-8 rounded mr-1"
                  src={hit.song_art_image_thumbnail_url}
                  alt={hit.title}
                />
                {hit.title}
                <!-- TODO: fix formatting -->
                <span class="badge badge-primary rounded-md"
                  >{hit.artist_names}</span
                >
              </button>
            </li>
          {/each}
          <li class="w-full text-center m-1 mt-4">
            <!-- Show more button, inside here because it's only needed when there's songs being listed -->
            <!-- FIXME: fake ass form, again -->
            <form on:submit|preventDefault={handleShowMore}>
              <input
                type="hidden"
                name="artistsAmount"
                value={defaultSongs.length + 10}
              />
              <input type="hidden" name="artistId" value={artistObj.id} />
              <button
                class="btn btn-ghost"
                disabled={searchMade || noMore}
                type="submit"
              >
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
      <button class="btn btn-primary" on:click={handleCloseSong}>
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
              <form method="POST" on:submit|preventDefault={handleClickArtist}>
                <input type="hidden" name="artistIndex" value={i} />
                <input type="hidden" name="artistId" value={artist.id} />
                <button type="submit" class="btn btn-primary btn-outline"
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
  {dateStamp}
  bind:this={youWinModal}
/>
