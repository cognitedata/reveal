import { RenderOptions as RtlRenderOptions } from '@testing-library/react';
import { RenderHookOptions as RTLRenderHookOptions } from '@testing-library/react-hooks';
import { AppStore as OrignalAppStore } from 'core';
import { RequestHandler } from 'msw';
import { MockStoreEnhanced } from 'redux-mock-store';
import { ThunkDispatch } from 'redux-thunk';

import { PartialStoreState, StoreState, StoreAction } from 'core/types';

export type BaseRenderOptions = {
  redux?: PartialStoreState;
  pathname?: string;
};

export type RenderOptions = RtlRenderOptions & BaseRenderOptions;

export type RenderHookOptions<P> = RTLRenderHookOptions<P> & BaseRenderOptions;

export type AppStore = {
  getActions: () => any[];
} & OrignalAppStore &
  MockStoreEnhanced<
    StoreState,
    ThunkDispatch<StoreState, undefined, StoreAction>
  >;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MSWRequest = RequestHandler<any, any, any, any>;
