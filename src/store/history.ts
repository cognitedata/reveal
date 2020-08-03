import {
  History,
  LocationDescriptor,
  LocationDescriptorObject,
  LocationState,
} from 'history';
import queryString from 'query-string';

type CreateHistory<O, H> = (options?: O) => History & H;

function preserveQueryAndHashParameters(
  history: History,
  preserve: string[],
  location: LocationDescriptorObject
): LocationDescriptorObject {
  const currentQuery = queryString.parse(history.location.search);
  if (currentQuery) {
    const preservedQuery: { [key: string]: unknown } = {};
    preserve.forEach(p => {
      const v = currentQuery[p];
      if (v) {
        preservedQuery[p] = v;
      }
    });
    if (location.search) {
      Object.assign(preservedQuery, queryString.parse(location.search));
    }
    // eslint-disable-next-line no-param-reassign
    location.search = queryString.stringify(preservedQuery);
  }
  const currentHash = queryString.parse(history.location.hash);
  if (currentHash) {
    const preservedHash: { [key: string]: unknown } = {};
    preserve.forEach(p => {
      const v = currentHash[p];
      if (v) {
        preservedHash[p] = v;
      }
    });
    if (location.hash) {
      Object.assign(preservedHash, queryString.parse(location.hash));
    }
    // eslint-disable-next-line no-param-reassign
    location.hash = queryString.stringify(preservedHash);
  }
  return location;
}

function createLocationDescriptorObject(
  location: LocationDescriptor,
  state?: LocationState
): LocationDescriptorObject {
  return typeof location === 'string'
    ? { pathname: location, state }
    : location;
}

export function createPreserveQueryAndHashHistory<O, H>(
  createHistory: CreateHistory<O, H>,
  parameters: string[]
): CreateHistory<O, H> {
  return (options?: O) => {
    const history = createHistory(options);
    const oldPush = history.push;
    const oldReplace = history.replace;
    history.push = (path: LocationDescriptor, state?: LocationState) =>
      oldPush.apply(history, [
        preserveQueryAndHashParameters(
          history,
          parameters,
          createLocationDescriptorObject(path, state)
        ),
      ]);
    history.replace = (path: LocationDescriptor, state?: LocationState) =>
      oldReplace.apply(history, [
        preserveQueryAndHashParameters(
          history,
          parameters,
          createLocationDescriptorObject(path, state)
        ),
      ]);
    return history;
  };
}
