import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  Tree,
  updateJson,
} from '@nrwl/devkit';
import { Linter } from '@nrwl/linter';
import { applicationGenerator } from '@nrwl/react';
import { FusionSubappGeneratorSchema } from './schema';

function generateCustomFiles(
  tree: Tree,
  options: FusionSubappGeneratorSchema,
  projectRoot: string,
  sourceDirctory: string
) {
  generateFiles(
    tree, // the virtual file system
    joinPathFragments(__dirname, sourceDirctory), // path to the file templates)
    projectRoot, // destination path of the files
    {
      ...options,
      name: names(options.name).className,
      tmpl: '',
      template: '',
      projectName: options.name,
    } // config object to replace variable in file templates
  );
}

export default async function (
  tree: Tree,
  options: FusionSubappGeneratorSchema
) {
  const generatorOptions = {
    ...options,
    internationalization: options.internationalization === true,
    routing: options.routing === true,
    createMockEnvironment: options.createMockEnvironment === true,
  };
  const { appsDir } = getWorkspaceLayout(tree);
  const name = names(generatorOptions.name).fileName;
  const projectDirectory = generatorOptions.directory
    ? `${names(generatorOptions.directory).fileName}/${name}`
    : name;
  const projectRoot = joinPathFragments(appsDir, projectDirectory);

  // run the original generator
  await applicationGenerator(tree, {
    ...generatorOptions,
    standaloneConfig: true,
    style: 'styled-components',
    e2eTestRunner: generatorOptions.e2eTestRunner || 'cypress',
    linter: Linter.EsLint,
    unitTestRunner: 'jest',
    pascalCaseFiles: true,
  });

  // Add own custom files
  generateCustomFiles(tree, generatorOptions, projectRoot, './files');

  // Add features files
  if (generatorOptions.internationalization) {
    generateCustomFiles(
      tree,
      generatorOptions,
      projectRoot,
      './features-files/internationalization'
    );
  }

  if (generatorOptions.routing) {
    generateCustomFiles(
      tree,
      generatorOptions,
      projectRoot,
      './features-files/routing'
    );
  }

  if (generatorOptions.createMockEnvironment) {
    generateCustomFiles(
      tree,
      generatorOptions,
      projectRoot,
      './features-files/mock-env'
    );
  }

  // We are using 'package.json' instead (browser list collides with that file)
  if (tree.exists(`apps/${name}/.browserslistrc`)) {
    tree.delete(`apps/${name}/.browserslistrc`);
  }

  const projectJsonPath = tree.exists(`apps/${name}/project.json`)
    ? `apps/${name}/project.json`
    : `${name}/project.json`;
  updateJson(tree, projectJsonPath, (pkgJson) => {
    // use our custom webpack config
    pkgJson.targets.build.options.webpackConfig = `apps/${name}/webpack-config.js`;

    // the default is true, but that crashes the signla spa setup in fusion
    pkgJson.targets.build.configurations.development['vendorChunk'] = false;

    if (options.createMockEnvironment) {
      pkgJson.targets.build.configurations['mock'] = {
        fileReplacements: [
          {
            replace: `apps/${name}/src/environments/environment.ts`,
            with: `apps/${name}/src/environments/mock/environment.mock.ts`,
          },
          {
            replace: `apps/${name}/src/AppWrapper.tsx`,
            with: `apps/${name}/src/environments/mock/AppWrapper.tsx`,
          },
          {
            replace: `apps/${name}/src/cogniteSdk.ts`,
            with: `apps/${name}/src/environments/mock/cogniteSdk.ts`,
          },
        ],
        optimization: false,
        outputHashing: 'all',
        sourceMap: true,
        extractCss: false,
        namedChunks: false,
        extractLicenses: false,
        vendorChunk: false,
      };

      pkgJson.targets.serve.configurations['mock'] = {
        buildTarget: `${name}:build:mock`,
        hmr: true,
        port: 3001,
        ssl: true,
        proxyConfig: `apps/${name}/proxy.conf.json`,
      };
    }

    return pkgJson;
  });

  await formatFiles(tree);
}
