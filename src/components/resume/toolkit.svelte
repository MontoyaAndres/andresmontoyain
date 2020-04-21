<script>
  import ToolkitSet from "./toolkit-set.svelte";

  export let json;
  export let current_language;
  export let randomColor;

  const toolkits = [
    "Git",
    "TypeScript",
    "JavaScript",
    "React.js",
    "Node.js",
    "GraphQL",
    "CSS",
    "HTML",
    "Jest",
    "Serverless",
    "AWS Amplify"
  ];
</script>

<ToolkitSet
  title={json[current_language].setToolsTitle}
  items={toolkits}
  {randomColor} />
