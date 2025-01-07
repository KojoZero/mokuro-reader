<script lang="ts">
  import '../app.postcss';
  import { dev } from '$app/environment';
  import { inject } from '@vercel/analytics';

  import NavBar from '$lib/components/NavBar.svelte';
  import Snackbar from '$lib/components/Snackbar.svelte';
  import ConfirmationPopup from '$lib/components/ConfirmationPopup.svelte';

  inject({ mode: dev ? 'development' : 'production' });
</script>

<div class=" h-screen max-h-screen min-h-svh text-white">
  <NavBar />
  <slot />
  <Snackbar />
  <ConfirmationPopup />
</div>
