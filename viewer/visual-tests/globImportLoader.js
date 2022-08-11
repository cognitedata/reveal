/*!
 * Copyright 2022 Cognite AS
 */
const path = require('path');
const glob = require('glob');

const regex = /@?import + ?((\w+) +from )?([\'\"])(.*?);?\3/gm;
const importModules = /import +(\w+) +from +([\'\"])(.*?)\2/gm;
const importFiles = /import +([\'\"])(.*?)\1/gm;

let resourcePath;

function getGlobImports(filename, resourcePath, match, obj) {
  return glob
    .sync(filename, { absolute: true, ignore: '**/node_modules/**' })
    .map(file => path.normalize(path.relative(path.dirname(resourcePath), file)))
    .map(p => `./${p.slice(0, -3).replaceAll('\\', '/')}`)
    .map((file, index) => {
      let fileNameToken = `'${file}'`;
      let importString;
      let moduleName;
      if (match.match(importModules)) {
        moduleName = obj + index;
        importString = `import * as ${moduleName} from ${fileNameToken};`;
      } else if (match.match(importFiles)) {
        importString = `import ${fileNameToken};`;
      } else {
        this.emitWarning('Unknown import: "' + match + '"');
      }
      return { path: fileNameToken, module: moduleName, importString };
    });
}

function replaceImportGlob(importStatement, fromStatement, moduleBlobVariableName, quote, filename) {
  if (!glob.hasMagic(filename)) {
    return match;
  }
  const paths = getGlobImports(filename, resourcePath, importStatement, moduleBlobVariableName);
  let result = paths.map(path => path.importString).join(' ');
  if (result && paths.length) {
    result += ` const ${moduleBlobVariableName} = [${paths.map(p => `${p.module}.default`).join(', ')}];`;
  } else if (!result) {
    this.emitWarning('Empty results for "' + importStatement + '"');
  }
  return result.slice(0, -1);
}

module.exports = function (source) {
  this.cacheable && this.cacheable(true);
  resourcePath = this.resourcePath;
  return source.replace(regex, replaceImportGlob);
};
