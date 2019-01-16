const fs = require("fs");
const defaults = require("./appconfig.defaults");

if (!fs.existsSync("./src/appconfig.js")) {
  console.log("Writing default configuration to appconfig.js:\n", defaults);
  fs.writeFileSync("./src/appconfig.js", defaults);
} else {
  console.log("Configuration file exists, nothing changed");
}
