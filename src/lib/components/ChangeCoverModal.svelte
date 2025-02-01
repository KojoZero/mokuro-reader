<script lang="ts">
    import { Modal } from 'flowbite-svelte';
    import { catalog } from '$lib/catalog';
    import { page } from '$app/stores';
    import { db } from '$lib/catalog/db';
    export let open = false;
    $: mangaCoverId = $catalog?.find((item) => item.id === $page.params.manga)?.coverId ?? 1;
    let coverIdInput: 1;
    function updateCoverId(newCoverId: number | undefined){
        if (newCoverId != undefined){
            let mangaLength = $catalog?.find((item) => item.id === $page.params.manga)?.manga.length ?? 0;
            if (newCoverId < mangaLength+1 && newCoverId > 0){
                db.catalog.update($page.params.manga, {coverId: newCoverId});
            }
        }
    }

  </script>
  
  <Modal size="xs" bind:open outsideclose>
    <form class="max-w-sm mx-auto">
        <label for="number-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Cover Volume:</label>
        <input type="number" id="number-input" bind:value={coverIdInput} on:change={() => updateCoverId(coverIdInput)} aria-describedby="helper-text-explanation" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={mangaCoverId.toString()} required />
    </form>
  </Modal>
  