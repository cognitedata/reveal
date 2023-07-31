/**
 * @jest-environment jsdom
 */
import { isValidGraphDocumentJson } from '../jsonUtils';

describe('Testing isValidGraphDocumentJson utility method', () => {
  test('Simple valid JSON', () => {
    const jsonData: Record<string, unknown> = {
      lines: [
        {
          type: 'Line',
          pathIds: ['path8272'],
        },
        {
          type: 'Line',
          pathIds: ['path11336'],
        },
      ],
      symbolInstances: [
        {
          type: 'brick',
          pathIds: ['path7868', 'path7870', 'path7872', 'path7874'],
        },
      ],
      connections: [
        {
          start: 'path7868-path7870-path7872-path7874',
          end: 'path11336',
          direction: 'unknown',
        },
        {
          start: 'path8272',
          end: 'path11336',
          direction: 'unknown',
        },
      ],
    };
    const isValid = isValidGraphDocumentJson(jsonData);
    expect(isValid).toEqual(true);
  });

  test('Graph missing symbol instances', () => {
    const jsonData: Record<string, unknown> = {
      lines: [
        {
          type: 'Line',
          pathIds: ['path8272'],
        },
        {
          type: 'Line',
          pathIds: ['path11336'],
        },
      ],
    };
    const isValid = isValidGraphDocumentJson(jsonData);
    expect(isValid).toEqual(false);
  });
});
