/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type DatetimeExpression } from '../types';
import { checkDatetimeExpressionStatement } from './checkDatetimeExpressionStatement';
import { triggerTypeData3 } from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';

describe('checkDatetimeExpressionStatement', () => {
  it('should return true for before condition', () => {
    const expression: DatetimeExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'before', parameter: '2025-02-20T12:00:00Z' },
      type: 'datetimeExpression'
    };

    const result = checkDatetimeExpressionStatement(triggerTypeData3, expression);
    expect(result).toBe(true);
  });

  it('should return false for notBefore condition', () => {
    const expression: DatetimeExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'notBefore', parameter: '2025-02-20T12:00:00Z' },
      type: 'datetimeExpression'
    };

    const result = checkDatetimeExpressionStatement(triggerTypeData3, expression);
    expect(result).toBe(false);
  });

  it('should return true for onOrBefore condition', () => {
    const expression: DatetimeExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'onOrBefore', parameter: '2025-02-19T12:00:00Z' },
      type: 'datetimeExpression'
    };

    const result = checkDatetimeExpressionStatement(triggerTypeData3, expression);
    expect(result).toBe(true);
  });

  it('should return true for between condition', () => {
    const expression: DatetimeExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: {
        type: 'between',
        lowerBound: '2025-02-18T12:00:00Z',
        upperBound: '2025-02-20T12:00:00Z'
      },
      type: 'datetimeExpression'
    };

    const result = checkDatetimeExpressionStatement(triggerTypeData3, expression);
    expect(result).toBe(true);
  });

  it('should return false for notBetween condition', () => {
    const expression: DatetimeExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: {
        type: 'notBetween',
        lowerBound: '2025-02-18T12:00:00Z',
        upperBound: '2025-02-20T12:00:00Z'
      },
      type: 'datetimeExpression'
    };

    const result = checkDatetimeExpressionStatement(triggerTypeData3, expression);
    expect(result).toBe(false);
  });

  it('should return true for after condition', () => {
    const expression: DatetimeExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'after', parameter: '2025-02-18T12:00:00Z' },
      type: 'datetimeExpression'
    };

    const result = checkDatetimeExpressionStatement(triggerTypeData3, expression);
    expect(result).toBe(true);
  });

  it('should return false for notAfter condition', () => {
    const expression: DatetimeExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'notAfter', parameter: '2025-02-18T12:00:00Z' },
      type: 'datetimeExpression'
    };

    const result = checkDatetimeExpressionStatement(triggerTypeData3, expression);
    expect(result).toBe(false);
  });

  it('should return true for onOrAfter condition', () => {
    const expression: DatetimeExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'onOrAfter', parameter: '2025-02-19T12:00:00Z' },
      type: 'datetimeExpression'
    };

    const result = checkDatetimeExpressionStatement(triggerTypeData3, expression);
    expect(result).toBe(true);
  });

  it('should return true for on condition', () => {
    const expression: DatetimeExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'on', parameter: '2025-02-19T12:00:00Z' },
      type: 'datetimeExpression'
    };

    const result = checkDatetimeExpressionStatement(triggerTypeData3, expression);
    expect(result).toBe(true);
  });

  it('should return false for notOn condition', () => {
    const expression: DatetimeExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'notOn', parameter: '2025-02-19T12:00:00Z' },
      type: 'datetimeExpression'
    };

    const result = checkDatetimeExpressionStatement(triggerTypeData3, expression);
    expect(result).toBe(false);
  });
});
