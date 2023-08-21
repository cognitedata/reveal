import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

export const extractProperties = (item: {
  [x: string]: unknown;
  externalId: string;
  description?: string | undefined;
}) => {
  return Object.entries(item).reduce((acc, [key, value]) => {
    if (key === 'externalId' || key === 'description' || key === 'space') {
      return acc;
    }

    if (value !== undefined && isString(value)) {
      return [...acc, { key, value }];
    }
    if (value !== undefined && isNumber(value)) {
      return [...acc, { key, value: `${value}` }];
    }

    return acc;
  }, [] as { key: string; value: string }[]);
};

export const recursiveConcatItems = (data?: any) => {
  return Object.values(data || []).flatMap(({ items }: any) =>
    items.concat(
      items
        .map((el: any) =>
          Object.values(el)
            .filter(
              (val: any) => val && typeof val === 'object' && 'items' in val
            )
            .map((val: any) => recursiveConcatItems({ val }))
            .flat()
        )
        .flat()
    )
  );
};
