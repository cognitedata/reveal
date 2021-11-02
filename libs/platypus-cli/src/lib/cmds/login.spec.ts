import { validateClusterName } from './login';

test('Cluster name should be validated', () => {
  expect(validateClusterName('greenfield')).toBe(true);
  expect(validateClusterName('greenfield.cognite.com')).toBe(
    'Cluster name is invalid, make sure its just the name of the cluster; For example if its "api.cognitedata.com" just enter "api"'
  );
});
