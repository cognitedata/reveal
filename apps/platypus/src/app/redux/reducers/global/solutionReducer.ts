/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SolutionSchema,
  Solution,
  SolutionSchemaStatus,
} from '@platypus/platypus-core';

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
      status: SolutionSchemaStatus.PUBLISHED,
      schema: mockSchemaString,
      createdTime: 1637752126628,
      lastUpdatedTime: 1637752126628,
    } as SolutionSchema,
    schemas: [
      {
        version: '3',
        schema: mockSchemaString,
        status: SolutionSchemaStatus.PUBLISHED,
        createdTime: 1637752126628,
        lastUpdatedTime: 1637752126628,
      },
      {
        version: '2',
        schema: mockSchemaString,
        status: SolutionSchemaStatus.PUBLISHED,
        createdTime: 1637752126628,
        lastUpdatedTime: 1637752126628,
      },
      {
        version: '1',
        schema: mockSchemaString,
        status: SolutionSchemaStatus.PUBLISHED,
        createdTime: 1637752126628,
        lastUpdatedTime: 1637752126628,
      },
    ] as SolutionSchema[],
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
