<script>
// @ts-nocheck

  import { onMount } from 'svelte';

  let songQuery = '';
  let searchResults = [];
  let error = null;
  let isLoading = false; // Add a loading state variable

  // let artist = "Travis Scott"; // TODO: remove
  let artistId= 683879;

  async function handleSearch(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    isLoading = true; // Set loading state to true
    try {
      const response = await fetch(`api/search?query=${encodeURIComponent(songQuery)}&artistId=${artistId}`);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const data = await response.json();
      // Clear the searchResults array
      searchResults = [];
      // console.log(data);
      for (let i=0;i<data.length;i++)
      {
        let hasArtist=false;
        let primary = data[i].result.primary_artists;
        let features = data[i].result.featured_artists;
        // searchResults.push(data[i]); // Debug line, uncomment to see all results
        // TODO: simplify by combining primary and featured artists?
        for (let element of primary)
        {
          // if (element.name==artist)
          if (element.id==artistId)
          {
            console.log("found artist in primary");
            hasArtist=true;
            searchResults.push(data[i]);
            break;
          }
        }
        if (hasArtist)
        {
          continue;
        }
        for (let element of features)
        {
          // if(element.name==artist)
          if (element.id==artistId)
          {
            console.log("found artist in featured");
            searchResults.push(data[i]);
            break;
          }
        }
        // console.log(data[i]);
      }
      // searchResults = data;
      console.log(searchResults.length + " songs featured artist");
      error = null;
    } catch (err) {
      error = err.message;
      searchResults = [];
      console.log("oh no error:"+error);
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
{:else}
<p class="text-gray-400">{searchResults.length} Results</p>
{/if}

{#if error}
  <p class="error">{error}</p>
{/if}

