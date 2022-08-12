import { CogniteEvent } from '@cognite/sdk';
import { renderTitle } from '../events';

describe('EventsUtils', () => {
  describe('renderTitle', () => {
    it('should create the correct title for event with type and subtype', () => {
      const event: CogniteEvent = {
        id: 1,
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
        type: 'myType',
        subtype: 'mySubtype',
      };
      const result = renderTitle(event);
      expect(result).toBe('myType: mySubtype');
    });

    it('should create the correct title for event with type only', () => {
      const event: CogniteEvent = {
        id: 1,
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
        type: 'myType',
      };
      const result = renderTitle(event);
      expect(result).toBe('myType');
    });

    it('should create the correct title for event with subtype only', () => {
      const event: CogniteEvent = {
        id: 1,
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
        subtype: 'mySubtype',
      };
      const result = renderTitle(event);
      expect(result).toBe('mySubtype');
    });
  });
});
