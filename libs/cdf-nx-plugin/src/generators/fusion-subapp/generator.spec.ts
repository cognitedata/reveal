import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import generator from './generator';
import { FusionSubappGeneratorSchema } from './schema';

describe('fusion-subapp generator', () => {
  let appTree: Tree;
  const options: FusionSubappGeneratorSchema = {
    name: 'test-app',
    e2eTestRunner: 'cypress',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test-app');
    const readme = appTree.read('test-app/README.md');
    expect(readme.toString()).toContain('# test-app');

    const projectJson = appTree.read('test-app/project.json');
    expect(
      JSON.parse(projectJson.toString()).targets.build.options.webpackConfig
    ).toEqual(`apps/test-app/webpack-config.js`);
    expect(config).toBeDefined();

    expect(appTree.isFile('test-app/src/set-public-path.ts')).toBeTruthy();
  });

  it('should add internationalization support', async () => {
    await generator(appTree, {
      ...options,
      internationalization: true,
    });

    expect(
      appTree.isFile('test-app/src/app/common/i18n/index.tsx')
    ).toBeTruthy();
    expect(
      appTree.isFile('test-app/src/app/common/i18n/en/test-app.json')
    ).toBeTruthy();

    const expected = `import * as en from './en/test-app.json';

    /**
     * test-app app translations
     */
    export const translations = {
      en: {'test-app': en },
    };
    `;

    const i18nIndex = appTree.read('test-app/src/app/common/i18n/index.tsx');

    expect(i18nIndex.toString().replace(/\s/gm, '')).toEqual(
      expected.replace(/\s/gm, '')
    );
  });
});
