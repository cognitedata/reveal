/* eslint-disable testing-library/no-node-access */
import { screen, waitFor, within } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
} from '@platypus/platypus-core';
import noop from 'lodash/noop';
import { SuggestionsModal, toggleKeyInObject } from './SuggestionsModal';

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/usePreviewTableData',
  () => ({
    usePreviewTableData: (
      _: any,
      _2: any,
      dataModelType: DataModelTypeDefsType
    ) =>
      dataModelType?.name === 'Movie'
        ? {
            data: [
              {
                externalId: '1',
                name: 'movie 1',
                actor: { externalId: '1' },
                anotherField: { externalId: '1' },
              },
              {
                externalId: '2',
                name: 'movie 2',
              },
              { externalId: '3', name: 'movie 3' },
            ],
            isFetching: false,
          }
        : {
            data: [
              { externalId: '1', name: 'actor 1' },
              { externalId: '2', name: 'actor 2' },
              { externalId: '3', name: 'actor 3' },
            ],
            isFetching: false,
          },
  })
);

const mockAcceptFn = jest.fn();
const mockRejectFn = jest.fn();
jest.mock('./useSuggestions', () => ({
  useSuggestions: () => ({
    acceptMatches: mockAcceptFn,
    rejectMatches: mockRejectFn,
    getRejectedMatches: () => [],
  }),
}));

const mockReduxStore = {
  dataModel: {
    customTypesNames: ['Actor'],
  },
};

const movieType: DataModelTypeDefsType = {
  fields: [
    {
      description: undefined,
      name: 'name',
      id: 'name',
      nonNull: false,
      type: { list: false, name: 'String', nonNull: false, custom: false },
    },
    {
      description: undefined,
      name: 'actor',
      id: 'actor',
      nonNull: false,
      type: { list: false, name: 'Actor', nonNull: false, custom: true },
    },
    {
      description: undefined,
      name: 'anotherField',
      id: 'anotherField',
      nonNull: false,
      type: { list: false, name: 'Actor', nonNull: false, custom: true },
    },
  ],
  name: 'Movie',
};

const actorType: DataModelTypeDefsType = {
  fields: [
    {
      description: undefined,
      name: 'name',
      id: 'name',
      nonNull: false,
      type: { list: false, name: 'String', nonNull: false, custom: false },
    },
  ],
  name: 'Actor',
};

const mockTypeDefs: DataModelTypeDefs = {
  types: [movieType, actorType],
};

const dataModelInfo = {
  space: 'abc',
  dataModelExternalId: 'abc',
  dataModelType: movieType,
  dataModelTypeDefs: mockTypeDefs,
  version: '1',
};

const mockConfirmFn = jest.fn();

