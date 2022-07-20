import { GraphQlUtilsService } from './graphql-utils-service';
import { postsGraphQlSchema } from '@platypus/mock-data';
import {
  DataModelTypeDefsField,
  mixerApiBuiltInTypes,
} from '@platypus/platypus-core';

const schemaMock = postsGraphQlSchema;

describe('GraphQlUtilsServiceTest', () => {
  const createInstance = () => {
    return new GraphQlUtilsService();
  };
  it('should parse graphql schema into SolutionDataModel', () => {
    const service = createInstance();
    const result = service.parseSchema(schemaMock);

    // just make sure that there is a result
    // the rest of it is tested in the data mapper
    expect(result.types).toBeTruthy();
    const postType = result.types.find((type) => type.name === 'Post');
    expect(postType).toBeTruthy();
    expect(postType?.name).toEqual('Post');
    expect(postType?.directives?.length).toEqual(1);
    expect(postType?.directives![0].name).toEqual('template');

    const idField = postType?.fields.find(
      (field) => field.name === 'id'
    ) as DataModelTypeDefsField;

    expect(idField).toEqual(
      expect.objectContaining({
        name: 'id',
        description: undefined,
        type: { name: 'Int', list: false, nonNull: true },
        nonNull: true,
      })
    );

    const commentsField = postType?.fields.find(
      (field) => field.name === 'comments'
    ) as DataModelTypeDefsField;

    expect(commentsField).toEqual(
      expect.objectContaining({
        name: 'comments',
        description: undefined,
        type: { name: 'Comment', list: true, nonNull: false },
        nonNull: false,
      })
    );
  });

  it('should convert DataModelTypeDefsField and map directives and args', () => {
    const service = createInstance();
    const customMockSchema = `type Post {
      name(qry: String): String @searchable
    }`;
    const parsedSchema = service.parseSchema(customMockSchema);

    const nameField = parsedSchema.types[0].fields[0];
    expect(nameField.name).toEqual('name');
    expect(nameField.directives![0].name).toEqual('searchable');
    expect(nameField.arguments![0].name).toEqual('qry');
    expect(nameField.arguments![0].type.name).toEqual('String');
  });

  it('should convert SolutionDataModel into graphql schema string', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);

    const generatedGraphQlSchema = service.generateSdl();
    expect(generatedGraphQlSchema.trim()).toEqual(schemaMock.trim());
  });

  it('should add new type into existing SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    const newType = service.addType('Test');
    expect(newType).toEqual(
      expect.objectContaining({
        name: 'Test',
        fields: [],
      })
    );
  });

  it('can rename type name twice', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);

    service.updateType('User', { name: 'UserRenamedOnce' });
    expect(service.hasType('UserRenamedOnce')).toEqual(true);

    service.updateType('UserRenamedOnce', { name: 'UserRenamedTwice' });
    expect(service.hasType('UserRenamedTwice')).toEqual(true);
    expect(service.generateSdl()).toContain('type UserRenamedTwice');
  });

  it('can update type description', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);

    service.updateType('User', { description: 'test' });
    const type = service.getType('User');

    expect(type.description).toBe('test');
    expect(service.generateSdl()).toContain('"test"\ntype User @template {');
  });

  it('can add type directive', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);

    service.updateType('Like', { directives: [{ name: 'template' }] });
    const type = service.getType('Like');

    expect(type.directives).toContainEqual({ name: 'template', arguments: [] });
    expect(service.generateSdl()).toContain('type Like @template {');
  });

  it('can remove type directive', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);

    service.updateType('User', { directives: [] });
    const type = service.getType('User');

    expect(type.directives).toEqual([]);
    expect(service.generateSdl()).toContain('type User {');
  });

  it('should add new field into SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    const newField = service.addField('Post', 'test', {
      name: 'test',
      type: { name: 'String' },
    });

    expect(service.hasTypeField('Post', 'test')).toEqual(true);
    expect(newField).toEqual(
      expect.objectContaining({
        name: 'test',
        description: undefined,
        type: { name: 'String', list: false, nonNull: false },
        nonNull: false,
      })
    );
  });

  it('should update field into SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    let newField = service.updateTypeField('Post', 'title', {
      name: 'postTitle',
      type: { name: 'String', nonNull: true },
    });

    expect(service.hasTypeField('Post', 'title')).toEqual(false);
    expect(service.hasTypeField('Post', 'postTitle')).toEqual(true);
    expect(newField).toEqual(
      expect.objectContaining({
        name: 'postTitle',
        nonNull: true,
        type: { list: false, name: 'String', nonNull: true },
      })
    );

    newField = service.updateTypeField('Post', 'postTitle', {
      type: 'Int!',
    });

    expect(newField).toEqual(
      expect.objectContaining({
        description: undefined,
        name: 'postTitle',
        nonNull: true,
        type: { list: false, name: 'Int', nonNull: true },
      })
    );
  });

  it('should remove type from SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    service.removeType('Post');

    expect(service.hasType('Post')).toEqual(false);
  });

  it('should remove field from SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    service.removeField('Post', 'title');

    expect(service.hasTypeField('Post', 'title')).toEqual(false);
  });

  it('should return empty string as SDL when all types are removed', () => {
    const service = createInstance();
    service.addType('Person');
    service.removeType('Person');
    expect(service.generateSdl()).toBe('');
  });

  describe('GraphQlUtilsService GraphQl schema validation test', () => {
    it('should validate valid schema', () => {
      const service = createInstance();

      const validSchema = `type Post {
        name: String
        author: Author
      }

      type Author {
        name: String
      }`;
      const result = service.validate(validSchema, mixerApiBuiltInTypes);
      expect(result).toEqual([]);
    });

    it('should validate syntax errors', () => {
      const service = createInstance();
      const schemaWithSyntaxError = `type Post
      name: String
      author: Author
    }

    type Author {
      name: String
    }`;
      const result = service.validate(
        schemaWithSyntaxError,
        mixerApiBuiltInTypes
      );
      expect(result).toEqual([
        {
          message: 'Syntax Error: Unexpected Name "name".',
          status: 400,
          errorMessage: 'Syntax Error: Unexpected Name "name".',
          locations: [
            {
              column: 7,
              line: 2,
            },
          ],
        },
      ]);
    });

    it('should validate invalid fields', () => {
      const service = createInstance();
      const schemaWithInvalidField = `type Post {
        name String
        author: Author
      }

      type Author {
        name: String
      }`;
      const result = service.validate(
        schemaWithInvalidField,
        mixerApiBuiltInTypes
      );

      expect(result).toEqual([
        {
          message: 'Syntax Error: Expected ":", found Name "String".',
          status: 400,
          errorMessage: 'Syntax Error: Expected ":", found Name "String".',
          locations: [
            {
              line: 2,
              column: 14,
            },
          ],
        },
      ]);
    });

    it('should validate invalid scalars', () => {
      const service = createInstance();

      const schemaWithInvalidScalar = `type Post {
        name: Strings
        author: Author
      }

      type Author {
        name: String
      }`;
      const result = service.validate(
        schemaWithInvalidScalar,
        mixerApiBuiltInTypes
      );
      expect(result).toEqual([
        {
          message: 'Unknown type "Strings". Did you mean "String"?',
          status: 400,
          errorMessage: 'Unknown type "Strings". Did you mean "String"?',
          locations: [
            {
              column: 15,
              line: 2,
            },
          ],
        },
      ]);
    });

    it('should validate undefined types', () => {
      const service = createInstance();

      const schemaWithUndefinedType = `type Post {
        name: String
        author: User
      }

      type Author {
        name: String
      }`;
      const result = service.validate(
        schemaWithUndefinedType,
        mixerApiBuiltInTypes
      );
      expect(result).toEqual([
        {
          message: 'Unknown type "User".',
          status: 400,
          errorMessage: 'Unknown type "User".',
          locations: [
            {
              column: 17,
              line: 3,
            },
          ],
        },
      ]);
    });

    it('should validate duplicate fields', () => {
      const service = createInstance();

      const schemaWithDuplicateField = `type Post {
        name: String
        author: Author
        author: Author
      }

      type Author {
        name: String
      }`;
      const result = service.validate(
        schemaWithDuplicateField,
        mixerApiBuiltInTypes
      );

      expect(result).toEqual([
        {
          message: 'Field "Post.author" can only be defined once.',
          status: 400,
          errorMessage: 'Field "Post.author" can only be defined once.',
          locations: [
            {
              column: 9,
              line: 3,
            },
            {
              column: 9,
              line: 4,
            },
          ],
        },
      ]);
    });

    it('should validate duplicate types', () => {
      const service = createInstance();
      const schemaWithDuplicateType = `type Post {
        name: String
      }

      type Post {
        title: String
      }`;
      const result = service.validate(
        schemaWithDuplicateType,
        mixerApiBuiltInTypes
      );

      expect(result).toEqual([
        {
          message: 'There can be only one type named "Post".',
          status: 400,
          errorMessage: 'There can be only one type named "Post".',
          locations: [
            {
              column: 6,
              line: 1,
            },
            {
              column: 12,
              line: 5,
            },
          ],
        },
      ]);
    });

    it('should validate unsupported features', () => {
      const service = createInstance();

      const schemaWithUnsupportedFeatures = `input ReviewInput {
        stars: Int!
        commentary: String
      }

      enum Episode {
        NEWHOPE
        EMPIRE
        JEDI
      }

      interface Character {
        id: ID!
        name: String!
        friends: [Character]
        appearsIn: [Episode]!
      }

      type Human {
        name: String!
      }

      extend type Human {
        gender: String
      }

      type User {
        name: String
        jobs: [Job]
      }

      type Job {
        name: String
      }

      union Superman = Human | User
      `;
      const result = service.validate(
        schemaWithUnsupportedFeatures,
        mixerApiBuiltInTypes
      );

      expect(result).toEqual([
        {
          message: 'Input type defenitions are not supported.',
          status: 400,
          errorMessage: 'Input type defenitions are not supported.',
          locations: [
            {
              line: 1,
              column: 1,
            },
          ],
        },
        {
          message: 'Enums are not supported.',
          status: 400,
          errorMessage: 'Enums are not supported.',
          locations: [
            {
              line: 6,
              column: 7,
            },
          ],
        },
        {
          message: 'Interfaces are not supported.',
          status: 400,
          errorMessage: 'Interfaces are not supported.',
          locations: [
            {
              line: 12,
              column: 7,
            },
          ],
        },
        {
          message: 'Type extensions are not supported.',
          status: 400,
          errorMessage: 'Type extensions are not supported.',
          locations: [
            {
              line: 23,
              column: 7,
            },
          ],
        },
        {
          message: 'Unions are not supported.',
          status: 400,
          errorMessage: 'Unions are not supported.',
          locations: [
            {
              line: 36,
              column: 7,
            },
          ],
        },
      ]);
    });
  });
});
