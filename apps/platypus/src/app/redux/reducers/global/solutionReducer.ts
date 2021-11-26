/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Schema, Solution } from '@platypus/platypus-core';

const mockSchemaString = `type Person @template {
  firstName: String
  lastName: String
  email: String
  age: Long
}

type Product @template {
  name: String
  price: Float
  image: String
  description: String
  category: Product
}

type Category @template {
  name: String
  products: [Product]
}`;

const solutionStateSlice = createSlice({
  name: 'solution',
  initialState: {
    solution: {
      id: '500',
      name: 'Mocked Solution',
      description: 'This template group is used for development.',
      createdTime: 1637752126628,
      updatedTime: 1637752126628,
      owners: ['denis@diigts.no'],
      version: '3',
    } as Solution,
    selectedSchema: {
      version: '3',
      schemaString: mockSchemaString,
      createdTime: 1637752126628,
      updatedTime: 1637752126628,
    } as Schema,
    schemas: [
      {
        version: '3',
        schemaString: mockSchemaString,
        createdTime: 1637752126628,
        updatedTime: 1637752126628,
      },
      {
        version: '2',
        schemaString: mockSchemaString,
        createdTime: 1637752126628,
        updatedTime: 1637752126628,
      },
      {
        version: '1',
        schemaString: mockSchemaString,
        createdTime: 1637752126628,
        updatedTime: 1637752126628,
      },
    ] as Schema[],
  },
  reducers: {
    selectVersion: (state, action: PayloadAction<{ version: string }>) => {
      state.selectedSchema = Object.assign(
        state.selectedSchema,
        state.schemas.find(
          (schema) => schema.version === action.payload.version
        )
      );
    },
  },
});

export type SolutionState = ReturnType<typeof solutionStateSlice.reducer>;
export const { actions } = solutionStateSlice;
export default solutionStateSlice;
