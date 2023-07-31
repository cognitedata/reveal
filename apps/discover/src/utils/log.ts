import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
// import { isProduction } from '@cognite/react-container';

export const log = (message: string, data: string | any[] = [], level = 3) => {
  // never log in production
  //
  // NOTE: disabled because testcafe uses this file
  // and cannot process the things in @cognite/react-container'
  // due to it's poor tsconfig setup (testcafe's)
  //
  // if (isProduction) {
  //   return;
  // }

  // Make sure data is an array
  let logMessage = [];
  if (isString(data)) {
    logMessage = [data];
  } else if (isArray(data)) {
    logMessage = data;
  } else if (isObject(data)) {
    logMessage = Object.values(data);
  }

  if (level === 1) {
    // eslint-disable-next-line no-console
    console.log(message, ...logMessage);
  }
  if (level === 2) {
    // eslint-disable-next-line no-console
    console.warn(message, ...logMessage);
  }
  if (level === 3) {
    // eslint-disable-next-line no-console
    console.error(message, ...logMessage);
  }
};
