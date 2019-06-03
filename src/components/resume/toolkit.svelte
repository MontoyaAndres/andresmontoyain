<script>
  import ToolkitSet from "./toolkit-set.svelte";

  export let json;
  export let current_language;
  export let randomColor;

  const toolkits = [
    "Git",
    "HTML",
    "CSS",
    "JS",
    "React",
    "TypeScript",
    "GraphQL",
    "Apollo",
    "Node.js",
    "Jest",
    "NextJS",
    "Mobx",
    "MySQL",
    "MongoDB"
  ];

  const learning = [
    "Redis",
    "Python",
    "Svelte.js",
    "PostgreSQL",
    "Electron.js",
    "Firebase",
    "Figma",
    "Prisma"
  ];
</script>

<ToolkitSet
  title={json[current_language].setToolsTitle}
  items={toolkits}
  {randomColor} />
<ToolkitSet
  title={json[current_language].learningToolsTitle}
  items={learning}
  {randomColor} />
