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
  const isCustom: boolean = data.isCustom;
  let defaultSongs: Song[] = new Array(); // the most popular songs of the current artist, not filtered with a search query
  // let defaultSongs: Song[] = data.defaultSongs; // the most popular songs of the current artist, not filtered with a search query
  // const dateStamp: string = data.dateStamp;
  let dateStamp: string;

  // modal shown when the user wins the game
  import YouWin from "$lib/components/YouWin.svelte";
  let youWinModal: Modal;

  // counting how many guesses the user has made
  let numGuesses: number = 0;
  // saving the path traversed
  let path: string[] = [];
  // saving whether a search has been made
  let searchMade: boolean = false;

  // the different stages of the game
  // -1: page is still loading
  // 0: select a song by the current artist
  // 1: select artist featured on the song to be new current artist -> back to 0 or 2
  // 2: win
  let gameStage: number = -1;

  // for gameStage 0
  let artistObj: Artist; // the current artist
  let searchResults: Song[] = []; // the songs found by the search query
  let query: string = ""; // the search query
  let error: string | null = null;
  let isLoading: boolean = false; // for loading songs from search query
  let isLoadingMore: boolean = false; // for loading more songs
  let noMore: boolean = false; // for when there are no more songs to load
  const showMoreAmount: number = 10; // the amount of songs to load when clicking "show more"

  import Hint from "$lib/components/Hint.svelte";
  let hint: Hint;
  let usedHint: boolean = false;

  let startArtist: Artist;
  let goalArtist: Artist;

  async function fetchMatchupData() {
    try {
      let gameData;
      if (isCustom) {
        gameData = data;
      } else {
        const response = await fetch("api/getMatchupData", {
          method: "POST",
          body: JSON.stringify({
            date: DateTime.now().toFormat("yyyy-MM-dd"),
          }),
        });
        if (response.ok) {
          gameData = await response.json();
        } else {
          error = "Failed to fetch matchup data";
        }
      }
      startArtist = gameData.startArtist;
      goalArtist = gameData.goalArtist;
      dateStamp = gameData.dateStamp;
      artistObj = startArtist;
      path.push(startArtist.name);
      gameStage = 0;
      handleShowMore(false);
    } catch (err) {
      error = "An error occurred while fetching matchup data";
    }
  }

  async function handleSearch(event: SubmitEvent) {
    event.preventDefault();
    isLoading = true;
    error = null;
    query = "";
    const form: HTMLFormElement = event.target as HTMLFormElement;
    const formData: FormData = new FormData(form);
    if (!formData.get("songQuery") || event.currentTarget == null) {
      isLoading = false;
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

  async function handleClear(event: SubmitEvent) {
    // reset to default songs
    event.preventDefault();
    searchMade = false;
  }

  // for gameStage 1
  let song: Song; // the song selected by the user

  async function handleClickSong(index: number) {
    gameStage = 1;
    error = null;
    song = searchResults[index] ?? defaultSongs[index];
    const response = await fetch("api/getAppleMusicId", {
      method: "POST",
      body: JSON.stringify({
        songId: song.id,
      }),
    });
    if (response.ok) {
      let { apple_music_id } = await response.json();
      song = { ...song, apple_music_id };
    } else {
      error = "Something went wrong while loading data for new song";
    }
    // searchMade = false;
    // document
    //   .getElementById("apple-music-player")
    //   .contentWindow.document.getElementByClassName("play-initial")
    //   .click();
  }

  async function handleCloseSong() {
    gameStage = 0;
  }

  async function handleClickArtist(artistIndex?: number, artistId?: number) {
    isLoading = true;
    noMore = false;
    if (artistIndex !== undefined) {
      // If this method was actually called from clicking an artist, set them as the new artist (otherwise, keep the current artist)
      artistObj = song.primary_artists.concat(song.featured_artists)[
        artistIndex
      ];
      // also only then increment the number of guesses
      numGuesses++;
      // and add the artist to the path
      path.push(artistObj.name);
    }
    gameStage = 0;
    searchResults = [];
    searchMade = false;
    // Check for game win
    if (artistObj.id === goalArtist.id) {
      isLoading = false;
      youWinModal.openModal();
      gameStage = 2;
    } else {
      // Since no game win, get new default songs for artist
      const response = await fetch("api/getDefaultSongs", {
        method: "POST",
        body: JSON.stringify({
          artistId: artistObj.id,
        }),
      });
      if (response.ok) {
        let { newSongs } = await response.json();
        defaultSongs = newSongs;
        console.assert(defaultSongs.length > 0, "No default songs returned");
        if (defaultSongs.length % showMoreAmount !== 0) {
          noMore = true;
        }
      } else {
        error = "Something went wrong while loading data for new artist";
      }
      isLoading = false;
    }
  }

  async function handleShowMore(scrollDown: boolean = true) {
    if (isLoadingMore || gameStage === -1) {
      return;
    }
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
    if (scrollDown) {
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 1); // delay by 1 milliseconds
    }
  }

  function handleGetHint(): void {
    usedHint = true;
    hint.openModal();
  }
  import { onMount } from "svelte";
  import { DateTime } from "luxon";

  onMount(() => {
    fetchMatchupData();
  });
</script>

<div class="flex justify-center items-center">
  <div class="inline-block rounded-3xl card bg-base-100">
    <div class="card-body pb-5">
      <div
        class="flex justify-center items-center text-shadow-soft shadow-base-content"
      >
        Use features to get from
      </div>
      <div
        class="flex justify-center items-center pt-2 text-2xl font-bold gap-3 text-shadow-soft shadow-base-content"
      >
        {#if startArtist}
          <img
            class="w-10 rounded-full"
            src={startArtist.image_url}
            alt={startArtist.name}
            width="10"
            height="10"
          />
          {startArtist.name}
        {:else}
          <div class="w-10 h-10 rounded-full skeleton"></div>
          <div class="w-24 h-6 skeleton"></div>
        {/if}
        <Icon
          icon="mdi:arrow-right-thick"
          class="text-shadow-soft shadow-base-content"
        />

        {#if goalArtist}
          <img
            class="w-10 rounded-full"
            src={goalArtist.image_url}
            alt={goalArtist.name}
            width="10"
            height="10"
          />
          <div class="flex items-center gap-1">
            {goalArtist.name}
            <button
              on:click={handleGetHint}
              class="btn btn-ghost btn-circle btn-sm"
            >
              <Icon icon="mdi:lightbulb" class="text-2xl font-bold" />
            </button>
          </div>
        {:else}
          <div class="w-10 h-10 rounded-full skeleton"></div>
          <div class="w-24 h-6 skeleton"></div>
        {/if}
      </div>
      <div class="flex justify-center mt-3">
        <div
          class="badge badge-ghost rounded-full text-shadow-soft shadow-neutral-600 text-neutral-600"
          class:skeleton={gameStage === -1}
          class:w-20={gameStage === -1}
        >
          {#if gameStage !== -1}
            {#if isCustom}
              ✨ custom
            {:else}
              🗓️ {dateStamp}
            {/if}
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<div class="p-3">
  <!-- TODO: extract more into components? -->
  <!-- Name of current artist -->
  <div
    class="m-2 text-4xl font-bold flex justify-center items-center text-shadow-soft shadow-base-content"
  >
    {#if goalArtist}
      <img
        class="w-12 rounded-full m-2 mr-5"
        src={artistObj?.image_url}
        alt={artistObj?.name}
        width="12"
        height="12"
      />{artistObj?.name}
    {:else}
      <div class="w-12 h-12 rounded-full m-2 mr-5 skeleton"></div>
      <div class="w-32 h-10 skeleton"></div>
    {/if}
  </div>

  <!-- Search Bar -->
  <form
    method="POST"
    on:submit|preventDefault={!query && searchMade ? handleClear : handleSearch}
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
    {#if gameStage !== -1}
      <input type="hidden" name="artistId" bind:value={artistObj.id} />
      <input type="hidden" name="artistName" bind:value={artistObj.name} />
    {/if}
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

  {#if gameStage === -1 || gameStage === 0}
    <!-- Songs (gameStage 0 only) -->
    <div class="flex items-center justify-center mt-10">
      {#if isLoading}
        <!-- still loading -->
        <p class="mt-1">
          <span class="loading loading-spinner"></span> Loading...
        </p>
      {:else if (searchMade && searchResults.length > 0) || !searchMade}
        <!-- search made and had results, display them / no search made yet, display default songs -->
        <ul class="flex flex-col items-center justify-center">
          {#each searchMade ? searchResults : defaultSongs as hit, i}
            <li class="w-full text-center m-1">
              <button
                on:click={() => handleClickSong(i)}
                data-index={i}
                class="btn btn-base-content rounded-full btn-outline h-auto py-1"
              >
                <div class="flex items-center">
                  <img
                    class="w-8 rounded mr-1"
                    src={hit.song_art_image_thumbnail_url}
                    alt={hit.title}
                    width="8"
                    height="8"
                  />
                  {hit.title}
                </div>
                <span class="badge badge-primary rounded-md h-auto"
                  >{hit.artist_names}</span
                >
              </button>
            </li>
          {/each}
          <li class="w-full text-center m-1 mt-4">
            <!-- Show more button, inside here because it's only needed when there's songs being listed -->
            <button
              class="btn btn-ghost"
              disabled={searchMade || noMore}
              on:click={() => handleShowMore()}
            >
              {#if isLoadingMore || gameStage === -1}
                <span class="loading loading-spinner"></span> Loading...
              {:else}
                Show More
              {/if}
            </button>
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
            width="8"
            height="8"
          />
          {song.title}
        {/if}
        <span class="ml-1">✕</span>
      </button>
      <ul class="flex flex-col items-center justify-center mt-5">
        {#each song.primary_artists.concat(song.featured_artists) as artist, i}
          {#if artist.id !== artistObj.id}
            <li class="w-full text-center m-1">
              <button
                on:click={() => handleClickArtist(i, artist.id)}
                class="btn btn-primary btn-outline">{artist.name}</button
              >
            </li>
          {/if}
        {/each}
      </ul>
      <!-- <iframe
        class=" w-64 max-w-[660px] overflow-hidden border-radius-10 rounded-2xl mt-10"
        title="Listen to the song"
        id="apple-music-player"
        allow="fullscreen *;"
        frameborder="0"
        height="175"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation allow-autoplay"
        src={`https://embed.music.apple.com/song/${song.apple_music_id}`}
      ></iframe> -->
      <!-- ?theme=dark -->
    </div>
  {:else if gameStage === 2}
    <nbsp></nbsp>
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
  startArtistName={startArtist?.name}
  goalArtistName={goalArtist?.name}
  {numGuesses}
  {isCustom}
  {dateStamp}
  {usedHint}
  {path}
  bind:this={youWinModal}
/>

<Hint bind:this={hint} artistObj={goalArtist} />
