import dataModelReducer from './dataModelReducer';
import { initialState } from './dataModelReducer';

const parsedTypeDefsMock = {
  types: [
    {
      description: undefined,
      directives: [],
      fields: [
        {
          arguments: [],
          description: undefined,
          directives: [],
          location: { column: 21, line: 1 },
          name: 'name',
          id: 'name',
          nonNull: false,
          type: { list: false, name: 'String', nonNull: false },
        },
        {
          arguments: [],
          description: undefined,
          directives: [],
          location: { column: 33, line: 1 },
          name: 'job',
          id: 'job',
          nonNull: false,
          type: { list: false, name: 'Job', nonNull: false },
        },
      ],
      interfaces: [],
      location: { column: 37, line: 1 },
      name: 'Person',
    },
    {
      description: undefined,
      directives: [],
      fields: [
        {
          arguments: [],
          description: undefined,
          directives: [],
          location: { column: 56, line: 1 },
          name: 'name',
          id: 'name',
          nonNull: false,
          type: { list: false, name: 'String', nonNull: false },
        },
      ],
      interfaces: [],
      location: { column: 63, line: 1 },
      name: 'Job',
    },
  ],
};

describe('DataModel reducer', () => {
  it('should set isDirty flag', () => {
    expect(
      dataModelReducer.reducer(initialState, {
        type: dataModelReducer.actions.setIsDirty,
        payload: true,
      }).isDirty
    ).toEqual(true);
  });

  it('should parse GraphQl Schema String to TypeDefs', () => {
    const newState = dataModelReducer.reducer(initialState, {
      type: dataModelReducer.actions.parseGraphQlSchema,
      payload: `type Person { name: String job: Job } type Job { name: String } `,
    });

    expect(newState.typeDefs).toEqual(parsedTypeDefsMock);
    expect(newState.customTypesNames).toEqual(['Person', 'Job']);
  });

  it('should create new type in TypeDefs', () => {
    const newState = dataModelReducer.reducer(
      {
        ...initialState,
        typeDefs: parsedTypeDefsMock,
        customTypesNames: ['Person', 'Job'],
      },
      {
        type: dataModelReducer.actions.createTypeDefsType,
        payload: `Team`,
      }
    );

    expect(newState.typeDefs.types.length).toEqual(3);
    expect(
      newState.typeDefs.types.find((type) => type.name === 'Team')
    ).toEqual(expect.objectContaining({ name: 'Team' }));
    expect(newState.customTypesNames).toEqual(['Person', 'Job', 'Team']);
  });

  it('should update TypeDefs field', () => {
    const newState = dataModelReducer.reducer(
      {
        ...initialState,
        typeDefs: parsedTypeDefsMock,
        customTypesNames: ['Person', 'Job'],
      },
      {
        type: dataModelReducer.actions.updateTypeDefField,
        payload: {
          typeName: 'Person',
          fieldName: 'name',
          updates: {
            name: 'firstName',
          },
        },
      }
    );

    expect(
      newState.typeDefs.types.find((type) => type.name === 'Person')?.fields[0]
    ).toEqual(expect.objectContaining({ name: 'firstName' }));
    expect(newState.graphQlSchema).toContain('firstName');
  });

  it('should create new TypeDefs field', () => {
    const newState = dataModelReducer.reducer(
      {
        ...initialState,
        typeDefs: parsedTypeDefsMock,
        currentTypeName: 'Job',
        customTypesNames: ['Person', 'Job'],
      },
      {
        type: dataModelReducer.actions.createTypeDefField,
        payload: {
          name: 'test',
          id: 'random_unique_id',
        },
      }
    );

    expect(
      newState.typeDefs.types.find((type) => type.name === 'Job')?.fields.length
    ).toEqual(2);
    expect(
      newState.typeDefs.types.find((type) => type.name === 'Job')?.fields[1]
    ).toEqual(expect.objectContaining({ name: 'test' }));
    expect(newState.graphQlSchema).toContain('test');
  });

  it('should remove TypeDefs field', () => {
    let newState = dataModelReducer.reducer(
      {
        ...initialState,
        typeDefs: parsedTypeDefsMock,
        currentTypeName: 'Person',
        customTypesNames: ['Person', 'Job'],
      },
      {
        type: dataModelReducer.actions.parseGraphQlSchema,
        payload: `type Person { name: String job: Job } type Job { name: String } `,
      }
    );

    newState = dataModelReducer.reducer(newState, {
      type: dataModelReducer.actions.removeTypeDefField,
      payload: 'name',
    });

    expect(
      newState.typeDefs.types.find((type) => type.name === 'Person')?.fields
        .length
    ).toEqual(1);
    expect(
      newState.typeDefs.types.find((type) => type.name === 'Person')?.fields[0]
    ).toEqual(expect.objectContaining({ name: 'job' }));
  });

  it('should rename TypeDefs type', () => {
    let newState = dataModelReducer.reducer(
      {
        ...initialState,
        typeDefs: parsedTypeDefsMock,
        currentTypeName: 'Person',
        customTypesNames: ['Person', 'Job'],
      },
      {
        type: dataModelReducer.actions.parseGraphQlSchema,
        payload: `type Person { name: String job: Job } type Job { name: String } `,
      }
    );

    newState = dataModelReducer.reducer(newState, {
      type: dataModelReducer.actions.renameTypeDefType,
      payload: {
        oldName: 'Person',
        newName: 'User',
      },
    });

    expect(
      newState.typeDefs.types.findIndex((type) => type.name === 'User')
    ).toEqual(0);
    expect(newState.graphQlSchema).toContain('type User');
  });

  it('should clear state', () => {
    const newState = dataModelReducer.reducer(
      {
        ...initialState,
        typeDefs: parsedTypeDefsMock,
        graphQlSchema: `type Person { name: String job: Job } type Job { name: String } `,
        currentTypeName: 'Person',
        customTypesNames: ['Person', 'Job'],
      },
      {
        type: dataModelReducer.actions.clearState,
      }
    );

    expect(newState.graphQlSchema).toEqual('');
    expect(newState.isDirty).toEqual(false);
    expect(newState.hasError).toEqual(false);
    expect(newState.typeDefs).toEqual({ types: [] });
  });
});
