import {
  generateSchemaTypes,
  generateReactQueryComponents,
} from '@openapi-codegen/typescript';
import { defineConfig } from '@openapi-codegen/cli';

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
