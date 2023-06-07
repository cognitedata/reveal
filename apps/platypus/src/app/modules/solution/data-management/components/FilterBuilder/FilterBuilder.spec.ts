import { JsonTree } from '@react-awesome-query-builder/ui';

import { constructGraphQLFilterGroup } from './FilterBuilder';

describe('constructGraphQLFilterGroup', () => {
  it('should return undefined when passed an empty tree', () => {
    const tree = {} as JsonTree;
    const result = constructGraphQLFilterGroup(tree);
    expect(result).toBeUndefined();
  });
  it('should correctly build a filter object from a valid group tree', () => {
    const tree: JsonTree = {
      type: 'group',
      properties: {
        conjunction: 'AND',
      },
      children1: [
        {
          type: 'rule',
          properties: {
            field: 'name',
            operator: 'equal',
            value: ['John'],
          },
        },
        {
          type: 'rule',
          properties: {
            field: 'age',
            operator: 'greaterThan',
            value: ['25'],
          },
        },
        {
          type: 'group',
          properties: {
            conjunction: 'OR',
            not: true,
          },
          children1: [
            {
              type: 'rule',
              properties: {
                field: 'email',
                operator: 'endsWith',
                value: ['example.com'],
              },
            },
            {
              type: 'group',
              properties: {
                conjunction: 'AND',
              },
              children1: [
                {
                  type: 'rule',
                  properties: {
                    field: 'phone',
                    operator: 'contains',
                    value: ['123'],
                  },
                },
                {
                  type: 'rule',
                  properties: {
                    field: 'country',
                    operator: 'notEqual',
                    value: ['USA'],
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    const result = constructGraphQLFilterGroup(tree);
    expect(result).toEqual({
      and: [
        { name: { equal: 'John' } },
        { age: { greaterThan: '25' } },
        {
          not: {
            or: [
              { email: { endsWith: 'example.com' } },
              {
                and: [
                  { phone: { contains: '123' } },
                  { country: { notEqual: 'USA' } },
                ],
              },
            ],
          },
        },
      ],
    });
  });
  it('should handle a group with nested "isNotNull" operator', () => {
    const tree: JsonTree = {
      type: 'group',
      children1: [
        {
          type: 'rule',
          properties: {
            field: 'age',
            operator: 'isNotNull',
            value: [],
          },
        },
      ],
    };
    const result = constructGraphQLFilterGroup(tree);
    expect(result).toEqual({ and: [{ age: { isNull: false } }] });
  });
});
