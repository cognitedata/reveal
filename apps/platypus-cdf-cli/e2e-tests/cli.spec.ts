import * as platypusCli from './platypus-cli';

//Return datetime like 2022-07-18-1320 to work with API data model naming rules
const getDatamodelNameTimeAppendix = () => {
  const date = new Date();
  return date
    .toLocaleString('en-CA', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false,
    })
    .replace(', ', '-')
    .replace(':', '');
};

describe('platpus-cli', () => {
  beforeAll(() => {
    return platypusCli.login();
  });

  describe('cdf data-models create', () => {
    it('can create data models', async () => {
      const dataModelName = `cdf-cli-create-e2e-test-${getDatamodelNameTimeAppendix()}`;
      const dataModelExternalId = dataModelName;

      const output = await platypusCli.dataModelsCreate(
        dataModelName,
        dataModelExternalId
      );
      // platypusCli.dataModelsDelete(dataModelExternalId);

      expect(output).toMatch(
        `Data model "${dataModelName}" has been created successfully`
      );
    });
  });

  // Disabled temprorary because of API bug with delete
  // describe('cdf data-models delete', () => {
  //   it('can delete data models', async () => {
  //     const dataModelName = `cdf-cli-delete-e2e-test-${Date.now()}`;
  //     const dataModelExternalId = dataModelName;

  //     await platypusCli.dataModelsCreate(dataModelName, dataModelExternalId);
  //     const output = await platypusCli.dataModelsDelete(dataModelExternalId);
  //     expect(output).toMatch(
  //       `Data model - "${dataModelExternalId}" has been deleted successfully`
  //     );
  //   });
  // });

  describe('cdf data-models publish', () => {
    jest.setTimeout(10000);
    it('can publish data models', async () => {
      const dataModelName = `cdf-cli-publish-e2e-test-${getDatamodelNameTimeAppendix()}`;
      const dataModelExternalId = dataModelName;

      await platypusCli.dataModelsCreate(dataModelName, dataModelExternalId);

      const output = await platypusCli.dataModelsPublish(
        dataModelExternalId,
        __dirname + '/graphql-schemas/valid_schema_v1.gql'
      );
      expect(output).toMatch('Api version 1 has been published');
    });
  });

  afterAll(async () => {
    platypusCli.logout();
  });
});
