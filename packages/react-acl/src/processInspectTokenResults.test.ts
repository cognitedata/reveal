import { InspectResult } from './types';
import { processInspectTokenResults } from './processInspectTokenResults';

describe('processInspectTokenResults', () => {
  it('should find missing files', () => {
    const data = {
      subject: '123',
      projects: [
        {
          projectUrlName: 'test',
          groups: [1, 2, 3],
        },
        {
          projectUrlName: 'test2',
          groups: [4, 5],
        },
      ],
      capabilities: [
        {
          assetsAcl: {
            version: 1,
            actions: ['READ'],
            scope: {
              all: {},
            },
          },
          projectScope: {
            projects: ['test'],
          },
        },
        {
          sequencesAcl: {
            actions: ['READ'],
            scope: {
              all: {},
            },
          },
          projectScope: {
            projects: ['test'],
          },
        },
      ],
    } as InspectResult;

    expect(processInspectTokenResults(data, 'test')).toEqual({
      assetsAcl: { actions: ['READ'], scope: { all: {} }, version: 1 },
      sequencesAcl: { actions: ['READ'], scope: { all: {} } },
    });
  });
});
