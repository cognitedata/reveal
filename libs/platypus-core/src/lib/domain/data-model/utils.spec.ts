import * as utils from './utils';

import { mixerApiInlineTypeDirectiveName } from './constants';
import { DataModelTransformation, DataModelTypeDefs } from './types';
import { groupTransformationsByTypes, parseModelName } from './utils';

const dataModelTypeDefsMock: DataModelTypeDefs = {
  types: [
    {
      name: 'Post',
      fields: [
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
          name: 'authors',
          type: {
            name: 'User',
            list: true,
            nonNull: false,
          },
          nonNull: false,
        },
      ],
    },
    {
      name: 'Comment',
      fields: [
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
          name: 'views',
          type: {
            name: 'Int',
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
            nonNull: true,
          },
          nonNull: true,
        },
      ],
    },
    {
      name: 'User',
      directives: [
        {
          name: mixerApiInlineTypeDirectiveName,
        },
      ],
      fields: [
        {
          name: 'name',
          type: {
            name: 'String',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
      ],
    },
  ],
};

describe('Data model services utils', () => {
  describe('getTypesMap', () => {
    it('should only return scalar and object types', () => {
      const typesMap = utils.getTypesMap();

      expect(typesMap).toEqual({
        Boolean: 'boolean',
        DataPoint: 'text',
        DataPointValue: 'text',
        Float: 'float32',
        Int: 'int32',
        Int64: 'int64',
        JSONObject: 'json',
        String: 'text',
        TimeSeries: 'text',
        Timestamp: 'timestamp',
      });
    });
  });

  describe('getOneToManyModelName', () => {
    it('should generate name according to naming scheme "<from type>_<property name>_<version number>"', () => {
      const type = dataModelTypeDefsMock.types[0];
      const name = utils.getOneToManyModelName(
        type.name,
        type.fields[1].name,
        '1'
      );

      expect(name).toEqual('Post_authors_1');
    });
  });

  describe('isInlineType', () => {
    it('should return false if type is not inline', () => {
      expect(utils.isInlineType(dataModelTypeDefsMock.types[0])).toEqual(false);
    });

    it('should return true if type is inline', () => {
      const type = {
        name: '',
        directives: [
          {
            name: 'nested',
          },
        ],
        fields: [
          {
            name: '',
            description: '',
            type: { name: '' },
          },
        ],
      };

      expect(utils.isInlineType(type)).toEqual(true);
    });
  });

  describe('isCustomType', () => {
    it('should only return true if type is custom', () => {
      expect(utils.isCustomType('Person')).toEqual(true);
    });

    it('should only return false if type is not custom', () => {
      expect(utils.isCustomType('String')).toEqual(false);
    });
  });

  describe('getVersionedExternalId', () => {
    it('should return correct externalId according to naming scheme "<name>_<version>"', () => {
      expect(utils.getVersionedExternalId('name', '1')).toEqual('name_1');
    });
  });
});

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

  describe('parseModelName', () => {
    it('returns correctly for model name', () => {
      expect(parseModelName('Movie_4')).toBe('Movie');
    });

    it('returns correctly for one-to-many model names', () => {
      expect(parseModelName('Movie_actors_3')).toBe('Movie.actors');
    });
  });
});
