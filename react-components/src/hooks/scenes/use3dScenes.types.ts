import { type UseQueryResult } from '@tanstack/react-query';
import { type SceneData } from './types';

export type Space = string;
export type ExternalId = string;

export type Use3dScenesResult = UseQueryResult<Record<Space, Record<ExternalId, SceneData>>>;

export type ScenesMap = Record<Space, Record<ExternalId, SceneData>>;
