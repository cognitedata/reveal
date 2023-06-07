import { bestDayTemplateMockData } from './bestday-template-group';
import { newSchemaTemplateGroup } from './new-schema-template-group';
import { postsTemplateGroup } from './posts-template-group';
import { schemaVersionsTestMockData } from './schemaVersionsTest';

export { postsGraphQlSchema } from './posts-template-group';

export const templatesMockData = [
  postsTemplateGroup,
  bestDayTemplateMockData,
  newSchemaTemplateGroup,
  ...schemaVersionsTestMockData,
];
