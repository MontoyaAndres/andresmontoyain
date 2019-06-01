<script>
  import Header from "./header.svelte";
  import Footer from "./footer.svelte";
</script>

<Header />
<div class="main-content mx-auto px-3 p-responsive mt-4">
  <slot />
  <Footer />
</div>
