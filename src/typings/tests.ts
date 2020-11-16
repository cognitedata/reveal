import {
  Matcher,
  MatcherOptions,
  RenderOptions as RtlRenderOptions,
} from '@testing-library/react';
import { PartialRootState } from 'store/types';

export type BaseRenderOptions = {
  redux?: PartialRootState;
  pathname?: string;
};

export type RenderOptions = RtlRenderOptions & BaseRenderOptions;

export type FindByTestId = (
  text: Matcher,
  options?: MatcherOptions | undefined
) => Promise<HTMLElement>;
