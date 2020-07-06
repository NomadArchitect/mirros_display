const fs = require("fs");
const cproc = require("child_process");
const defaults = require("./app-config.defaults");

if (!fs.existsSync("./src/app-config.js")) {
  console.log("Writing default configuration to app-config.js:\n", defaults);
  fs.writeFileSync("./src/app-config.js", defaults);
} else {
  console.log("Configuration file exists, nothing changed");
}

const version = cproc.execSync("git describe --always").toString().trim();
console.log(`Writing current git ref ${version} to app-version.js`);
fs.writeFileSync("./src/app-version.js", `export default "${version}";\n`);
