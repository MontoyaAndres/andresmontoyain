<script>
  export let title;
  export let items;
  export let randomColor;
</script>

<style>
  .mr-1 {
    margin-top: 4px;
  }
</style>

<div class="border-top py-3 pr-3">
  <h3 class="h4">{title}</h3>
  <ul
    class="d-flex flex-wrap flex-justify-evenly flex-items-center
    list-style-none">
    {#each items as item}
      <li
        class="summary-toolkit p-2 rounded-1 my-1y mr-1 text-white f6 text-bold"
        style="background-color: {randomColor()}">
         {item}
      </li>
    {/each}
  </ul>
</div>
