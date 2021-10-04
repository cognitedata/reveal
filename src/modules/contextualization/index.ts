import { combineReducers } from '@reduxjs/toolkit';
import { reducer as svgConvertReducer } from './pnidConvert';
import { reducer as pnidParsingReducer } from './pnidParsing';

const reducer = combineReducers({
  svgConvert: svgConvertReducer,
  pnidParsing: pnidParsingReducer,
});

export { reducer };
export * from './types';
