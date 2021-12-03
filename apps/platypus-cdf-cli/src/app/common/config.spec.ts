import { Arguments } from 'yargs';
import { BaseArgs } from '../types';
import { ConfigSchema, injectRCFile } from './config';
import { promises } from 'fs';

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('Test @injectRCFile decorator', () => {
  let count = 0;

  const config: ConfigSchema = {
    config: {
      cluster: 'greenfield',
      project: 'cognite',
      schemaFile: 'schema.graphql',
      templateId: 'soumesh-test',
      templateVersion: '1',
    },
    name: 'test-mock',
    version: 1000,
  };

  const readFile = (promises.readFile as jest.Mock).mockResolvedValue(
    JSON.stringify(config)
  );

  class TestCommand {
    @injectRCFile()
    handler(args: Arguments<BaseArgs>) {
      expect(args.solutionConfig).toMatchObject(config);
      count++;
    }
    @injectRCFile()
    nonHandler(args: BaseArgs) {
      expect(args.solutionConfig).toBeUndefined();
      count++;
    }
  }

  it('@injectRCFile() decorator should inject config to handler method', () => {
    new TestCommand().handler({
      _: undefined,
      $0: undefined,
      appId: undefined,
      logger: undefined,
    });

    expect(readFile).toBeCalledTimes(1);
  });

  it('@injectRCFile() decorator will not affect non-handler function', () => {
    new TestCommand().nonHandler({ appId: undefined, logger: undefined });

    expect(readFile).toBeCalledTimes(0);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    expect(count).toBe(2);
  });
});
