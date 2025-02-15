#!/usr/bin/env node

const fs = require("fs")
const pkg = require("../package.json")

const data = `// Do not touch this file, auto-generated by scripts/create-versionfile
export const VERSION = "${pkg.version}"\n`

fs.writeFile(`${process.cwd()}/src/version.ts`, data, "utf8", err => {
  if (err) throw err
  console.log("The VERSION file has been saved!")
  process.exit(0)
})
