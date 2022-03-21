/*
  EMPTY_ARRAY is type casted with 'as' because freeze returns readonly
  ideally, we should've readonly in front of all types that are intended to be readonly list
*/
export const EMPTY_ARRAY = Object.freeze([]) as [];

/*
  EMPTY_OBJECT is type casted with 'as' because freeze returns readonly object
  ideally, we should've readonly in front of all types that are intended to be readonly map
*/
export const EMPTY_OBJECT = Object.freeze({}) as object;
export const NOT_AVAILABLE = 'N/A';
