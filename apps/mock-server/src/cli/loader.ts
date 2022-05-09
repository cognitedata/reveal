import { existsSync, readFileSync } from 'fs';
import { resolve as pathResolve } from 'path';
import { CdfApiConfig, MockData } from '../app';
// import { mockDataSample } from '../mock-data';

export function loadMockData(mockDataPath: string): MockData {
  if (!mockDataPath) {
    // return mockDataSample;
    return loadFile('mock-data.js', {}).mockDataSample;
  }
  return loadFile(mockDataPath, {});
}

export function loadConfig(configPath: string): CdfApiConfig {
  let config = {
    version: 1,
  };

  config = loadFile(configPath, config);

  return config;
}

export function loadMiddlewares(middlewares: string[]) {
  const customMiddlewares = middlewares
    .map((middleware) => {
      return loadFile(middleware, null);
    })
    .filter((middleware) => middleware);

  return customMiddlewares;
}

function loadFile(filePath: string, defaultValue = {}) {
  let result;
  if (!filePath) {
    return defaultValue;
  }
  let fileToLoadPath = getPath(filePath);
  if (!existsSync(fileToLoadPath)) {
    fileToLoadPath = pathResolve(process.cwd(), filePath);
  }

  if (existsSync(fileToLoadPath)) {
    if (filePath.endsWith('.js')) {
      result = require(/* webpackIgnore: true */ getPath(filePath));
    } else if (filePath.endsWith('.json')) {
      result = JSON.parse(
        readFileSync(getPath(filePath), {
          encoding: 'utf8',
        })
      );
    } else {
      console.error(
        `Error: Unsupported extension, We will not load the file from specified path ${filePath}.`
      );
      result = defaultValue;
    }
  } else {
    console.warn(
      `Error: We were not able to load the file from specified path ${filePath}.`
    );
    result = defaultValue;
  }

  return result;
}

function getPath(path: string): string {
  return pathResolve(__dirname, path);
}
