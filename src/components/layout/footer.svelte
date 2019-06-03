<script>
  export let json;
  export let current_language;
</script>

<footer class="mb-6 pt-4 border-top">
  <p class="mb-2">
    {@html json[current_language].footer}
  </p>
</footer>
