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
    "Next.js",
    "Mobx",
    "MySQL",
    "MongoDB"
  ];

  const learning = [
    "Redis",
    "PostgreSQL",
    "Electron.js",
    "AWS Amplify",
    "Prisma",
    "Figma"
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
