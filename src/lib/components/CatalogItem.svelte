<script lang="ts">
  import { catalog } from '$lib/catalog';

  export let id: string;
  $: currManga = $catalog?.find((item) => item.id === id);
  $: mangaCoverId = currManga?.coverId ?? 1;
  $: manga = currManga?.manga[mangaCoverId-1];
</script>

{#if manga}
  <a href={id}>
    <div
      class="flex flex-col gap-[5px] text-center items-center bg-slate-900 pb-1 bg-opacity-50 border border-slate-950"
    >
      {#if manga.files}
        <img
          src={URL.createObjectURL(Object.values(manga.files)[0])}
          alt="img"
          class="object-contain sm:w-[250px] sm:h-[350px] bg-black border-gray-900 border"
        />
      {/if}
      <p class="font-semibold sm:w-[250px] line-clamp-1">
        {manga.mokuroData.title}
      </p>
    </div>
  </a>
{/if}
