import { DataModelTypeDefsType } from '@platypus/platypus-core';
import dataManagementSlice, {
  DraftRowData,
  DraftRows,
  isDraftRowDataComplete,
} from './dataManagementReducer';

const generateMockType = (fieldTypeName: string): DataModelTypeDefsType => {
  // TODO: extend later for non-primitive types
  const mockType: DataModelTypeDefsType = {
    description: undefined,
    directives: [],
    fields: [
      {
        arguments: [],
        description: undefined,
        directives: [],
        location: { column: 21, line: 1 },
        name: `field${fieldTypeName}`,
        id: `field${fieldTypeName}`,
        nonNull: false,
        type: { list: false, name: fieldTypeName, nonNull: false },
      },
      {
        arguments: [],
        description: undefined,
        directives: [],
        location: { column: 21, line: 1 },
        name: `field${fieldTypeName}Required`,
        id: `field${fieldTypeName}Required`,
        nonNull: true,
        type: { list: false, name: fieldTypeName, nonNull: true },
      },
    ],
    interfaces: [],
    location: { column: 37, line: 1 },
    name: 'Person',
  };
  return mockType;
};

const generateMockRow = (
  fieldTypeName: string,
  valueForNullable: unknown,
  valueForNonNullable: unknown
): DraftRowData => {
  // TODO: extend later for non-primitive types
  const draftRowData: DraftRowData = {
    externalId: 'd533c5e3-1e70-48fd-b666-230a2e991658',
    _draftStatus: 'Draft',
    _isDraftSelected: false,
    [`field${fieldTypeName}`]: valueForNullable,
    [`field${fieldTypeName}Required`]: valueForNonNullable,
  };
  return draftRowData;
};

const mockInitialState = {
  dataModelExternalId: null,
  selectedVersion: null,
  selectedType: {
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
      {
        arguments: [],
        description: undefined,
        directives: [],
        location: { column: 33, line: 1 },
        name: 'isAlive',
        id: 'isAlive',
        nonNull: false,
        type: { list: false, name: 'Boolean', nonNull: false },
      },
      {
        arguments: [],
        description: undefined,
        directives: [],
        location: { column: 33, line: 1 },
        name: 'age',
        id: 'age',
        nonNull: false,
        type: { list: false, name: 'Int', nonNull: false },
      },
      {
        arguments: [],
        description: undefined,
        directives: [],
        location: { column: 33, line: 1 },
        name: 'children',
        id: 'children',
        nonNull: false,
        type: { list: true, name: 'Children', nonNull: false },
      },
    ],
    interfaces: [],
    location: { column: 37, line: 1 },
    name: 'Person',
  },
  draftRows: {} as DraftRows,
  shouldShowDraftRows: true,
  shouldShowPublishedRows: true,
};

describe('DataManagement reducer', () => {
  const mockSliceInstance = dataManagementSlice.reducer(mockInitialState, {
    type: dataManagementSlice.actions.createNewDraftRow,
  });
  it('should populate null for the boolean field', () => {
    expect(mockSliceInstance.draftRows['Person'][0].isAlive).toBe(null);
  });
  it('should populate null for the string field', () => {
    expect(mockSliceInstance.draftRows['Person'][0].name).toBe(null);
  });
  it('should populate null for the custom field', () => {
    expect(mockSliceInstance.draftRows['Person'][0].job).toBe(null);
  });
  it('should use null as default value for list field', () => {
    expect(mockSliceInstance.draftRows['Person'][0].children).toEqual(null);
  });
  it('should populate null for the custom field', () => {
    expect(mockSliceInstance.draftRows['Person'][0].age).toBe(null);
  });
});

describe('isDraftRowDataComplete', () => {
  const mockArguments = [
    {
      fieldTypeName: 'String',
      valueForNullable: 'Dummy Text',
      valueForNonNullable: 'Dummy Text',
    },
    {
      fieldTypeName: 'Int',
      valueForNullable: 123,
      valueForNonNullable: 123,
      falsyValue: 0,
    },
    {
      fieldTypeName: 'Int64',
      valueForNullable: 123456,
      valueForNonNullable: 123456,
      falsyValue: 0,
    },
    {
      fieldTypeName: 'Float',
      valueForNullable: 46.78,
      valueForNonNullable: 46.78,
      falsyValue: 0.0,
    },
    {
      fieldTypeName: 'Boolean',
      valueForNullable: true,
      valueForNonNullable: true,
      falsyValue: false,
    },
  ];

  for (const arg of mockArguments) {
    it(`${arg.fieldTypeName} - providing valid type of values for nullable and non-nullable fields should return "true"`, () => {
      expect(
        isDraftRowDataComplete(
          generateMockRow(
            arg.fieldTypeName,
            arg.valueForNullable,
            arg.valueForNonNullable
          ),
          generateMockType(arg.fieldTypeName)
        )
      ).toBe(true);
    });

    it(`${arg.fieldTypeName} - providing null value for nullable field should return "true"`, () => {
      expect(
        isDraftRowDataComplete(
          generateMockRow(arg.fieldTypeName, null, arg.valueForNonNullable),
          generateMockType(arg.fieldTypeName)
        )
      ).toBe(true);
    });

    it(`${arg.fieldTypeName} - providing null value for non-nullable field should return "false"`, () => {
      expect(
        isDraftRowDataComplete(
          generateMockRow(arg.fieldTypeName, arg.valueForNullable, null),
          generateMockType(arg.fieldTypeName)
        )
      ).toBe(false);
    });

    it(`${arg.fieldTypeName} - providing undefined for nullable field should return "true"`, () => {
      expect(
        isDraftRowDataComplete(
          generateMockRow(
            arg.fieldTypeName,
            undefined,
            arg.valueForNonNullable
          ),
          generateMockType(arg.fieldTypeName)
        )
      ).toBe(true);
    });

    it(`${arg.fieldTypeName} - providing undefined for non-nullable field should return "false"`, () => {
      expect(
        isDraftRowDataComplete(
          generateMockRow(arg.fieldTypeName, arg.valueForNullable, undefined),
          generateMockType(arg.fieldTypeName)
        )
      ).toBe(false);
    });

    if (arg.falsyValue !== undefined) {
      it(`${arg.fieldTypeName} - providing valid type of values that are falsy for nullable and non-nullable fields should return "true"`, () => {
        expect(
          isDraftRowDataComplete(
            generateMockRow(arg.fieldTypeName, arg.falsyValue, arg.falsyValue),
            generateMockType(arg.fieldTypeName)
          )
        ).toBe(true);
      });
    }
  }
});
