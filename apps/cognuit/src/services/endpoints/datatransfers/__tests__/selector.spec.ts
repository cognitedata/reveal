import { fixtureDataTransferDataTable } from '__fixtures__/fixtureDataTransfers';

import { getLatestRevisionStepsStatus } from '../selector';

describe('datatransfers selector', () => {
  describe('getLatestRevisionStepsStatus', () => {
    it('returns the latest step and step count as a tuple', () => {
      const [record] = fixtureDataTransferDataTable;

      const result = getLatestRevisionStepsStatus(record);

      const [message, step] = result;

      expect(message.status).toBe('Uploaded to connector');
      expect(step).toBe(6);
    });
  });
});
