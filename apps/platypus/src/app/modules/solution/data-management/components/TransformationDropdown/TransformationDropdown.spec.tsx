import { DataModelTransformation } from '@platypus/platypus-core';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import noop from 'lodash/noop';

import render from '../../../../../tests/render';

import { TransformationDropdown } from './TransformationDropdown';

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
const mockIsFDMv3 = jest.fn();

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/useDataManagemenPageUI',
  () => ({
    useDataManagementPageUI: () => ({
      setIsTransformationModalOpen: mockSetIsTransformationModalOpen,
      getMissingPermissions: mockGetMissingPermissions,
    }),
  })
);

jest.mock('@platypus-app/hooks/useMixpanel');

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/useTransformations',
  () => () => ({ data: mockTransformations })
);

jest.mock('@platypus-app/flags', () => ({
  isFDMv3: () => mockIsFDMv3(),
}));

describe('TransformationDropdown', () => {
  beforeAll(() => {
    mockSetIsTransformationModalOpen.mockClear();
    mockIsFDMv3.mockReturnValue(true);
  });

  it('Displays transformations for the type and its edges', () => {
    render(
      <TransformationDropdown
        space="imdb"
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

  it('Opens transformation in a new tab when clicking a transformation in the list', () => {
    window.open = jest.fn();
    render(
      <TransformationDropdown
        space="imdb"
        onAddClick={noop}
        typeName="Movie"
        version="2"
      />
    );

    userEvent.click(screen.getByText(/bulk population/i));
    userEvent.click(screen.getByText('IMDB Movie_2 1'));

    expect(window.open).toHaveBeenCalled();
  });
});
