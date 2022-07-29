import { validateClusterName } from '.';

test('Cluster name should be validated', () => {
  expect(validateClusterName({ cluster: 'greenfield' })).toBe(true);
  expect(validateClusterName({ cluster: 'greenfield.cognite.com' })).toBe(
    'Cluster name is invalid, make sure its just the name of the cluster; For example if its "api.cognitedata.com" just enter "api"'
  );
});
