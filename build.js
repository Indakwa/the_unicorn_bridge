const fs = require("fs");
const yazl = require("yazl");
const { minify } = require("html-minifier-terser");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const js = fs.readFileSync("src/game.js", "utf8");

const output = html
  .replace(
    '<link rel="stylesheet" href="styles.css">',
    `<style>${css}</style>`
  )
  .replace(
    '<script src="src/game.js"></script>',
    `<script>${js}</script>`
  );

async function build() {
  const minified = await minify(output, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true
  });

  fs.mkdirSync("dist", { recursive: true });

  fs.writeFileSync("dist/index.html", minified);

  const zip = new yazl.ZipFile();
  zip.addFile("dist/index.html", "index.html");

  zip.outputStream.pipe(fs.createWriteStream("dist/game.zip"));

  zip.end();

  console.log("Build created: dist/index.html");
  console.log("ZIP created: dist/game.zip");
}

build();