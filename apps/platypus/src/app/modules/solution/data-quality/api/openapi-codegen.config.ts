import { defineConfig } from '@openapi-codegen/cli';
import {
  generateSchemaTypes,
  generateReactQueryComponents,
} from '@openapi-codegen/typescript';

export default defineConfig({
  DataQuality: {
    from: {
      relativePath: './dataquality.yml',
      source: 'file',
    },
    outputDir: 'codegen',
    to: async (context) => {
      const filenamePrefix = 'DataQuality';

      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix,
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles,
      });
    },
  },
});
