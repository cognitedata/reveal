const fs = require('fs');

function copyPackage(version) {
  const jsonString = fs.readFileSync('./package.json', 'utf8')
  const json = JSON.parse(jsonString);

  if(version) {
    // updating version
    json.version = version;
    fs.writeFileSync('./package.json', JSON.stringify(json, null, 2));
  }
  delete json.private;
  delete json.scripts.publishscript;
  delete json.scripts.prepublishscript;
  delete json.scripts.postpublishscript;
  fs.writeFileSync('./dist/package.json', JSON.stringify(json, null, 2));
}

if(process.argv[2]) {
  copyPackage(process.argv[2]);
} else {
  copyPackage(undefined);
}