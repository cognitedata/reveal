import React, { useState, useCallback, useEffect } from 'react';

import styled from 'styled-components';

import { FdmMixerApiService } from '@platypus/platypus-core';
import type {
  JsonGroup,
  Config,
  ImmutableTree,
  BuilderProps,
  Types,
  Type,
  TextWidgetProps,
  NumberWidgetProps,
  JsonItem,
} from '@react-awesome-query-builder/ui';
import {
  Utils as QbUtils,
  Query,
  Builder,
  BasicConfig,
  JsonTree,
} from '@react-awesome-query-builder/ui';
import {
  GraphQLInputFieldMap,
  GraphQLInputObjectType,
  buildClientSchema,
  getIntrospectionQuery,
} from 'graphql';
import isString from 'lodash/isString';
import merge from 'lodash/merge';
import setWith from 'lodash/setWith';

import { Modal, toast } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { useTranslation } from '../../../../hooks/useTranslation';

import {
  ConjunctionButtons,
  FilterBuilderButton,
  FilterBuilderFunctionSelect,
  InputWidget,
} from './elements';
const InitialConfig = BasicConfig;

const settings = {
  ...InitialConfig.settings,
  renderField: FilterBuilderFunctionSelect,
  renderOperator: FilterBuilderFunctionSelect,
  renderFunc: FilterBuilderFunctionSelect,
  renderConjs: ConjunctionButtons,
  renderButton: FilterBuilderButton,
};

const initialConfig: Config = {
  ...InitialConfig,
  conjunctions: {
    AND: {
      ...InitialConfig.conjunctions.AND,
      sqlConj: 'and',
    },
    OR: {
      ...InitialConfig.conjunctions.OR,
      sqlConj: 'or',
    },
  },
  widgets: {
    ...InitialConfig.widgets,
    String: {
      ...InitialConfig.widgets.text,
      jsType: '',
      factory: (props) => <InputWidget {...(props as TextWidgetProps)} />,
    },
    JSONObject: {
      ...InitialConfig.widgets.text,
      jsType: '',
      factory: (props) => <InputWidget {...(props as TextWidgetProps)} />,
    },
    ID: {
      ...InitialConfig.widgets.text,
      jsType: '',
      factory: (props) => <InputWidget {...(props as TextWidgetProps)} />,
    },
    Int: {
      ...InitialConfig.widgets.number,
      step: 1,
      jsType: '',
      factory: (props) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <InputWidget {...(props as NumberWidgetProps)} inputType="number" />
      ),
    },
    Int32: {
      ...InitialConfig.widgets.number,
      step: 1,
      jsType: '',
      formatValue: (val) => `${Math.floor(Number(val))}`,
      factory: (props) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <InputWidget {...(props as NumberWidgetProps)} inputType="number" />
      ),
    },
    Int64: {
      ...InitialConfig.widgets.number,
      step: 1,
      jsType: '',
      formatValue: (val) => `${Math.floor(Number(val))}`,
      factory: (props) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <InputWidget {...(props as NumberWidgetProps)} inputType="number" />
      ),
    },
    Float: {
      ...InitialConfig.widgets.number,
      jsType: '',
      factory: (props) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <InputWidget {...(props as NumberWidgetProps)} inputType="number" />
      ),
    },
    Float32: {
      ...InitialConfig.widgets.number,
      jsType: '',
      factory: (props) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <InputWidget {...(props as NumberWidgetProps)} inputType="number" />
      ),
    },
    Float64: {
      ...InitialConfig.widgets.number,
      jsType: '',
      factory: (props) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <InputWidget {...(props as NumberWidgetProps)} inputType="number" />
      ),
    },
    Date: {
      ...InitialConfig.widgets.date,
      jsType: '',
      factory: (props) => (
        <InputWidget {...(props as TextWidgetProps)} inputType="date" />
      ),
    },
    Timestamp: {
      ...InitialConfig.widgets.datetime,
      jsType: '',
      valueFormat: '',
      factory: (props) => (
        <InputWidget
          {...(props as TextWidgetProps)}
          inputType="datetime-local"
        />
      ),
    },
    Boolean: {
      ...InitialConfig.widgets.boolean,
      jsType: '',
      factory: (props) => (
        <InputWidget {...(props as TextWidgetProps)} inputType="boolean" />
      ),
    },
  },
  operators: {
    eq: {
      ...InitialConfig.operators.equal,
      label: 'Equals',
    },
    neq: {
      ...InitialConfig.operators.not_equal,
      label: 'Not Equals',
    },
    lte: {
      ...InitialConfig.operators.less_or_equal,
      label: 'Less or equal than',
    },
    gte: {
      ...InitialConfig.operators.greater_or_equal,
      label: 'Greater or equal than',
    },
    lt: {
      ...InitialConfig.operators.less,
      label: 'Less than',
    },
    gt: {
      ...InitialConfig.operators.greater,
      label: 'Greater than',
    },
    isNull: {
      ...InitialConfig.operators.is_empty,
      label: 'Is empty',
    },
    isNotNull: {
      ...InitialConfig.operators.is_not_empty,
      label: 'Is not empty',
    },
    prefix: {
      ...InitialConfig.operators.starts_with,
      label: 'Starts with',
    },
    in: {
      ...InitialConfig.operators.multiselect_contains,
      label: 'Is one of',
    },
    containsAll: {
      ...InitialConfig.operators.multiselect_equals,
      label: 'Contains all of',
    },
    containsAny: {
      ...InitialConfig.operators.multiselect_contains,
      label: 'Contains some of',
    },
  },
  settings,
};

// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue: JsonGroup = { id: QbUtils.uuid(), type: 'group' };

export const AIFilterBuilder = ({
  visible,
  onOk,
  onCancel,
  type,
  dataModelExternalId,
  version,
  space,
  initialFilter,
}: {
  initialFilter: any;
  visible: boolean;
  onOk: (newFilter: any) => void;
  onCancel: () => void;
  type: string;
  dataModelExternalId: string;
  version: string;
  space: string;
}) => {
  const [config, setConfig] = useState<Config>(initialConfig);
  const [state, setState] = useState({
    tree: QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
    config: config,
  });
  const sdk = useSDK();

  useEffect(() => {
    if (visible) {
      setState({
        tree: QbUtils.checkTree(
          QbUtils.loadTree(
            (constructJsonTreeFromFilter(initialFilter) as JsonTree) ||
              queryValue
          ),
          config
        ),
        config: config,
      });
    }
  }, [initialFilter, config, visible]);

  useEffect(() => {
    new FdmMixerApiService(sdk)
      .runQuery({
        dataModelId: dataModelExternalId,
        space,
        schemaVersion: version,
        graphQlParams: { query: getIntrospectionQuery() },
      })
      .then((response) => {
        const schema = buildClientSchema(response.data);
        const a = schema.getType(
          `_List${type}Filter`
        ) as GraphQLInputObjectType;

        //https://react-querybuilder.js.org/demo#addRuleToNewGroups=false&autoSelectField=true&autoSelectOperator=true&debugMode=false&disabled=false&enableDragAndDrop=false&independentCombinators=false&justifiedLayout=false&listsAsArrays=false&parseNumbers=false&resetOnFieldChange=true&resetOnOperatorChange=false&showBranches=false&showCloneButtons=false&showCombinatorsBetweenRules=false&showLockButtons=false&showNotToggle=false&validateQuery=false
        if (a) {
          const mapping = processInputMap(a.getFields(), a.name);
          const newFields = filterMapToFields(mapping, a.name);
          const types = Object.entries(mapping)
            .filter(([key]) => key.endsWith('Condition'))
            .reduce((prev, [key, value]) => {
              const typeName = key.substring(
                1,
                key.length - 'Condition'.length
              );
              return {
                ...prev,
                [typeName]: merge(getFieldType(typeName), {
                  mainWidget: typeName,
                  defaultOperator: 'eq',
                  type: typeName,
                  widgets: {
                    [typeName]: {
                      operators: value
                        .map((el) => el.key)
                        .concat('containsAll', 'containsAny'),
                    },
                  },
                }),
              };
            }, {} as Types);
          setConfig((currConfig) => ({
            ...currConfig,
            fields: newFields,
            types,
          }));
        }
      });
  }, [dataModelExternalId, type, space, version, sdk]);

  const onChange = useCallback(
    (immutableTree: ImmutableTree, newConfig: Config) => {
      // Tip: for better performance you can apply `throttle` - see `examples/demo`
      setState((prevState) => ({
        ...prevState,
        tree: immutableTree,
        config: newConfig,
      }));
    },
    []
  );

  const renderBuilder = useCallback(
    (props: BuilderProps) => <Builder {...props} />,
    []
  );

  const { t } = useTranslation();

  return (
    <Modal
      title={`${t('AI_FILTER')} ${type}`}
      size="large"
      visible={visible}
      className="filter-builder"
      onOk={() => {
        try {
          onOk(constructGraphQLFilterGroup(QbUtils.getTree(state.tree)));
        } catch (error) {
          toast.error(t('AI_FILTER_ERROR'));
        }
      }}
      okText={t('AI_FILTER_CONFIRM_UPDATE')}
      onCancel={onCancel}
    >
      <Wrapper>
        <Query
          {...config}
          value={state.tree}
          onChange={onChange}
          renderBuilder={renderBuilder}
        />
      </Wrapper>
    </Modal>
  );
};

