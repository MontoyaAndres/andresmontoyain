<script>
  import ToolkitSet from "./toolkit-set.svelte";

  export let json;
  export let current_language;
  export let randomColor;

  const toolkits = [
    "Git",
    "HTML",
    "CSS",
    "JavaScript",
    "React.js",
    "TypeScript",
    "GraphQL",
    "Apollo",
    "Node.js",
    "Jest",
    "MySQL",
    "PostgreSQL",
    "MongoDB"
  ];
</script>

<ToolkitSet
  title={json[current_language].setToolsTitle}
  items={toolkits}
  {randomColor} />
