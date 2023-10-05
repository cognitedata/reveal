import * as platypusCli from './platypus-cli';

//Return datetime like 2022_07_18_1320 to work with API data model naming rules
const getDatamodelNameTimeAppendix = () => {
  const date = new Date();
  return date
    .toLocaleString('en-CA', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false,
    })
    .replace(', ', '_')
    .replace(':', '')
    .replaceAll('/', '_')
    .replaceAll('-', '_');
};

describe('platpus-cli', () => {
  beforeAll(async () => {
    return await platypusCli.login();
  }, 15000);

  describe('cdf data-models publish', () => {
    it('can publish data models and list', async () => {
      const dataModelName = `cdf_cli_publish_e2e_test_${getDatamodelNameTimeAppendix()}`;
      const dataModelExternalId = dataModelName;
      const dataModelDesc = dataModelName;

      let output = await platypusCli.dataModelsCreate(
        dataModelName,
        dataModelExternalId,
        dataModelExternalId,
        dataModelDesc
      );

      expect(output).toMatch(
        `Data model "${dataModelName}" has been created successfully`
      );

      output = await platypusCli.dataModelsPublish(
        dataModelExternalId,
        __dirname + '/graphql-schemas/valid_schema_v1.gql',
        '1',
        dataModelExternalId
      );

      expect(output).toMatch(
        'Successfully published changes to data model version 1'
      );

      output = await platypusCli.dataModelsList();
      expect(output).toContain(dataModelExternalId);
    }, 15000);
  });

  afterAll(async () => {
    return await platypusCli.logout();
  }, 15000);
});
