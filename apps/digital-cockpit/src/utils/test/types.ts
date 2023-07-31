import { PartialRootState } from 'store/types';
import { RenderOptions as RtlRenderOptions } from '@testing-library/react';

export type BaseRenderOptions = {
  redux?: PartialRootState;
  pathname?: string;
};

export type RenderOptions = RtlRenderOptions & BaseRenderOptions;
