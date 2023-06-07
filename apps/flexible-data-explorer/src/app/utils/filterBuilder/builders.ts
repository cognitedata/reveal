import { Operator } from '../../containers/search/Filter/operators';
import { DateRange, NumericRange } from '../../containers/search/Filter/types';

export const builders: Record<
  Operator,
  (field: string, value: any) => Record<string, unknown>
> = {
  [Operator.STARTS_WITH]: (field: string, value: string) => ({
    [field]: { prefix: value },
  }),
  [Operator.NOT_STARTS_WITH]: (field: string, value: string) => ({
    not: builders[Operator.STARTS_WITH](field, value),
  }),

  [Operator.CONTAINS]: (field: string, value: string) => ({
    [field]: { in: value },
  }),
  [Operator.NOT_CONTAINS]: (field: string, value: string) => ({
    not: builders[Operator.CONTAINS](field, value),
  }),

  [Operator.BETWEEN]: (field: string, value: NumericRange | DateRange) => ({
    and: {
      [field]: { gte: value[0] },
      [field]: { lte: value[1] },
    },
  }),
  [Operator.NOT_BETWEEN]: (field: string, value: NumericRange | DateRange) => ({
    not: builders[Operator.BETWEEN](field, value),
  }),

  [Operator.GREATER_THAN]: (field: string, value: number) => ({
    [field]: { gt: value },
  }),
  [Operator.LESS_THAN]: (field: string, value: number) => ({
    [field]: { lt: value },
  }),

  [Operator.EQUALS]: (
    field: string,
    value: string | number | Date | boolean
  ) => ({
    [field]: { eq: value },
  }),
  [Operator.NOT_EQUALS]: (
    field: string,
    value: string | number | Date | boolean
  ) => ({
    not: builders[Operator.EQUALS](field, value),
  }),

  [Operator.BEFORE]: (field: string, value: Date) => ({
    [field]: { lt: value },
  }),
  [Operator.NOT_BEFORE]: (field: string, value: Date) => ({
    not: builders[Operator.BEFORE](field, value),
  }),

  [Operator.AFTER]: (field: string, value: Date) => ({
    [field]: { gt: value },
  }),
  [Operator.NOT_AFTER]: (field: string, value: Date) => ({
    not: builders[Operator.AFTER](field, value),
  }),

  [Operator.ON]: (field: string, value: Date) => ({
    [field]: { eq: value },
  }),
  [Operator.NOT_ON]: (field: string, value: Date) => ({
    not: builders[Operator.ON](field, value),
  }),

  [Operator.IS_TRUE]: (field: string) => ({
    [field]: { eq: true },
  }),
  [Operator.IS_FALSE]: (field: string) => ({
    [field]: { eq: false },
  }),

  [Operator.IS_SET]: (field: string) => ({
    [field]: { isNull: false },
  }),
  [Operator.IS_NOT_SET]: (field: string) => ({
    [field]: { isNull: true },
  }),
};
