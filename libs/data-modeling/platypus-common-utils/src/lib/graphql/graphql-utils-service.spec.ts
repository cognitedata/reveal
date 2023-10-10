import { DataModelTypeDefsField } from '@platypus/platypus-core';

import { GraphQlUtilsService } from './graphql-utils-service';

const schemaMock = `
type Post @view {
  id: Int!
  title: String!
  views: Int!
  user: User
  tags: [String]
  metadata: PostMetadata
  colors: [PostColor]
  comments: [Comment]
}
type User @view {
  id: Int!
  name: String!
}
type Comment @view {
  id: Int!
  body: String!
  date: Int!
  post: Post
}
type PostMetadata {
  slug: String
}
interface PostColor {
  name: String
}
type Like {
  id: Int
  user: User
  comment: Comment
}

interface UserType @view(version: "1", space: "Blog") @import {
  name: String!
}

type AuthorAddress {
  street: String
}

interface Author implements UserType {
	name: String!
  contact: String
  address: [AuthorAddress] @relation(edgeSource: "AuthorAddress")
}
`;

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
    expect(postType?.directives[0].name).toEqual('view');

    const idField = postType?.fields.find(
      (field) => field.name === 'id'
    ) as DataModelTypeDefsField;

    expect(idField).toEqual(
      expect.objectContaining({
        name: 'id',
        description: undefined,
        type: { name: 'Int', list: false, nonNull: true, custom: false },
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
        type: { name: 'Comment', list: true, nonNull: false, custom: true },
        nonNull: false,
      })
    );

    const authorType = result.types.find((type) => type.name === 'Author');
    expect(authorType).toBeTruthy();
    expect(authorType?.kind).toEqual('interface');
    expect(authorType.isReadOnly).toEqual(false);
    expect(authorType?.interfaces).toEqual(['UserType']);

    const addressField = authorType?.fields.find(
      (field) => field.name === 'address'
    ) as DataModelTypeDefsField;
    expect(addressField).toBeTruthy();
    expect(addressField?.directives[0].name).toEqual('relation');

    const userType = result.types.find((type) => type.name === 'UserType');
    expect(authorType).toBeTruthy();
    expect(userType.isReadOnly).toEqual(true);
  });

  it('should parse empty graphql schema into SolutionDataModel', () => {
    const service = createInstance();
    const result = service.parseSchema('');
    expect(result).toEqual({ types: [] });
  });

  it('should convert DataModelTypeDefsField and map directives and args', () => {
    const service = createInstance();
    const customMockSchema = `type Post {
      name(qry: String): String @searchable
    }`;
    const parsedSchema = service.parseSchema(customMockSchema);

    const nameField = parsedSchema.types[0].fields[0];
    expect(nameField.name).toEqual('name');
    expect(nameField.directives[0].name).toEqual('searchable');
    expect(nameField.arguments[0].name).toEqual('qry');
    expect(nameField.arguments[0].type.name).toEqual('String');
  });

  it('should convert SolutionDataModel into graphql schema string', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);

    const generatedGraphQlSchema = service.generateSdl();
    expect(generatedGraphQlSchema.replace(/\s/g, '')).toEqual(
      schemaMock.replace(/\s/g, '')
    );
  });

  it('should add new type into existing SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    const newType = service.addType('Test', 'type');
    expect(newType).toEqual(
      expect.objectContaining({
        name: 'Test',
        fields: [],
      })
    );
  });

  it('should add new interface into existing SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    const newType = service.addType('Test', 'interface');
    expect(newType).toEqual(
      expect.objectContaining({
        name: 'Test',
        fields: [],
      })
    );

    expect(service.generateSdl()).toContain('interface Test');
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
    expect(service.generateSdl()).toContain('"test"\ntype User @view {');
  });

  it('can add type directive', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);

    service.updateType('Like', { directives: [{ name: 'view' }] });
    const type = service.getType('Like');

    expect(type.directives).toContainEqual({ name: 'view', arguments: [] });
    expect(service.generateSdl()).toContain('type Like @view {');
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
        type: { name: 'String', list: false, nonNull: false, custom: false },
        nonNull: false,
      })
    );
  });

  it('should add new field into a inteface type', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    const newField = service.addField('PostColor', 'test', {
      name: 'test',
      type: { name: 'String' },
    });

    expect(service.hasTypeField('PostColor', 'test')).toEqual(true);
    expect(newField).toEqual(
      expect.objectContaining({
        name: 'test',
        description: undefined,
        type: { name: 'String', list: false, nonNull: false, custom: false },
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
        type: { list: false, name: 'String', nonNull: true, custom: false },
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
        type: { list: false, name: 'Int', nonNull: true, custom: false },
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
    service.addType('Person', 'type');
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
      const result = service.validate(validSchema);
      expect(result).toEqual([]);
    });

    it('should validate empty schema', () => {
      const service = createInstance();

      const result = service.validate('');
      expect(result.length).toEqual(1);
      expect(result[0].message).toEqual('Your Data Model Schema is empty');
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
      const result = service.validate(schemaWithSyntaxError);

      expect(result).toMatchObject([
        {
          message: 'Syntax Error: Unexpected Name "name".',
          status: 400,
          errorMessage: 'Syntax Error: Unexpected Name "name".',
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
      const result = service.validate(schemaWithInvalidField);

      expect(result).toMatchObject([
        {
          message: 'Syntax Error: Expected ":", found Name "String".',
          status: 400,
          errorMessage: 'Syntax Error: Expected ":", found Name "String".',
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
      const result = service.validate(schemaWithInvalidScalar);
      expect(result).toMatchObject([
        {
          message: 'Unknown type "Strings". Did you mean "String"?',
          status: 400,
          errorMessage: 'Unknown type "Strings". Did you mean "String"?',
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
      const result = service.validate(schemaWithUndefinedType);
      expect(result).toMatchObject([
        {
          message: 'Unknown type "User".',
          status: 400,
          errorMessage: 'Unknown type "User".',
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
      const result = service.validate(schemaWithDuplicateField);

      expect(result).toMatchObject([
        {
          message: 'Field "Post.author" can only be defined once.',
          status: 400,
          errorMessage: 'Field "Post.author" can only be defined once.',
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
      const result = service.validate(schemaWithDuplicateType);

      expect(result).toMatchObject([
        {
          message: 'There can be only one type named "Post".',
          status: 400,
          errorMessage: 'There can be only one type named "Post".',
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
      const result = service.validate(schemaWithUnsupportedFeatures);

      expect(result).toMatchObject([
        {
          message: 'Input type definitions are not supported.',
          status: 400,
          errorMessage: 'Input type definitions are not supported.',
        },
        {
          message: 'Enums are not supported.',
          status: 400,
          errorMessage: 'Enums are not supported.',
        },
        {
          message:
            'Field "appearsIn" should be a required type if the list element type is required. For example, the valid cases are "[Episode]" and "[Episode!]!"',
          status: 400,
          errorMessage:
            'Field "appearsIn" should be a required type if the list element type is required. For example, the valid cases are "[Episode]" and "[Episode!]!"',
        },
        {
          message: 'Type extensions are not supported.',
          status: 400,
          errorMessage: 'Type extensions are not supported.',
        },
        {
          message: 'Unions are not supported.',
          status: 400,
          errorMessage: 'Unions are not supported.',
        },
      ]);
    });

    it('validates @view directive for objects when extended SDL validation is enabled', () => {
      const service = createInstance();

      const schemaWithInvalidViewDirective = `
      type Employee @view(space: false, version: false){
        name: String
      }
      `;

      const result = service.validate(
        schemaWithInvalidViewDirective,

        { useExtendedSdl: true }
      );

      expect(result).toMatchObject([
        {
          message: 'String cannot represent a non string value: false',
          status: 400,
          errorMessage: 'String cannot represent a non string value: false',
          typeName: undefined,
          fieldName: undefined,
        },
        {
          message: 'String cannot represent a non string value: false',
          status: 400,
          errorMessage: 'String cannot represent a non string value: false',
          typeName: undefined,
          fieldName: undefined,
        },
      ]);
    });

    it('validates @view directive for interfaces when extended SDL validation is enabled', () => {
      const service = createInstance();

      const schemaWithInvalidViewDirective = `
      interface Person @view(space: false, version: false){
        name: String
      }
      `;

      const result = service.validate(
        schemaWithInvalidViewDirective,

        { useExtendedSdl: true }
      );

      expect(result).toMatchObject([
        {
          message: 'String cannot represent a non string value: false',
          status: 400,
          errorMessage: 'String cannot represent a non string value: false',
          typeName: undefined,
          fieldName: undefined,
        },
        {
          message: 'String cannot represent a non string value: false',
          status: 400,
          errorMessage: 'String cannot represent a non string value: false',
          typeName: undefined,
          fieldName: undefined,
        },
      ]);
    });

    it('should validate unimplemented interface types', () => {
      const service = createInstance();

      const schemaWithUnimplementedInterface = `interface Describable {
        name: String
        description: String
      }

      interface Assignable {
        assignedTo: String
      }

      type Person implements Describable & Assignable {
        id: ID!
        name: String!

      }`;
      const result = service.validate(schemaWithUnimplementedInterface);

      expect(result).toMatchObject([
        {
          message:
            'Interface field Describable.description expected but Person does not provide it.',
          status: 400,
          errorMessage:
            'Interface field Describable.description expected but Person does not provide it.',
        },
        {
          message:
            'Interface field Assignable.assignedTo expected but Person does not provide it.',
          status: 400,
          errorMessage:
            'Interface field Assignable.assignedTo expected but Person does not provide it.',
        },
      ]);
    });
    it('should validate transitive interfaces', () => {
      const service = createInstance();

      const schema = `interface A {
        a: String
    }
    
    interface B {
        b: String
    }
    
    interface C implements A & B {
        a: String
        b: String
        c: String
    }
    
    type D implements C {
        a: String
        b: String
        c: String
    }`;
      const result = service.validate(schema);
      expect(result[0]).toMatchObject({
        errorMessage: 'Type D must implement A because it is implemented by C.',
      });
    });
    it('should validate type name for pascal case', () => {
      const service = createInstance();

      const schemaWithUnimplementedInterface = `type movie {
        name: String
      }`;
      const result = service.validate(schemaWithUnimplementedInterface);

      expect(result).toMatchObject([
        {
          message: 'Type name "movie" must be PascalCase',
          status: 400,
          errorMessage: 'Type name "movie" must be PascalCase',
        },
      ]);
    });
  });
});
