import { GraphQlSchemaValidator } from './graphql-schema-validator';
describe('GraphQlSchemaValidator Test', () => {
  const createInstance = () => {
    return new GraphQlSchemaValidator();
  };

  describe('GraphQl schema validation test', () => {
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
      expect(result.valid).toEqual(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate empty schema', () => {
      const service = createInstance();

      const result = service.validate('');
      expect(result.valid).toEqual(false);
      expect(result.errors[0].message).toEqual(
        'Your Data Model Schema is empty'
      );
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

      expect(result.errors).toMatchObject([
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

      expect(result.errors).toMatchObject([
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
      expect(result.errors).toMatchObject([
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
      expect(result.errors).toMatchObject([
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

      expect(result.errors).toMatchObject([
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

      expect(result.errors).toMatchObject([
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

      expect(result.errors).toMatchObject([
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

      const result = service.validate(schemaWithInvalidViewDirective);

      expect(result.errors).toMatchObject([
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

      const result = service.validate(schemaWithInvalidViewDirective);

      expect(result.errors).toMatchObject([
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

      expect(result.errors).toMatchObject([
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
      expect(result.errors[0]).toMatchObject({
        errorMessage: 'Type D must implement A because it is implemented by C.',
      });
    });
    it('should validate type name for pascal case', () => {
      const service = createInstance();

      const schemaWithUnimplementedInterface = `type movie {
        name: String
      }`;
      const result = service.validate(schemaWithUnimplementedInterface);

      expect(result.errors).toMatchObject([
        {
          message: 'Type name "movie" must be PascalCase',
          status: 400,
          errorMessage: 'Type name "movie" must be PascalCase',
        },
      ]);
    });
  });
});
