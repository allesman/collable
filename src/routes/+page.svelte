<script>
// @ts-nocheck

  import Navbar from '$lib/components/Navbar.svelte';
  import { onMount } from 'svelte';

  let songQuery = '';
  let searchResults = [];
  let error = null;
  let isLoading = false; // Add a loading state variable

  async function handleSearch(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    isLoading = true; // Set loading state to true
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
    finally {
      isLoading = false; // Set loading state to false after the request is complete
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

{#if isLoading}
  <p>Loading...</p>
{:else if searchResults.length > 0}
  <ul>
    {#each searchResults as hit}
      <li>{hit.result.full_title}</li>
    {/each}
  </ul>
{/if}

{#if error}
  <p class="error">{error}</p>
{/if}

