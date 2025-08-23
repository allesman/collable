<script lang="ts">
  import ThemeSwitch from "./ThemeSwitch.svelte";
  import Icon from "@iconify/svelte";
  import CreateCustomGame from "./CreateCustomGame.svelte";
  import Tutorial from "./Tutorial.svelte";

  let createCustomGame: CreateCustomGame;
  let tutorial: Tutorial;

  if (typeof window !== "undefined") {
    checkFirstVisit();
  }

  function checkFirstVisit() {
    if (localStorage.getItem("was_visited") !== "true") {
      setTimeout(() => {
        tutorial.openModal();
        // console.log("first visit");
      }, 10);
      localStorage.setItem("was_visited", "true");
      return;
    }
    // console.log("not first visit");
  }
</script>

<CreateCustomGame bind:this={createCustomGame} />
<Tutorial bind:this={tutorial} />
<div class="navbar sticky top-0 z-50 bg-base-200">
  <div class="navbar-start pl-2 gap-2">
    <button
      class="btn btn-m btn-neutral rounded-xl"
      on:click={() => createCustomGame.openModal()}
      aria-label="Create a custom game"
    >
      <Icon icon="mdi:sparkles-outline" class="text-xl" />
      <span class="hidden xs:block">Custom</span>
    </button>
    <!-- TODO: add hard mode toggle (hard mode:no default songs?? or songs with artist credits only) -->
    <button
      class="btn btn-m btn-neutral rounded-xl"
      on:click={() => tutorial.openModal()}
      aria-label="How to play"
    >
      <Icon icon="mdi:help-circle-outline" class="text-xl" />
      <span class="hidden md:block">How To Play</span>
    </button>
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
  <div class="navbar-end pr-2 gap-2">
    <!-- <a href="https://www.tiktok.com/collable_app/" target="_blank">
      <Icon icon="proicons:tiktok" class="w-10 h-10"></Icon>
    </a> -->
    <!-- <a
      href="https://www.instagram.com/collable.app/"
      target="_blank"
      aria-label="Instagram Page"
    >
      <Icon icon="mdi:instagram" class="w-10 h-10"></Icon>
    </a> -->
    <a
      href="https://www.linktr.ee/collableapp"
      target="_blank"
      aria-label="Linktree"
      class="btn btn-m btn-neutral rounded-xl"
    >
      <Icon icon="mdi:link-variant" class="text-xl"></Icon>
      <!-- <Icon icon="mdi:share-variant-outline" class="w-10 h-10"></Icon> -->
    </a>
    <ThemeSwitch />
  </div>
</div>
<!-- <div class="divider" /> -->