type FilterMap = {
  [key in string]: {
    key: string;
    field: string;
    custom?: boolean;
    list?: boolean;
    operator?: boolean;
  }[];
};

const processInputMap = (
  map: GraphQLInputFieldMap,
  root: string,
  mapping: FilterMap = {}
) => {
  Object.entries(map).forEach(([key, value]) => {
    if (!mapping[root]) {
      mapping[root] = [];
    }
    if ('name' in value.type) {
      if ('getFields' in value.type && mapping[value.type.name] === undefined) {
        processInputMap(value.type.getFields(), value.type.name, mapping);
      }
      mapping[root].push({
        key,
        field: value.type.name,
        ...(mapping[value.type.name] && { custom: true }),
      });
    } else if (
      'ofType' in value.type &&
      'ofType' in value.type.ofType &&
      'name' in value.type.ofType.ofType
    ) {
      mapping[root].push({
        key,
        field: value.type.ofType.ofType.name,
        list: true,
        ...(mapping[value.type.ofType.ofType.name] && { custom: true }),
      });
    } else if ('ofType' in value.type && 'name' in value.type.ofType) {
      mapping[root].push({
        key,
        field: value.type.ofType.name,
        ...(mapping[value.type.ofType.name] && {
          custom: true,
        }),
      });
    }
  });
  return mapping;
};

const filterMapToFields = (
  mapping: FilterMap,
  key: string,
  omit = ['and', 'or', 'not'],
  visitedKeys: string[] = []
): Config['fields'] => {
  return mapping[key].reduce((prev, el) => {
    if (omit.includes(el.key)) {
      return prev;
    }
    if (el.custom) {
      const isNestedFields = mapping[el.field].some((field) => field.custom);
      if (isNestedFields) {
        return {
          ...prev,
          [el.key]: {
            label: el.key,
            tooltip: el.key,
            type: '!struct',
            // recurse only if not previously visited
            subfields: visitedKeys.includes(el.key)
              ? []
              : filterMapToFields(mapping, el.field, omit, [
                  ...visitedKeys,
                  el.key,
                ]),
          },
        };
      }
      const operators = mapping[el.field].map((op) => op.key);
      if (operators.includes('isNull')) {
        operators.push('isNotNull');
      }
      operators.sort();
      return {
        ...prev,
        [el.key]: {
          label: el.key,
          type: mapping[el.field][0].field,
          operators: operators,
          defaultOperator: mapping[el.field][0].key,
          valueSources: ['value'],
        },
      };
    }
    return {
      ...prev,
      [el.key]: {
        label: el.key,
        type: mapping[el.field][0].field,
        defaultOperator: mapping[el.field][0].key,
      },
    };
  }, {} as Config['fields']);
};

const getFieldType = (type: string): Type => {
  switch (type) {
    case 'String':
    case 'ID':
      return InitialConfig.types.text;
    case 'Int':
    case 'Int32':
    case 'Int64':
      return {
        ...InitialConfig.types.number,
      };
    case 'Float':
    case 'Float32':
    case 'Float64':
      return InitialConfig.types.number;
    case 'Boolean':
      return InitialConfig.types.boolean;
    case 'Date':
      return InitialConfig.types.date;
    case 'Timestamp':
      return InitialConfig.types.datetime;
    case 'JSONObject':
      return InitialConfig.types.text;
  }
  return InitialConfig.types.text;
};

