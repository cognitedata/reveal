import { graphQlSchemaMock } from '../__mock__/mockData';

import { GraphQLTypeDefsBuilderService } from './type-defs-builder-service';

describe('GraphQLTypeDefsBuilderService Test', () => {
  const createInstance = () => {
    return new GraphQLTypeDefsBuilderService();
  };

  it('should add new type into existing SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(graphQlSchemaMock);
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
    service.parseSchema(graphQlSchemaMock);
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
    service.parseSchema(graphQlSchemaMock);

    service.updateType('User', { name: 'UserRenamedOnce' });
    expect(service.hasType('UserRenamedOnce')).toEqual(true);

    service.updateType('UserRenamedOnce', { name: 'UserRenamedTwice' });
    expect(service.hasType('UserRenamedTwice')).toEqual(true);
    expect(service.generateSdl()).toContain('type UserRenamedTwice');
  });

  it('can update type description', () => {
    const service = createInstance();
    service.parseSchema(graphQlSchemaMock);

    service.updateType('User', { description: 'test' });
    const type = service.getType('User');

    expect(type.description).toBe('test');
    expect(service.generateSdl()).toContain('"test"\ntype User @view {');
  });

  it('can add type directive', () => {
    const service = createInstance();
    service.parseSchema(graphQlSchemaMock);

    service.updateType('Like', { directives: [{ name: 'view' }] });
    const type = service.getType('Like');

    expect(type.directives).toContainEqual({ name: 'view', arguments: [] });
    expect(service.generateSdl()).toContain('type Like @view {');
  });

  it('can remove type directive', () => {
    const service = createInstance();
    service.parseSchema(graphQlSchemaMock);

    service.updateType('User', { directives: [] });
    const type = service.getType('User');

    expect(type.directives).toEqual([]);
    expect(service.generateSdl()).toContain('type User {');
  });

  it('should add new field into SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(graphQlSchemaMock);
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
    service.parseSchema(graphQlSchemaMock);
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
    service.parseSchema(graphQlSchemaMock);
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
    service.parseSchema(graphQlSchemaMock);
    service.removeType('Post');

    expect(service.hasType('Post')).toEqual(false);
  });

  it('should remove field from SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(graphQlSchemaMock);
    service.removeField('Post', 'title');

    expect(service.hasTypeField('Post', 'title')).toEqual(false);
  });
});
