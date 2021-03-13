import {
  Matcher,
  MatcherOptions,
  RenderOptions as RtlRenderOptions,
} from '@testing-library/react';

export type BaseRenderOptions = {
  pathname?: string;
};

export type RenderOptions = RtlRenderOptions & BaseRenderOptions;

export type FindByTestId = (
  text: Matcher,
  options?: MatcherOptions | undefined
) => Promise<HTMLElement>;
