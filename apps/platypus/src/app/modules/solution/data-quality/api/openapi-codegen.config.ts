import { defineConfig } from '@openapi-codegen/cli';
import {
  generateSchemaTypes,
  generateReactQueryComponents,
  forceReactQueryComponent,
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

      context.openAPIDocument = forceReactQueryComponent({
        openAPIDocument: context.openAPIDocument,
        component: 'useQuery',
        operationId: 'listByIdsRulesets',
      });

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
