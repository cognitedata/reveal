import { getUserHistoryLocalStorageKey } from './getUserHistoryLocalStorageKey';

it('should generate an appropriate key without falsy values', () => {
  const id = 'test-user',
    cluster = 'test-cluster',
    project = 'test-project';
  const expectedKey = `@cognite/fusion/browsing-history-${id}-${cluster}-${project}`;

  const key = getUserHistoryLocalStorageKey({ id, cluster, project });

  expect(key).toBe(expectedKey);
  // We've had this bug before, so let's make sure it doesn't happen again.
  expect(key).not.toBe(
    `@cognite/fusion/browsing-history--${cluster}-${project}`
  );
  // Will also try for the variations.
  expect(key).not.toBe(`@cognite/fusion/browsing-history-${id}--${project}`);
  //
  expect(key).not.toBe(`@cognite/fusion/browsing-history-${id}-${cluster}-`);
});
