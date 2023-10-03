import { DataModelTypeDefsType } from '@platypus/platypus-core';
import render from '@platypus-app/tests/render';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import noop from 'lodash/noop';

import { CreateTransformationModal } from './CreateTransformationModal';

const mockMutate = jest.fn().mockImplementation((transformation, options) => {
  options.onSuccess({ id: transformation.transformationExternalId });
});

jest.mock('@platypus-app/utils/uuid', () => {
  return {
    generateId: () => '123',
  };
});

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/useTransformationCreateMutation',
  () => {
    return () => ({ mutate: mockMutate });
  }
);

const mockSetIsTransformationModalOpen = jest.fn();

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/useDataManagemenPageUI',
  () => ({
    useDataManagementPageUI: () => ({
      setIsTransformationModalOpen: mockSetIsTransformationModalOpen,
    }),
  })
);

jest.mock('@platypus-app/hooks/useDataModelActions', () => ({
  useCustomTypeNames: () => ['Actor'],
}));

const mockReduxStore = {
  dataModel: {},
};

const mockType: DataModelTypeDefsType = {
  fields: [
    {
      description: undefined,
      name: 'actors',
      id: 'actors',
      nonNull: false,
      type: { list: true, name: 'Actor', nonNull: false, custom: true },
    },
    {
      description: undefined,
      name: 'name',
      id: 'name',
      nonNull: false,
      type: { list: false, name: 'String', nonNull: false, custom: false },
    },
  ],
  name: 'Movie',
};

describe('CreateTransformationModal', () => {
  it('Passes correct relationships to transformation dropdown', () => {
    render(
      <CreateTransformationModal
        dataModelExternalId="abc"
        space="abc"
        dataModelType={mockType}
        onRequestClose={noop}
        dataModelVersion="1"
        viewVersion="1"
      />,
      {
        redux: mockReduxStore,
      }
    );

    userEvent.click(screen.getByText('Load relationship'));
    userEvent.click(screen.getByText('Select relationship'));

    expect(screen.getByText('Movie.actors')).toBeTruthy();
  });

  it('Disables submit button if no relationship selected', () => {
    render(
      <CreateTransformationModal
        dataModelExternalId="abc"
        space="abc"
        dataModelType={mockType}
        onRequestClose={noop}
        dataModelVersion="1"
        viewVersion="1"
      />,
      {
        redux: mockReduxStore,
      }
    );

    userEvent.click(screen.getByText('Load relationship'));

    expect(
      screen.getByRole('button', { name: 'Next', hidden: true })
    ).toHaveClass('cogs-button--disabled');
  });

  it('Enables submit button if a relationship is selected', () => {
    render(
      <CreateTransformationModal
        dataModelExternalId="abc"
        space="abc"
        dataModelType={mockType}
        onRequestClose={noop}
        dataModelVersion="1"
        viewVersion="1"
      />,
      {
        redux: mockReduxStore,
      }
    );

    userEvent.click(screen.getByText('Load relationship'));
    userEvent.click(screen.getByText('Select relationship'));
    userEvent.click(screen.getByText('Movie.actors'));

    expect(
      screen.getByRole('button', { name: 'Next', hidden: true })
    ).not.toHaveClass('cogs-button--disabled');
  });

  it('Sets transformation name for loading data', () => {
    render(
      <CreateTransformationModal
        dataModelExternalId="abc"
        space="abc"
        dataModelType={mockType}
        onRequestClose={noop}
        dataModelVersion="1"
        viewVersion="1"
      />,
      {
        redux: mockReduxStore,
      }
    );

    expect(screen.getByLabelText('Transformation name')).toHaveValue('Movie_1');
  });

  it('Sets transformation name for loading relationship', () => {
    render(
      <CreateTransformationModal
        dataModelExternalId="abc"
        space="abc"
        dataModelType={mockType}
        onRequestClose={noop}
        dataModelVersion="1"
        viewVersion="1"
      />,
      {
        redux: mockReduxStore,
      }
    );

    userEvent.click(screen.getByText('Load relationship'));
    userEvent.click(screen.getByText('Select relationship'));
    userEvent.click(screen.getByText('Movie.actors'));

    expect(screen.getByLabelText('Transformation name')).toHaveValue(
      'Movie_actors_1'
    );
  });

  it('Calls transformation create mutation on submit', () => {
    window.open = jest.fn();
    const mockTransformation = {
      destination: 'edges',
      space: 'abc',
      oneToManyFieldName: 'actors',
      transformationExternalId: '123',
      transformationName: 'Movie_actors_1',
      typeName: 'Movie',
      version: '1',
    };

    render(
      <CreateTransformationModal
        dataModelExternalId="abc"
        space="abc"
        dataModelType={mockType}
        onRequestClose={noop}
        dataModelVersion="1"
        viewVersion="1"
      />,
      {
        redux: mockReduxStore,
      }
    );

    userEvent.click(screen.getByText('Load relationship'));
    userEvent.click(screen.getByText('Select relationship'));
    userEvent.click(screen.getByText('Movie.actors'));
    userEvent.click(screen.getByRole('button', { name: 'Next', hidden: true }));

    expect(mockMutate.mock.calls[0][0]).toEqual(mockTransformation);
    expect(window.open).toHaveBeenCalled();
  });
});
