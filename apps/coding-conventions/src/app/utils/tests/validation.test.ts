import { systemFixtures, conventionFixtures } from '../../__fixtures/general';
import { Convention } from '../../types';
import {
  backTrackingIsValid,
  BackTrackInterface,
  getConventionsWithSeperators,
  validate,
} from '../validation';

describe('backtracking Validation', () => {
  const system = systemFixtures.find((item) => item.id === '123');
  const conventions = conventionFixtures.filter(
    (item) => item.systemId === '123'
  );

  it('should return valid tags', () => {
    const listOfValidTags = [
      'ZZZZZZ 10-10-10 NNN',
      'ZZZZZZ 10-10-01 NNN',
      'ZZZZZZ 10-AB-05 NNN',
      'ZZZZZZ 10-10-AV NNN',
    ];
    expect(system).not.toBeUndefined();
    if (!system) return;

    expect(validate(system, conventions)).toEqual(listOfValidTags);
  });

  it('should not be valid if we dont include seperators', () => {
    const listOfValidTags = ['ZZZZZZ 101010 NNN'];
    expect(system).not.toBeUndefined();
    if (!system) return;
    const transformedConventions = getConventionsWithSeperators(
      system,
      conventions
    );

    listOfValidTags.forEach((item) => {
      const previousMatches: BackTrackInterface[] = [];
      const isValid = backTrackingIsValid(
        item,
        transformedConventions,
        previousMatches
      );

      expect(isValid).toBe(false);
    });
  });

  // ranges are hard I think. e.g 10-10-1 to 10-10-10. Make sure that variable length ranges works.
  it('if relaxed, should match both 1 and 10', () => {
    const listOfValidTags = ['1', '10'];
    const conventions: Convention[] = [
      {
        start: 7,
        end: 9,
        keyword: 'NN',
        id: 'ABC',
        name: 'System',
        systemId: '13',
        definitions: [
          {
            type: 'Range',
            value: [0, 10],
            minimumCharacterLength: 1, // setting this to 1 triggers such that 1 and 10 is valid
            description: 'Unit Number',
            id: 'unitNumber-0-10',
          },
        ],
      },
    ];

    listOfValidTags.forEach((item) => {
      const previousMatches: BackTrackInterface[] = [];
      const isValid = backTrackingIsValid(item, conventions, previousMatches);
      expect(isValid).toBe(true);
    });
  });

  it('should allow skipping optional fields', () => {
    const listOfValidTags = ['10ABC2', '102', '10'];
    const conventions: Convention[] = [
      {
        start: 0,
        end: 2,
        keyword: 'NN',
        id: 'ABC',
        name: 'System',
        systemId: '123',
        definitions: [
          {
            type: 'Range',
            value: [0, 10],
            minimumCharacterLength: 1,
            description: 'Unit Number',
            id: 'SystemNumber-0-10',
          },
        ],
      },
      {
        start: 2,
        end: 5,
        keyword: 'NN',
        id: 'ABCD',
        optional: true,
        systemId: '123',
        name: 'optional field',
        definitions: [
          {
            type: 'Abbreviation',
            key: 'ABC',
            description: 'Unit Number',
            id: 'optionalField-ABC',
          },
        ],
      },
      {
        start: 5,
        end: 6,
        keyword: 'NN',
        id: 'ABCDE',
        optional: true,
        name: 'optional field',
        systemId: '123',
        definitions: [
          {
            type: 'Abbreviation',
            key: '2',
            description: 'Unit Number',
            id: 'unit-2',
          },
        ],
      },
    ];

    listOfValidTags.forEach((item) => {
      const previousMatches: BackTrackInterface[] = [];
      const isValid = backTrackingIsValid(item, conventions, previousMatches);
      expect(isValid).toBe(true);
    });
  });

  it('should not allow skipping non-optional fields', () => {
    const listOfValidTags = ['10ABC2', '10ABC'];
    const listOFInvalidTags = ['102', '10', '10AB2', 'ABC2'];
    const conventions: Convention[] = [
      {
        start: 0,
        end: 2,
        keyword: 'NN',
        id: 'ABC',
        name: 'System',
        systemId: '123',
        definitions: [
          {
            type: 'Range',
            value: [0, 10],
            minimumCharacterLength: 1,
            description: 'Unit Number',
            id: 'SystemNumber-0-10',
          },
        ],
      },
      {
        start: 2,
        end: 5,
        keyword: 'NN',
        id: 'ABCD',
        systemId: '123',
        name: 'Non Optional field',
        definitions: [
          {
            type: 'Abbreviation',
            key: 'ABC',
            description: 'Unit Number',
            id: 'optionalField-ABC',
          },
        ],
      },
      {
        start: 5,
        end: 6,
        keyword: 'NN',
        id: 'ABCDE',
        optional: true,
        systemId: '123',
        name: 'optional field',
        definitions: [
          {
            type: 'Abbreviation',
            key: '2',
            description: 'Unit Number',
            id: 'unit-2',
          },
        ],
      },
    ];

    listOfValidTags.forEach((item) => {
      const previousMatches: BackTrackInterface[] = [];
      const isValid = backTrackingIsValid(item, conventions, previousMatches);
      expect(isValid).toBe(true);
    });

    listOFInvalidTags.forEach((item) => {
      const previousMatches: BackTrackInterface[] = [];
      const isValid = backTrackingIsValid(item, conventions, previousMatches);
      expect(isValid).toBe(false);
    });
  });
});