describe('SuggestionsModal', () => {
  beforeEach(() => {
    mockConfirmFn.mockClear();
  });
  describe('Modal Content', () => {
    it('autoselect first column for suggestions', async () => {
      const { baseElement } = render(
        <SuggestionsModal
          dataModelInfo={dataModelInfo}
          onConfirm={mockConfirmFn}
          onCancel={noop}
        />,
        {
          redux: mockReduxStore,
        }
      );

      await waitFor(() => {
        expect(
          baseElement.getElementsByClassName('cogs-select')[0]
        ).toHaveTextContent('actor');
      });
      // explore columns
      await userEvent.click(
        baseElement
          .getElementsByClassName('cogs-select')[0]
          .getElementsByTagName('input')[0]
      );
      expect(screen.getByText('anotherField')).toBeTruthy();

      // choose target column
      await userEvent.click(screen.getByText('anotherField'));

      await waitFor(() => {
        expect(
          baseElement.getElementsByClassName('cogs-select')[0]
        ).toHaveTextContent('anotherField');
      });
    });

    it('select another property and view results', async () => {
      render(
        <SuggestionsModal
          dataModelInfo={dataModelInfo}
          onConfirm={mockConfirmFn}
          onCancel={noop}
        />,
        {
          redux: mockReduxStore,
        }
      );

      await waitFor(() => {
        expect(screen.getByText('Movie')).toBeTruthy();
      });
      expect(screen.getByText('Actor')).toBeTruthy();
      expect(screen.getByText('Higher quality')).toBeTruthy();

      // explore suggestion column
      await userEvent.click(screen.getByText('Movie'));
      // choose suggestion column
      await userEvent.click(screen.getByText('name'));
      await waitFor(() => {
        // table should update accordingly
        expect(screen.getAllByText('2, movie 2')).toBeTruthy();
      });
    });

    it('select all approve and reject', async () => {
      render(
        <SuggestionsModal
          dataModelInfo={dataModelInfo}
          onConfirm={mockConfirmFn}
          onCancel={noop}
        />,
        {
          redux: mockReduxStore,
        }
      );

      await waitFor(() => {
        // accepted 3 selection
        expect(screen.getByText('Movie:')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('select-all'));

      // select all and approve
      // cogs bug, need to click 2 times
      await userEvent.click(
        screen.getByTestId('select-all').children[0].children[0].children[0]
      );
      await waitFor(async () => {
        expect(
          within(screen.getByTestId('select-all')).getByTestId('CheckIcon')
        ).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('accept-selection'));
      await userEvent.click(screen.getByText('Confirm'));
      await waitFor(() => {
        // accepted 3 selection
        expect(mockConfirmFn.mock.calls[0][1].length).toBe(2);
      });
      // check if the accept worked
      expect(mockConfirmFn.mock.calls[0][1][0].actor.externalId).toBe('2');

      // select all and reject
      await userEvent.click(
        screen.getByTestId('select-all').children[0].children[0].children[0]
      );
      await waitFor(async () => {
        expect(
          within(screen.getByTestId('select-all')).getByTestId('CheckIcon')
        ).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('reject-selection'));
      await userEvent.click(screen.getByText('Confirm'));
      await waitFor(() => {
        // approved 0 selection
        expect(mockConfirmFn.mock.calls[1][1].length).toBe(0);
      });
      // rejected 2 selection
      expect(mockConfirmFn.mock.calls[1][2].length).toBe(2);
    });
    it('select some approve and reject', async () => {
      const { baseElement } = render(
        <SuggestionsModal
          dataModelInfo={dataModelInfo}
          onConfirm={mockConfirmFn}
          onCancel={noop}
        />,
        {
          redux: mockReduxStore,
        }
      );

      // explore columns
      await userEvent.click(
        baseElement
          .getElementsByClassName('cogs-select')[0]
          .getElementsByTagName('input')[0]
      );
      await waitFor(() => {
        expect(screen.getByText('anotherField')).toBeTruthy();
      });

      // choose target column
      await userEvent.click(screen.getByText('anotherField'));
      await waitFor(() => {
        // accepted 3 selection
        expect(screen.getByText('Movie:')).toBeInTheDocument();
      });

      // select 2 and approve
      await userEvent.click(screen.getAllByTestId('accept')[0]);

      await userEvent.click(screen.getAllByTestId('accept')[1]);
      await waitFor(() => {
        expect(screen.getAllByTestId('accept')[1]).toHaveClass(
          'cogs-btn-primary'
        );
      });
      await userEvent.click(screen.getByText('Confirm'));
      await waitFor(() => {
        // accepted 1 selection
        expect(mockConfirmFn.mock.calls[0][1].length).toBe(2);
      });
      // check if the accept worked
      expect(mockConfirmFn.mock.calls[0][1][0].anotherField.externalId).toBe(
        '2'
      );
      expect(mockConfirmFn.mock.calls[0][1][1].anotherField.externalId).toBe(
        '3'
      );

      // reject that previously approved one and accept another one
      await userEvent.click(screen.getAllByTestId('reject')[0]);
      await waitFor(() => {
        expect(screen.getAllByTestId('reject')[0]).toHaveClass(
          'cogs-btn-primary'
        );
      });
      await userEvent.click(screen.getByText('Confirm'));
      await waitFor(() => {
        // accepted 1 selection
        expect(mockConfirmFn.mock.calls[1][1].length).toBe(1);
      });
      // check if the accept worked
      expect(mockConfirmFn.mock.calls[1][1][0].anotherField.externalId).toBe(
        '3'
      );
      // check if the reject worked and specifies the column for rejection
      expect(mockConfirmFn.mock.calls[1][2][0]).toBe('anotherField,2,2');
    });
  });

  describe('toggleKeyInObject', () => {
    it('toggle to true', () => {
      expect(toggleKeyInObject({ a: true }, 'a', true)).toStrictEqual({});
    });
    it('toggle false to true', () => {
      expect(toggleKeyInObject({ a: false }, 'a', true)).toStrictEqual({
        a: true,
      });
    });
    it('add new key', () => {
      expect(toggleKeyInObject({ a: false }, 'b', false)).toStrictEqual({
        a: false,
        b: false,
      });
    });
    it('respect existing entries', () => {
      // change value (preserve existing)
      expect(
        toggleKeyInObject({ a: false, b: false }, 'b', true)
      ).toStrictEqual({
        a: false,
        b: true,
      });
      // toggle (preserve existing)
      expect(
        toggleKeyInObject({ a: false, b: false }, 'b', false)
      ).toStrictEqual({
        a: false,
      });
    });
  });
});
