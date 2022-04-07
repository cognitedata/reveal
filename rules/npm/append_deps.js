const fs = require('fs');

const outputPath = process.argv[2];
const packagePath = process.argv[3];
const dependenciesPackagePath = process.argv[4];
const devDependenciesPackagePath = process.argv[5];

const readPackage = (fileName) => {
  const contents = fs.readFileSync(fileName);
  return JSON.parse(contents);
};

const getPackageAlias = (filename) => {
  let { name, version } = readPackage(filename);
  if (!filename.includes('/node_modules/')) {
    return { name, version };
  }

  let fileSplit = filename.split('/');
  fileSplit = fileSplit.slice(fileSplit.indexOf('node_modules') + 1);
  fileSplit = fileSplit.slice(0, fileSplit.length - 1);
  const localPackageName = fileSplit.join('/');

  if (localPackageName !== name) {
    name = localPackageName;
    version = `npm:${name}@${version}`;
  }
  return { name, version };
};

const package = readPackage(packagePath);
if (dependenciesPackagePath) {
  package.dependencies = dependenciesPackagePath
    .split(',')
    .reduce((dependencies, depPath) => {
      const { name, version } = getPackageAlias(depPath);
      // do not append dependency if corresponding peerDependency exists
      if ((package.peerDependencies || {})[name]) {
        return dependencies;
      }
      return {
        ...dependencies,
        [name]: version,
      };
    }, {});
}
if (devDependenciesPackagePath) {
  package.devDependencies = devDependenciesPackagePath
    .split(',')
    .reduce((dependencies, depPath) => {
      const { name, version } = readPackage(depPath);
      return {
        ...dependencies,
        [name]: version,
      };
    }, {});
}

fs.writeFile(outputPath, JSON.stringify(package, null, 2), (err) => {
  if (err) {
    throw err;
  }
  process.stderr.write('File is created successfully.');
  process.exit(0);
});
