const workerPackageJSON = require("./package.json");
const cdnDistFolderPath = "/dist/cdn/";

/*
 * Set args on the command line using
 * ```bash
 * webpack --env.argname=value
 * ```
 */
function getEnvArg(env, name, defaultValue) {
  if (env === undefined) {
    return defaultValue;
  }
  if (env[name] === undefined) {
    return defaultValue;
  }
  if (env[name] === "true") {
    return true;
  }
  if (env[name] === "false") {
    return false;
  }
  return typeof env[name] === "string" ? env[name].trim() : env[name];
}

const workerCDNPath =
  "https://cdn.jsdelivr.net/npm/" +
  workerPackageJSON.name +
  "@" +
  workerPackageJSON.version +
  `${cdnDistFolderPath}`;

// overriding of that one is useful only when you're attaching your local reveal build
// to some project that uses reveal. For local usage you'll need to:
//  1) `yarn run local-cdn` under /parser-worker folder, it will:
//    * build both worker and viewer with the same PUBLIC_PATH env
//    * copy worker files to examples/public/local-cdn so they are available under your PUBLIC_PATH
//    * run examples server with `yarn start`
//  2) link viewer to a target project with yarn link.
//  3) use `revealEnv.publicPath = https://localhost:8080/local-cdn/` in code of a target project
let publicPath = getEnvArg(process.env, "PUBLIC_PATH", "");
if (publicPath && !publicPath.endsWith("/")) {
  publicPath += "/";
}

module.exports = { publicPath, workerCDNPath, cdnDistFolderPath, getEnvArg };
