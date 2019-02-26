const validateProjectName = require('validate-npm-package-name');
const commander = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const execSync = require('child_process').execSync;

const packageJson = require('./package.json');

const replaceTemplate = (repositoryPath, repositoryName) => {
  const configurations = fs.readdirSync(repositoryPath);
  const filesNames = configurations.filter(confName =>
    fs.lstatSync(path.join(repositoryPath, confName)).isFile()
  );
  filesNames.forEach(name => {
    const filePath = path.join(repositoryPath, name);
    const file = fs.readFileSync(filePath, 'utf8');
    const result = file.replace(/__REPOSITORY_NAME__/g, repositoryName);
    fs.writeFileSync(filePath, result, 'utf8');
  });
};

const checkAppName = appName => {
  const validationResult = validateProjectName(appName);
  if (!validationResult.validForNewPackages) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${appName}"`
      )} because of npm naming restrictions:`
    );
    process.exit(1);
  }
};

let projectName;

const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    projectName = name;
  })
  .allowUnknownOption()
  .on('--help', () => {
    console.log(`    Only ${chalk.green('<project-directory>')} is required.`)
  })
  .parse(process.argv);

if (typeof projectName === 'undefined') {
  console.error('Please specify the project directory:');
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
  );
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-react-package')}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  process.exit(1);
}

const root = path.resolve(projectName);
const appName = path.basename(root);
checkAppName(appName);

fs.ensureDirSync(appName);

const originalDirectory = process.cwd();
process.chdir(root);

const configurationPath = path.join(__dirname, `boilerplate`);
fs.copySync(configurationPath, root);
fs.moveSync(path.join(root, `package-tmp.json`), path.join(root, `package.json`));
replaceTemplate(root, appName);

execSync('git init', { stdio: 'ignore' });
execSync('git add -A', { stdio: 'ignore' });
execSync('git commit -m "Initial commit from Create React Package"', { stdio: 'ignore' });

process.chdir(originalDirectory);

console.log();
console.log(`Success! Created ${appName} at ${root}`);
console.log();
console.log('Please refer to README.md file to see more about the package');
console.log();
console.log('Happy hacking!');
