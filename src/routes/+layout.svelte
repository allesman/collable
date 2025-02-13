<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import "../app.css";
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";

  injectSpeedInsights();
</script>

<div class="bg-base-300 min-h-screen">
  <Navbar />
  <slot />
</div>
