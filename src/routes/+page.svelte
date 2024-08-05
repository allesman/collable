<script>
// @ts-nocheck

  import Navbar from '$lib/components/Navbar.svelte';
  import { onMount } from 'svelte';

  let songQuery = '';
  let searchResults = [];
  let error = null;

  async function handleSearch(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    try {
      const response = await fetch(`api/search?query=${encodeURIComponent(songQuery)}`);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(data);
      searchResults = data;
      error = null;
    } catch (err) {
      error = err.message;
      searchResults = [];
    }
  }

  // Optionally, you can perform an initial search on mount
  // onMount(() => {
  //   handleSearch(new Event('submit'));
  // });
</script>

<Navbar/>

<div class="flex items-center justify-center">
  <form on:submit={handleSearch} class="w-full max-w-xs">
    <input
      type="text"
      placeholder="Enter Song :3"
      class="input input-bordered w-full"
      bind:value={songQuery}
    />
    
    <div class="flex items-center justify-center">
      <button type="submit" class="btn mt-2 btn-primary">Search</button>
    </div>
  </form>
</div>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if searchResults.length > 0}
  <ul>
    {#each searchResults as hit}
      <li>{hit.result.full_title}</li>
    {/each}
  </ul>
{:else if searchResults.length === 0 && !error}
  <p>Loading...</p>
{/if}