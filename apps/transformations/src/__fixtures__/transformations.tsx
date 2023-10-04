import {
  TransformationRead,
  TransformationUpdate,
} from '@transformations/types';
import { merge } from 'lodash';

import { user } from './user';

export const transformationId = 1;
export const transformationName = 'test-transformation';

export const getTransformationRead = (
  override?: TransformationRead
): TransformationRead =>
  merge(
    {
      key: '1',
      id: transformationId,
      name: 'test-transformation',
      query:
        '/* MAPPING_MODE_ENABLED: true */\n/* {"version":1,"sourceType":"raw","mappings":[{"from":"","to":"name","asType":"STRING"},{"from":"","to":"parentId","asType":"BIGINT"},{"from":"","to":"description","asType":"STRING"},{"from":"","to":"source","asType":"STRING"},{"from":"","to":"externalId","asType":"STRING"},{"from":"","to":"metadata","asType":"MAP<STRING, STRING>"},{"from":"","to":"parentExternalId","asType":"STRING"},{"from":"","to":"dataSetId","asType":"BIGINT"},{"from":"","to":"labels","asType":"ARRAY<STRING>"}]} */',
      destination: {
        type: 'assets',
      },
      conflictMode: 'abort',
      isPublic: true,
      createdTime: 1695195239175,
      lastUpdatedTime: 1695195239175,
      hasCredentials: true,
      ignoreNullFields: true,
      schedule: {
        id: 1,
        externalId: 'tr-external-id',
        createdTime: 1,
        lastUpdatedTime: 1,
        interval: '1d',
        isPaused: false,
      },
    },
    override
  );

export const getTransformationUpdate = (
  override?: TransformationUpdate
): TransformationUpdate =>
  merge(
    {
      id: transformationId,
      name: transformationName,
      query:
        '/* MAPPING_MODE_ENABLED: true */\n/* {"version":1,"sourceType":"raw","mappings":[{"from":"","to":"name","asType":"STRING"},{"from":"","to":"parentId","asType":"BIGINT"},{"from":"","to":"description","asType":"STRING"},{"from":"","to":"source","asType":"STRING"},{"from":"","to":"externalId","asType":"STRING"},{"from":"","to":"metadata","asType":"MAP<STRING, STRING>"},{"from":"","to":"parentExternalId","asType":"STRING"},{"from":"","to":"dataSetId","asType":"BIGINT"},{"from":"","to":"labels","asType":"ARRAY<STRING>"}]} */',
      destination: {
        type: 'assets',
      },
      conflictMode: 'abort',
      isPublic: true,
      createdTime: 1695195239175,
      lastUpdatedTime: 1695195239175,
      owner: {
        user: user,
      },
      ownerIsCurrentUser: true,
      hasSourceOidcCredentials: false,
      hasDestinationOidcCredentials: false,
      externalId: 'tr-test-transformation',
      ignoreNullFields: true,
    },
    override
  );
