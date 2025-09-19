import { type CogniteClient } from '@cognite/sdk';
import { type UseQueryResult } from '@tanstack/react-query';
import { type SceneData } from './types';

export type Space = string;
export type ExternalId = string;

export type Use3dScenesViewModelProps = {
  userSdk?: CogniteClient;
};

export type Use3dScenesViewModelResult = UseQueryResult<
  Record<Space, Record<ExternalId, SceneData>>
>;

export type ScenesMap = Record<Space, Record<ExternalId, SceneData>>;
