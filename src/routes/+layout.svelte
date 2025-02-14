<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import "../app.css";
</script>

<div class="min-h-screen bg-base-200">
  <Navbar />
  <slot />
</div>
