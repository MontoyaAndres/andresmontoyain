<script>
  export let json;
  export let current_language;
</script>

<div class="border-top py-3 pr-3">
  <h3 class="mb-1 h4">{json[current_language].socialNetworkTitle}</h3>
  <a
    aria-label="GitHub"
    class="tooltipped tooltipped-n avatar-group-item"
    href="https://github.com/MontoyaAndres/">
    <img src="images/github.svg" class="mr-1" height="35" alt="GitHub Logo" />
  </a>
  <a
    aria-label="Twitter"
    class="tooltipped tooltipped-n avatar-group-item"
    href="https://twitter.com/andresmontoyain/">
    <img
      src="images/twitter.png"
      class="mr-1"
      height="35"
      alt="Twitter Logo." />
  </a>
  <a
    aria-label="Instagram"
    class="tooltipped tooltipped-n avatar-group-item"
    href="https://www.instagram.com/andresmontoyain/">
    <img
      src="images/instagram.png"
      class="mr-1"
      height="35"
      alt="Instagram Logo." />
  </a>
  <a
    aria-label="Dev"
    class="tooltipped tooltipped-n avatar-group-item"
    href="https://dev.to/andresmontoyain">
    <img
      src="images/dev.svg"
      alt="Andrés Montoya's DEV Profile"
      height="35"
      width="35" />
  </a>
  <a
    aria-label="Platzi"
    class="tooltipped tooltipped-n avatar-group-item"
    href="https://platzi.com/@AndresMontoyaIN/">
    <img src="images/platzi.svg" alt="Platzi Logo." height="35" width="35" />
  </a>
</div>