export const constructGraphQLFilterGroup = (tree: JsonTree) => {
  if (tree.type === 'group' && Array.isArray(tree.children1)) {
    const filters = tree.children1.filter(
      (item) =>
        item.type !== 'rule' ||
        (item.properties.field &&
          item.properties.operator &&
          item.properties.value.filter((el) => !!el))
    );
    if (filters.length === 0) {
      return undefined;
    }
    const obj: any = {
      [(tree.properties?.conjunction || 'and').toLowerCase()]: filters
        .map((item) => {
          switch (item.type) {
            case 'group':
              return constructGraphQLFilterGroup(item);
            case 'rule':
              if (!item.properties.field || !isString(item.properties.field)) {
                throw new Error('Unable to build filter');
              }
              // check for nested, this should be fixed later
              if (item.properties.operator === 'isNotNull') {
                return setWith(
                  {},
                  item.properties.field,
                  {
                    isNull: false,
                  },
                  Object
                );
              }
              if (item.properties.operator === 'isNull') {
                return setWith(
                  {},
                  item.properties.field,
                  {
                    isNull: true,
                  },
                  Object
                );
              }
              return setWith(
                {},
                item.properties.field,
                {
                  [item.properties.operator!]:
                    item.properties.value.length === 1
                      ? item.properties.value[0]
                      : item.properties.value,
                },
                Object
              );
            default:
              throw new Error('Unable to build filter');
          }
        })
        .filter((el) => !!el),
    };
    if (tree.properties?.not) {
      return { not: obj };
    }
    return obj;
  }
};
export const constructJsonTreeFromFilter = (
  filter: any
): JsonTree | JsonItem => {
  if (Array.isArray(filter)) {
    return {
      id: QbUtils.uuid(),
      type: 'group',
      properties: {
        conjunction: 'AND',
      },
      children1: filter.map((el: any) =>
        constructJsonTreeFromFilter(el)
      ) as JsonItem[],
    };
  }
  if (
    filter === null ||
    filter === undefined ||
    Object.keys(filter).length === 0
  ) {
    return {
      id: QbUtils.uuid(),
      type: 'group',
      properties: { conjunction: 'AND' },
      children1: [],
    };
  }
  let key = Object.keys(filter)[0];
  let value = filter[key];
  let not = false;
  if (key === 'not') {
    key = Object.keys(value)[0];
    value = value[key];
    not = true;
  }
  if (key === 'and' || key === 'or') {
    return {
      id: QbUtils.uuid(),
      type: 'group',
      properties: {
        conjunction: key.toUpperCase(),
        not,
      },
      children1: value.map((el: any) => constructJsonTreeFromFilter(el)),
    };
  }
  if (
    value === null ||
    value === undefined ||
    Object.keys(value).length === 0
  ) {
    return {
      id: QbUtils.uuid(),
      type: 'group',
      properties: { conjunction: 'AND' },
      children1: [],
    };
  }
  let operator = Object.keys(value)[0];
  value = value[operator];
  while (typeof value === 'object' && Array.isArray(value) === false) {
    key += `.${operator}`;
    operator = Object.keys(value)[0];
    value = value[operator];
  }
  ({ operator, value } = convertGqlOperatorToJson(operator, value));

  return {
    id: QbUtils.uuid(),
    type: 'rule',
    properties: {
      field: key,
      operator,
      value,
      valueSrc: ['value'],
    },
  };
};

const convertGqlOperatorToJson = (operator: string, value: any) => {
  if (operator === 'isNull') {
    if (value === true) {
      return { operator: 'isNull', value: [] };
    }
    return { operator: 'isNotNull', value: [] };
  }
  return {
    operator,
    value: Array.isArray(value) ? value : [value],
  };
};

const Wrapper = styled.div`
  .group {
    background: none;
    border: none;
    margin-left: 1px;
    padding-bottom: 2px;
  }
  .group-container .group-container {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 12px;
  }
  .rule--body {
    display: flex;
  }
  .rule {
    background: none;
  }
  .rule--body > div {
    flex: 1;
    max-width: 33.333%;
    position: relative;
    display: block;
  }
  .rule--field {
    width: 100%;
    display: block;
  }
  .widget--widget,
  .rule--widget {
    width: 100%;
    display: flex;
  }
  .group--header {
    padding-top: 8px;
  }

  .cogs-select {
    background: #fff;
  }
`;
