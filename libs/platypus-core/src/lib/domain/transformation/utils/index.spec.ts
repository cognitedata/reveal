import { groupTransformationsByTypes } from '.';
import { DataModelTransformation } from '../types';

describe('groupTransformationsByTypes', () => {
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

  it('Returns correct grouping', () => {
    expect(groupTransformationsByTypes(mockTransformations)).toEqual({
      Movie_2: {
        displayName: 'Movie',
        transformations: [
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
        ],
      },
      Movie_actors_2: {
        displayName: 'Movie.actors',
        transformations: [
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
        ],
      },
    });
  });
});
