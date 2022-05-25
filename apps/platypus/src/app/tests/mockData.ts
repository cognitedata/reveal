import { DataModel, DataModelVersion } from '@platypus/platypus-core';

export const mockSolutions = [
  {
    id: '1',
    name: 'BestDay',
    description: 'This is an very good app',
    createdTime: 1636107405779,
    updatedTime: 1636107405779,
    owners: ['Ola Nordmann'],
    version: '1.2',
  },
] as DataModel[];

export const mockSchemas = [
  {
    externalId: '123',
    status: 'PUBLISHED',
    version: '13',
    schema:
      'type Person @template {\n  firstName: String\n  lastName: String\n  email: String\n  age: Long\n}\n\ntype Product @template {\n  name: String\n  price: Float\n  image: String\n  description: String\n}\n\ntype Category @template {\n  name: String\n  products: [Product]\n}\n',
    createdTime: 1638891917037,
    lastUpdatedTime: 1638891917037,
  },
] as DataModelVersion[];
