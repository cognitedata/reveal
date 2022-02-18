export const schemaVersionsTestMockData = [
  {
    version: 13,
    schema:
      'type Person @template {\n  firstName: String\n  lastName: String\n  email: String\n  age: Long\n}\n\ntype Product @template {\n  name: String\n  price: Float\n  image: String\n  description: String\n}\n\ntype Category @template {\n  name: String\n  products: [Product]\n}\n',
    createdTime: 1638891917037,
    lastUpdatedTime: 1638891917037,
    templategroups_id: 'schema-versions-test',
  },
  {
    version: 12,
    schema:
      'type Person @template {\n  firstName: String\n  lastName: String\n  email: String\n  age: Long\n}\n\ntype Product @template {\n  name: String\n  price: Float\n  image: String\n  description: String\n}\n\ntype Category @template {\n  name: String\n  products: [Product]\n}\n',
    createdTime: 1638889081775,
    lastUpdatedTime: 1638889081775,
    templategroups_id: 'schema-versions-test',
  },
];
