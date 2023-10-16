/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { DataModelTypeDefsField } from '@platypus/platypus-core';

import { graphQlSchemaMock } from '../__mock__/mockData';

import { TypeDefsParserService } from './type-defs-parser-service';

describe('TypeDefsParserServiceTest', () => {
  const createInstance = () => {
    return new TypeDefsParserService();
  };
  it('should parse graphql schema into SolutionDataModel', () => {
    const service = createInstance();
    const result = service.parseSchema(graphQlSchemaMock);

    // just make sure that there is a result
    // the rest of it is tested in the data mapper
    expect(result.types).toBeTruthy();
    const postType = result.types.find((type) => type.name === 'Post');
    expect(postType).toBeTruthy();
    expect(postType?.name).toEqual('Post');
    expect(postType?.directives?.length).toEqual(1);
    expect(postType?.directives![0].name).toEqual('view');

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
    expect(authorType!.isReadOnly).toEqual(false);
    expect(authorType?.interfaces).toEqual(['UserType']);

    const addressField = authorType?.fields.find(
      (field) => field.name === 'address'
    ) as DataModelTypeDefsField;
    expect(addressField).toBeTruthy();
    expect(addressField?.directives![0].name).toEqual('relation');

    const userType = result.types.find((type) => type.name === 'UserType');
    expect(authorType).toBeTruthy();
    expect(userType!.isReadOnly).toEqual(true);
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
    expect(nameField.directives![0].name).toEqual('searchable');
    expect(nameField.arguments![0].name).toEqual('qry');
    expect(nameField.arguments![0].type.name).toEqual('String');
  });

  it('should convert SolutionDataModel into graphql schema string', () => {
    const service = createInstance();
    service.parseSchema(graphQlSchemaMock);

    const generatedGraphQlSchema = service.generateSdl();
    expect(generatedGraphQlSchema.replace(/\s/g, '')).toEqual(
      graphQlSchemaMock.replace(/\s/g, '')
    );
  });

  it('should return empty string as SDL when all types are removed', () => {
    const service = createInstance();
    expect(service.generateSdl()).toBe('');
  });
});
