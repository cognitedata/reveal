import { screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { TransformationDropdown } from './TransformationDropdown';
import { DataModelTransformation } from '@platypus/platypus-core';
import noop from 'lodash/noop';

const mockTransformations: DataModelTransformation[] = [
  {
    destination: {
      instanceSpaceExternalId: 'imdb',
      modelExternalId: 'Movie_2',
      spaceExternalId: 'imdb',
      type: 'data_model_instances',
    },
    externalId: 't_imdb_movie_2_1',
    id: 2,
    name: 'IMDB Movie_2 1',
  },
  {
    destination: {
      instanceSpaceExternalId: 'imdb',
      modelExternalId: 'Movie_2',
      spaceExternalId: 'imdb',
      type: 'data_model_instances',
    },
    externalId: 't_imdb_movie_2_2',
    id: 3,
    name: 'IMDB Movie_2 2',
  },
  {
    destination: {
      instanceSpaceExternalId: 'imdb',
      modelExternalId: 'Movie_actors_2',
      spaceExternalId: 'imdb',
      type: 'data_model_instances',
    },
    externalId: 't_imdb_movie_actors_2_1',
    id: 4,
    name: 'IMDB Movie Actors 1',
  },
];

const mockGetMissingPermissions = jest.fn();
const mockSetIsTransformationModalOpen = jest.fn();

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/useDataManagemenPageUI',
  () => ({
    useDataManagementPageUI: () => ({
      setIsTransformationModalOpen: mockSetIsTransformationModalOpen,
      getMissingPermissions: mockGetMissingPermissions,
    }),
  })
);

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/useTransformations',
  () => () => ({ data: mockTransformations })
);

describe('TransformationDropdown', () => {
  beforeAll(() => {
    mockSetIsTransformationModalOpen.mockClear();
  });

  it('Displays transformations for the type and its edges', () => {
    render(
      <TransformationDropdown
        dataModelExternalId="imdb"
        onAddClick={noop}
        typeName="Movie"
        version="2"
      />
    );

    userEvent.click(screen.getByText(/bulk population/i));

    expect(screen.getByText('Data For Movie')).toBeTruthy();
    expect(screen.getByText('IMDB Movie_2 1')).toBeTruthy();
    expect(screen.getByText('IMDB Movie_2 2')).toBeTruthy();
    expect(screen.getByText('Data For Movie.actors')).toBeTruthy();
    expect(screen.getByText('IMDB Movie Actors 1')).toBeTruthy();

    expect(screen.queryByText('IMDB Movie_1 1')).toBeNull();
    expect(screen.queryByText('My data model Movie_2 1')).toBeNull();
  });

  it('Opens transformation modal when clicking a transformation in the list', () => {
    render(
      <TransformationDropdown
        dataModelExternalId="imdb"
        onAddClick={noop}
        typeName="Movie"
        version="2"
      />
    );

    userEvent.click(screen.getByText(/bulk population/i));
    userEvent.click(screen.getByText('IMDB Movie_2 1'));

    expect(mockSetIsTransformationModalOpen).toHaveBeenCalledWith(true, 2);
  });
});
