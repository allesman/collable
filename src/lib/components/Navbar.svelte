<script lang="ts">
  import ThemeSwitch from "./ThemeSwitch.svelte";
  import Icon from "@iconify/svelte";
  import CreateCustomGame from "./CreateCustomGame.svelte";

  let createCustomGame: CreateCustomGame;
</script>

<CreateCustomGame bind:this={createCustomGame} />
<div class="navbar sticky top-0 z-50 bg-base-200">
  <div class="navbar-start pl-2">
    <button
      class="btn btn-m btn-outline rounded-xl"
      on:click={() => createCustomGame.openModal()}
    >
      <Icon icon="mdi:sparkles-outline" class="text-xl" />Custom
    </button>
    <!-- TODO: add hard mode toggle (hard mode:no default songs?? or songs with artist credits only) -->
    <!-- TODO: add button to show tutorial popup (should also show up on first visit) -->
    <!-- Identify the artist matchup:

Kendrick Lamar

Chappell Roan

2

Tap on the related artists that you think will get you closer to the target artist. Press and hold on an artist to hear a sample of their music. The less steps it takes you, the better your score!

If you get stuck, you can Reset, use the Hint, or Give Up.

3

Select the target artist once they pop up or you'll miss it! Have fun!
Clicking an artist box
What's a related artist?

Related artists are based on the "Fans Also Like" sections on music services. They use data from listeners of an artist to identify other artists that fans frequently listen to.  -->
  </div>

  <a
    href="/"
    class="btn btn-ghost btn-lg text-4xl navbar-center text-shadow-softer shadow-base-content"
    on:click|preventDefault={() => {
      const htmlElement = document.querySelector("html");
      if (htmlElement) {
        htmlElement.scrollTo({ top: 0, behavior: "smooth" });
      }
    }}>collable</a
  >

  <!-- aligned right -->
  <div class="navbar-end pr-2">
    <ThemeSwitch />
  </div>
</div>
<!-- <div class="divider" /> -->
