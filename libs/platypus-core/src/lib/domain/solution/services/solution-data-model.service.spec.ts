import { IGraphQlUtilsService } from '../boundaries';
import { SolutionDataModelService } from './solution-data-model.service';

const schemaMock = `
type Person @template {
  id: ID!
  name: String!
  posts: [Post!]
}

type Post {
  id: ID!
  body: String!
  author: Person!
}
`;
const solutionDataModelMock = {
  types: [
    {
      name: 'Person',
      fields: [
        {
          name: 'id',
          type: {
            name: 'ID',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
        {
          name: 'name',
          type: {
            name: 'String',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
        {
          name: 'posts',
          type: {
            name: 'Post',
            list: true,
            nonNull: true,
          },
          nonNull: true,
        },
      ],
    },
    {
      name: 'Post',
      fields: [
        {
          name: 'id',
          type: {
            name: 'ID',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
        {
          name: 'body',
          type: {
            name: 'String',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
        {
          name: 'author',
          type: {
            name: 'Person',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
      ],
    },
    {
      name: 'Comment',
      fields: [
        {
          name: 'id',
          type: {
            name: 'ID',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
        {
          name: 'post',
          type: {
            name: 'Post',
            list: false,
            nonNull: false,
          },
          nonNull: true,
        },
      ],
    },
  ],
};
describe('SolutionsHandlerTest', () => {
  const graphqlUtilsMock = {
    addField: jest.fn().mockImplementation((type, name, params) => ({
      name: params.name,
      type: params.type,
    })),
    addType: jest.fn().mockImplementation((name) => {
      return {
        name,
      };
    }),
    generateSdl: jest.fn().mockImplementation(() => schemaMock),
    parseSchema: jest.fn().mockImplementation(() => solutionDataModelMock),
    removeField: jest.fn(),
    removeType: jest.fn(),
    updateType: jest.fn().mockImplementation((typeName, updates) => {
      return {
        name: typeName,
        ...updates,
      };
    }),
    updateTypeField: jest.fn().mockImplementation((type, name, params) => ({
      name: params.name,
      type: params.type,
    })),
    clear: jest.fn(),
  } as IGraphQlUtilsService;

  const createInstance = () => {
    return new SolutionDataModelService(graphqlUtilsMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should parse schema', () => {
    const service = createInstance();
    service.parseSchema('');
    expect(graphqlUtilsMock.parseSchema).toBeCalled();
  });

  it('should convert solution data model to sdl', () => {
    const service = createInstance();
    service.buildSchemaString();
    expect(graphqlUtilsMock.generateSdl).toBeCalled();
  });

  it('should add type', () => {
    const service = createInstance();
    const newState = service.addType(solutionDataModelMock, 'Test');
    expect(newState.types.find((t) => t.name === 'Test')).toBeTruthy();
  });

  it('should remove type', () => {
    const service = createInstance();
    const newState = service.removeType(solutionDataModelMock, 'Post');
    expect(newState.types.find((t) => t.name === 'Post')).not.toBeTruthy();
    expect(
      newState.types
        .find((t) => t.name === 'Comment')
        ?.fields.find((f) => f.name === 'post')
    ).not.toBeTruthy();
    expect(newState.types.length).toBe(2);
  });

  it('should rename type', () => {
    const service = createInstance();
    const newState = service.renameType(
      solutionDataModelMock,
      'Post',
      'Article'
    );

    expect(newState.types.find((t) => t.name === 'Post')).not.toBeTruthy();
    expect(newState.types.find((t) => t.name === 'Article')).toBeTruthy();
    expect(
      newState.types
        .find((t) => t.name === 'Person')
        ?.fields.find((f) => f.name === 'posts')?.type.name === 'Article'
    ).toBeTruthy();
    expect(newState.types.length).toBe(2);
  });

  it('should add field', () => {
    const service = createInstance();
    const newState = service.addField(solutionDataModelMock, 'Person', 'test', {
      name: 'test',
      type: {
        name: 'String',
      },
    });
    const type = newState.types.find((t) => t.name === 'Person');
    const field = type?.fields.find((t) => t.name === 'test');
    expect(field).toBeTruthy();
    expect(field?.name).toEqual('test');
    expect(field?.type.name).toEqual('String');
  });

  it('should update field', () => {
    const service = createInstance();
    let newState = service.addField(solutionDataModelMock, 'Person', 'test', {
      name: 'test',
      type: {
        name: 'String',
      },
    });

    newState = service.updateField(newState, 'Person', 'test', {
      name: 'newName',
      type: {
        name: 'Int',
      },
    });
    const type = newState.types.find((t) => t.name === 'Person');
    const field = type?.fields.find((t) => t.name === 'newName');
    expect(field).toBeTruthy();
    expect(field?.type.name).toEqual('Int');
  });

  it('should remove field', () => {
    const service = createInstance();
    const newState = service.removeField(solutionDataModelMock, 'Person', 'id');
    const type = newState.types.find((t) => t.name === 'Person');
    const field = type?.fields.find((t) => t.name === 'id');
    expect(field).not.toBeTruthy();
  });
});
