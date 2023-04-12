#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");
const metalsmith = require("metalsmith");
const filter = require("metalsmith-filter");
const ignore = require("metalsmith-ignore");
const excerpt = require("metalsmith-excerpts");
const markdown = require("metalsmith-markdown");

const outputFolder = "jsonOutput";

const options = {
  cwd: "./",
  src: "contenido/",
  filePattern: "**/*.md",
  ignore: "*(icon|input)*",
};

function createFolder(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
}

async function outputJson(files, metalsmith, done) {
  console.log("outputJson", { metalsmith, done });
  console.log(files);

  createFolder(`${outputFolder}`);

  for (let file in files) {
    files[file].html = files[file].contents.toString("utf8");
    files[file].text = files[file].excerpt
    delete files[file].contents;
    delete files[file].excerpt;
    delete files[file].stats;
    delete files[file].mode;
    
    console.log(">> ", file);
    // console.log(JSON.stringify(files[file], null, 2));

    let filePath = path.resolve(
      `./${outputFolder}/`,
      file.replace(".html", ".json")
    );
    console.log(filePath)
    createFolder(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(files[file], null, 2));
  }
}

async function main() {
  const ignorePattern = options.ignore
    .toString()
    .replace(/\[|\]/g, "")
    .split(",");

  return new Promise((resolve, reject) => {
    try {
      metalsmith(path.resolve(options.cwd))
        .source(options.src)
        .use(filter(options.filePattern || "**/*.md"))
        .use(ignore(ignorePattern))
        .use(markdown())
        .use(excerpt())
        .use(outputJson)
        .use((data) => {
          resolve(data);
        })
        .process((err, files) => {
          if (err) {
            cli.fatal(err);
          }
        });
    } catch (err) {
      reject(err);
    }
  });
}

main();
