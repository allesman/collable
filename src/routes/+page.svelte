<script>
  // TODO: remove this and adress type errors
  // @ts-nocheck

  // get the data from the server
  export let data;

  // the different stages of the game
  // 0: select a song by the current artist
  // 1: select a featured artist from the song to be new current artist -> back to 0
  let gameStage = 0;

  // for gameStage 0
  let artistObj = JSON.parse(data.artistObj); // the current artist, initialized with the artist from the server
  let searchResults = [];
  let error = null;
  let isLoading = false;

  // for gameStage 1
  let song = null; // the song selected by the user
  let songArtists = []; // the featured artists of the song selected by the user

  async function handleSearch(event) {
    event.preventDefault();
    isLoading = true;
    const formData = new FormData(event.target);
    if (!formData.get("songQuery")) {
      isLoading = false;
      return;
    }
    const response = await fetch(event.currentTarget.action, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const result = await response.json();
      searchResults = JSON.parse(JSON.parse(result.data)[0]);
      console.log(searchResults);
    } else {
      error = "Something went wrong";
    }
    event.target.reset();
    isLoading = false;
  }

  async function handleClickSong(event) {
    gameStage = 1;
    const index = event.currentTarget.dataset.index;
    song = searchResults[index].result;
    songArtists = song.primary_artists.concat(song.featured_artists);
  }
  async function handleClickArtist(event) {
    gameStage = 0;
    const index = event.currentTarget.dataset.index;
    artistObj = songArtists[index];
    searchResults = [];
    console.log(artistObj.index);
  }
</script>

<div class="text-center m-2 text-4xl text-primary">{artistObj.name}</div>

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
    <!-- <div class="flex items-center justify-center"> -->
    <button
      type="submit"
      disabled={isLoading || gameStage != 0}
      class="btn mt-2 btn-primary">Search</button
    >
    <!-- </div> -->
  </form>
</div>

{#if gameStage === 0}
  <div class="flex items-center justify-center mt-10">
    {#if isLoading}
      <p class="mt-1">Loading...</p>
    {:else if searchResults.length > 0}
      <ul class="flex flex-col items-center justify-center">
        {#each searchResults as hit, i}
          <li class="w-full text-center m-1">
            <button
              on:click={handleClickSong}
              data-index={i}
              class="btn btn-secondary btn-outline"
            >
              <!-- TODO: add image -->
              {hit.result.title}
              <span class="badge badge-secondary"
                >{hit.result.artist_names}</span
              >
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <!-- <p class="text-gray-400">No Results</p> -->
    {/if}
  </div>
{:else if gameStage === 1}
  <!-- TODO: close out of this view? -->
  <div class="flex flex-col items-center justify-center mt-10">
    <button class="btn btn-secondary no-animation">
      {song.title}
    </button>
    <ul class="flex flex-col items-center justify-center mt-5">
      {#each songArtists as artist, i}
        <li class="w-full text-center m-1">
          <button
            on:click={handleClickArtist}
            data-index={i}
            class="btn btn-secondary btn-outline">{artist.name}</button
          >
        </li>
      {/each}
    </ul>
  </div>
{:else}
  <p>Something went wrong</p>
{/if}

{#if error}
  <p class="error">{error}</p>
{/if}
