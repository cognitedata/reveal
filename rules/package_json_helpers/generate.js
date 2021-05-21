const fs = require('fs');
const path = require('path');

const depcheck = require('depcheck');

const buildFilePath = process.argv[2];
const outDir = process.argv[3];
const packagePath = process.argv[4];
const srcPath = process.argv[5];
const workspace = process.argv[6];

const START_FLAG = `### start of auto-generated helpers ###`;
const END_FLAG = `### end of auto-generated helpers ###`;

function cleanBuildFileContents(contents) {
  let out = contents;
  const startIndex = contents.indexOf(START_FLAG);
  if (startIndex > 0) {
    out = contents.substring(0, startIndex);
  }
  const endIndex = contents.lastIndexOf(END_FLAG);
  if (endIndex > 0) {
    out += contents.substring(endIndex + END_FLAG.length);
  }

  return out;
}

function readPackage(fileName) {
  const contents = fs.readFileSync(fileName);
  return JSON.parse(contents);
}

function excludeInternal(deps) {
  const out = {};
  Object.keys(deps).forEach((name) => {
    if (!deps[name].startsWith('link:')) {
      out[name] = deps[name];
    }
  });
  return out;
}

function filterNameStartsWith(deps, prefix) {
  const out = {};
  Object.keys(deps).forEach((name) => {
    if (name.startsWith(prefix)) {
      out[name] = deps[name];
    }
  });
  return out;
}

function excludeNameStartsWith(deps, prefix) {
  const out = {};
  Object.keys(deps).forEach((name) => {
    if (!name.startsWith(prefix)) {
      out[name] = deps[name];
    }
  });
  return out;
}

function formatDependencies(name, prefix, deps) {
  const list = Object.keys(deps).map((dep) =>
    // different behaviour for internal dependencies
    dep.indexOf('//') > -1 ? `"${dep}"` : `"${prefix}//${dep}"`
  );
  return `${name} = [${list.join(', \n')}]`;
}

/**
 * Find all files recursively in specific folder with specific extension, e.g:
 * findFilesInDir('./project/src', '.html') ==> ['./project/src/a.html','./project/src/build/index.html']
 * @param  {String} startPath    Path relative to this file or other file which requires this files
 * @param  {String} filter       Extension name, e.g: '.html'
 * @return {Array}               Result files with path string in an array
 */
function findFilesInDir(startPath, filter) {
  var results = [];

  if (!fs.existsSync(startPath)) {
    return results;
  }

  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      results = results.concat(findFilesInDir(filename, filter)); //recurse
    } else if (filename.indexOf(filter) >= 0) {
      results.push(filename);
    }
  }
  return results;
}

function excludeNonPresent(deps, missing) {
  const out = {};

  Object.keys(deps).forEach((name) => {
    let cleanName = name.replace('@types/', '');
    if (cleanName.indexOf('__') > -1) {
      // Edge case for scoped packages
      // https://github.com/DefinitelyTyped/DefinitelyTyped/tree/987a09b4979415a83491328a57cf4def5b7e1bc7#what-about-scoped-packages
      cleanName = '@' + cleanName.replace('__', '/');
    }
    if (missing[cleanName]) {
      out[name] = deps[name];
    }
  });

  return out;
}

function appendInternalDependencies(deps, missing, internal) {
  const out = {};

  Object.keys(missing).forEach((name) => {
    const newValue = internal[name];
    if (newValue) {
      out[newValue] = '*';
    }
  });
  return {
    ...deps,
    ...out,
  };
}

const buildFileContents = fs.readFileSync(buildFilePath).toString();
const package = readPackage(packagePath);

const ruleRegex = /^generate_package_json_helpers\([^\)]+\)/gm;

const ruleImpl = buildFileContents.match(ruleRegex);
const buildFileParts = cleanBuildFileContents(buildFileContents).split(
  ruleRegex
);

if (ruleImpl.length === 1 && buildFileParts.length !== 2) {
  process.stderr.write(
    `Unable to find generate_package_json_helpers target in ${buildFilePath}`
  );
  process.exit(1);
}

depcheck(process.cwd() + '/' + path.dirname(srcPath), {
  detectors: [depcheck.detector.importDeclaration],
  ignorePatterns: [
    // do not parse files starting with dot (.), e.g. .eslintrc.js
    '.*',
  ],
}).then(({ missing }) => {
  const internalPackagesNames = findFilesInDir(
    './packages',
    'package.json'
  ).reduce((acc, file) => {
    const { name } = readPackage(file);
    if (name) {
      acc[name] = '//packages/' + name.replace('@cognite/', '');
      return acc;
    } else {
      process.stderr.write(`Error during read file, skipping: ${name}\n`);
      return acc;
    }
  }, {});

  const dependencies = appendInternalDependencies(
    excludeNonPresent(
      excludeNameStartsWith(
        excludeNameStartsWith(
          excludeInternal(package.dependencies),
          '@bazel/'
        ),
        'react-scripts'
      ),
      missing
    ),
    missing,
    internalPackagesNames
  );

  const devDependencies = excludeNonPresent(
    excludeNameStartsWith(
      excludeNameStartsWith(
        excludeNameStartsWith(
          excludeInternal(package.devDependencies),
          '@bazel/'
        ),
        '@types/'
      ),
      'testcafe'
    ),
    missing
  );

  const output = `
${buildFileParts[0]}${ruleImpl[0]}

### start of auto-generated helpers ###

# Dependencies from package.json
${formatDependencies('DEPENDENCIES', workspace, dependencies)}

# Dev dependencies from package.json
${formatDependencies('DEV_DEPENDENCIES', workspace, devDependencies)}

### end of auto-generated helpers ###

${buildFileParts[1]}
    `;

  process.stdout.write(`${output}`);
  process.exit(0);
});
