import { Operator } from '../../../containers/Filter/types';
import { builders } from '../builders';

const FIELD = 'someField';
const STRING = 'someString';
const NUMBER = 10;
const NUMERIC_RANGE = [0, 10];
const DATE = new Date();

const expectBuilderResult = (operator: Operator, value: any) => {
  const builder = builders[operator];
  const result = builder(FIELD, value);

  return {
    toEqual: (expectedResult: Record<string, unknown>) => {
      it(`operator: ${operator}`, () => {
        expect(result).toStrictEqual(expectedResult);
      });
    },
  };
};

describe('utils/builders', () => {
  expectBuilderResult(Operator.STARTS_WITH, STRING).toEqual({
    [FIELD]: { prefix: STRING },
  });

  expectBuilderResult(Operator.NOT_STARTS_WITH, STRING).toEqual({
    not: { [FIELD]: { prefix: STRING } },
  });

  expectBuilderResult(Operator.BETWEEN, NUMERIC_RANGE).toEqual({
    [FIELD]: {
      gte: NUMERIC_RANGE[0],
      lte: NUMERIC_RANGE[1],
    },
  });

  expectBuilderResult(Operator.NOT_BETWEEN, NUMERIC_RANGE).toEqual({
    not: {
      [FIELD]: {
        gte: NUMERIC_RANGE[0],
        lte: NUMERIC_RANGE[1],
      },
    },
  });

  expectBuilderResult(Operator.GREATER_THAN, NUMBER).toEqual({
    [FIELD]: { gt: NUMBER },
  });

  expectBuilderResult(Operator.LESS_THAN, NUMBER).toEqual({
    [FIELD]: { lt: NUMBER },
  });

  expectBuilderResult(Operator.LESS_THAN, NUMBER).toEqual({
    [FIELD]: { lt: NUMBER },
  });

  expectBuilderResult(Operator.EQUALS, NUMBER).toEqual({
    [FIELD]: { eq: NUMBER },
  });

  expectBuilderResult(Operator.NOT_EQUALS, NUMBER).toEqual({
    not: { [FIELD]: { eq: NUMBER } },
  });

  expectBuilderResult(Operator.BEFORE, DATE).toEqual({
    [FIELD]: { lt: DATE },
  });

  expectBuilderResult(Operator.NOT_BEFORE, DATE).toEqual({
    not: { [FIELD]: { lt: DATE } },
  });

  expectBuilderResult(Operator.AFTER, DATE).toEqual({
    [FIELD]: { gt: DATE },
  });

  expectBuilderResult(Operator.NOT_AFTER, DATE).toEqual({
    not: { [FIELD]: { gt: DATE } },
  });

  expectBuilderResult(Operator.ON, DATE).toEqual({
    [FIELD]: { eq: DATE },
  });

  expectBuilderResult(Operator.NOT_ON, DATE).toEqual({
    not: { [FIELD]: { eq: DATE } },
  });

  expectBuilderResult(Operator.IS_TRUE, null).toEqual({
    [FIELD]: { eq: true },
  });

  expectBuilderResult(Operator.IS_FALSE, null).toEqual({
    [FIELD]: { eq: false },
  });

  expectBuilderResult(Operator.IS_SET, null).toEqual({
    [FIELD]: { isNull: false },
  });

  expectBuilderResult(Operator.IS_NOT_SET, null).toEqual({
    [FIELD]: { isNull: true },
  });
});
