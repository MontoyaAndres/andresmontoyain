import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import json from "rollup-plugin-json";
import workbox from "rollup-plugin-workbox-build";
import ms from "ms";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/bundle.js"
  },
  plugins: [
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: css => {
        css.write("public/bundle.css");
      }
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve(),
    commonjs(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),

    json({
      // All JSON files will be parsed by default,
      // but you can also specifically include/exclude files
      include: "src/**",
      exclude: ["node_modules/**"],

      // for tree-shaking, properties will be declared as
      // variables, using either `var` or `const`
      preferConst: true, // Default: false

      // specify indentation for the generated default export —
      // defaults to '\t'
      indent: "  ",

      // ignores indent and generates the smallest code
      compact: true, // Default: false

      // generate a named export for every property of the JSON object
      namedExports: true // Default: true
    }),

    workbox({
      mode: "generateSW",
      options: {
        swDest: "public/service-worker.js",
        globDirectory: "public",
        runtimeCaching: [
          {
            urlPattern: /https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/Primer\/11.0.0\/build.css/,
            handler: "networkFirst",
            options: {
              cacheName: "https-calls",
              networkTimeoutSeconds: 15,
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: ms("30 days")
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "cacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: ms("10 days")
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  watch: {
    clearScreen: false
  }
};
