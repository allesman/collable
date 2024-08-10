<script>
// TODO: remove this and adress type errors
// @ts-nocheck

  import { onMount } from 'svelte';

  let searchResults = [];
  let error = null;
  let isLoading = false;

  let artistId= 683879;

  async function handleSubmit(event) {
    event.preventDefault();
    isLoading = true;
    const formData = new FormData(event.target);
    if (!formData.get('songQuery')) {
      return;
    }
    const response = await fetch(event.currentTarget.action, {
      method: 'POST',
      body: formData
    });
    if (response.ok) {
      const result = await response.json();
      // console.log(result.data);
      searchResults = JSON.parse(JSON.parse(result.data)[0]);
      console.log(searchResults);
    } else {
      error = 'Something went wrong';
    }
    event.target.reset();
    isLoading = false;
  }
</script>

<div class="flex items-center justify-center">

  <form method="POST" on:submit|preventDefault={handleSubmit} autocomplete="off" class="w-full max-w-xs">
    <!-- TODO: prevent from typing after submission -->
    <input name="songQuery" type="text" placeholder="Enter Song :3" class="input input-bordered w-full" />
    <input type="hidden" name="artistId" bind:value={artistId} />
    <div class="flex items-center justify-center">
      <button type="submit" class="btn mt-2 btn-primary">Search</button>
    </div>
  </form>

</div>

{#if isLoading}
  <p>Loading...</p>
{:else if searchResults.length > 0}
  <ul>
    {#each searchResults as hit}
      <li>{hit.result.full_title}</li>
    {/each}
  </ul>
{:else}
<p class="text-gray-400">{searchResults.length} Results</p>
{/if}

{#if error}
  <p class="error">{error}</p>
{/if}

