/* eslint camelcase: 0 */
import styled from 'styled-components';
import { Icon, Select, Checkbox, Tooltip } from '@cognite/cogs.js';
import {
  Operation,
  OperationParameters,
  OperationParametersTypeEnum,
} from '@cognite/calculation-backend';
import { StorableNode } from 'models/chart/types';
import { trackUsage } from 'services/metrics';
import { useAvailableOps } from 'components/NodeEditor/AvailableOps';
import ToolboxFunctionDropdown from 'components/ToolboxFunctionDropdown/ToolboxFunctionDropdown';
import { getConfigFromDspFunction, transformParamInput } from '../transforms';
import { ConfigPanelComponentProps } from '.';
import { DSPToolboxFunctionInput } from './DSPToolboxFunctionInput';
import { getCategoriesFromToolFunctions } from './utils';

type OperationSelection = {
  op: string;
  version?: string;
};

type FunctionData = {
  [key: string]: any;
  toolFunction?: OperationSelection;
};

export const effect = async (funcData: FunctionData) => {
  if (!funcData.toolFunction) {
    throw new Error('No external id given in config');
  }
  if (!funcData.tenant) {
    throw new Error('Did not get a tenant');
  }

  return {};
};

export const effectId = 'TOOLBOX_FUNCTION';

export const ConfigPanel = ({
  node,
  nodes,
  onUpdateNode,
}: ConfigPanelComponentProps) => {
  const { functionData } = node;
  const [isLoading, error, operations] = useAvailableOps();

  const selectedOperation = operations?.find(
    (operation) => operation.op === functionData?.toolFunction?.op
  );

  const selectedVersion = (selectedOperation?.versions ?? []).find(
    (operationVersion) =>
      operationVersion.version === functionData?.toolFunction?.version
  );

  const getCategories = (availableOperations: Operation[]) => {
    const categories: { [key: string]: Operation[] } = {};
    categories.Recent = [];

    nodes?.forEach((n) => {
      const toolFunction = n?.functionData?.toolFunction;

      if (toolFunction) {
        const isFunctionInRecent = categories.Recent.some(
          ({ op }) => op.toLowerCase() === toolFunction.op.toLowerCase()
        );

        if (!isFunctionInRecent) {
          const operation = availableOperations.find(
            (op) => op.op.toLowerCase() === toolFunction.op.toLowerCase()
          );

          if (operation) {
            categories.Recent.push(operation);
          }
        }
      }
    });

    return {
      ...categories,
      ...getCategoriesFromToolFunctions(availableOperations),
    };
  };

  const onFunctionSelected = (func: Operation) => {
    const defaultVersionOfFunction = func.versions.find(
      ({ version }) => version === '1.0'
    )!;

    if (!defaultVersionOfFunction) {
      throw new Error(
        `Default version (1.0) of operation "${func.op}" is missing from definition`
      );
    }

    const inputPins = (
      getConfigFromDspFunction(defaultVersionOfFunction).input || []
    )
      .filter((input) => input.pin)
      .map((input) => ({
        id: input.field,
        title: input.name,
        types: input.types,
      }));

    const outputPins = (
      getConfigFromDspFunction(defaultVersionOfFunction).output || []
    ).map((output) => ({
      id: `out-${output.field}`,
      title: output.name,
      type: output.type,
    }));

    onUpdateNode({
      inputPins,
      outputPins,
      title: defaultVersionOfFunction.name,
      functionData: {
        ...functionData,
        toolFunction: {
          op: func.op,
          version: defaultVersionOfFunction.version,
        },
      },
    });

    trackUsage('ChartView.SelectFunction', {
      function: defaultVersionOfFunction.name,
    });
  };

  const renderParameter = (parameters: OperationParameters[]) => {
    return parameters.map(
      ({ name, param, description, type, default_value, options = [] }) => {
        const hasAvailableOptions = !!options?.length;

        const inputElement = hasAvailableOptions ? (
          <Select
            theme="dark"
            value={
              (functionData[param] &&
                options?.find(({ value }) => value === functionData[param])) ??
              default_value
            }
            options={(options || []).map((option) => ({
              label: option.label || option.value,
              value: option.value,
            }))}
            onChange={(option: { label: string; value: string }) => {
              onUpdateNode({
                functionData: {
                  ...node.functionData,
                  [param]: transformParamInput(type, option.value),
                },
              });
            }}
            closeMenuOnSelect
          />
        ) : (
          <DSPToolboxFunctionInput
            key={param}
            id={param}
            defaultValue={functionData[param] ?? (default_value || '')}
            onChange={(value) => {
              onUpdateNode({
                functionData: {
                  ...node.functionData,
                  [param]: transformParamInput(type, value),
                },
              });
            }}
          />
        );

        return (
          <div style={{ marginTop: 8 }}>
            <Tooltip
              disabled={!description}
              theme="cogs-primary"
              content={description}
            >
              <ParameterTitle>
                {name || param} <ParameterIcon type="Info" size={12} />
              </ParameterTitle>
            </Tooltip>
            {type === OperationParametersTypeEnum.Bool ? (
              <Checkbox
                onChange={(nextState: boolean) => {
                  onUpdateNode({
                    functionData: {
                      ...node.functionData,
                      [param]: nextState,
                    },
                  });
                }}
                name={param}
                value={functionData[param]}
              />
            ) : (
              inputElement
            )}
          </div>
        );
      }
    );
  };

  const parameters = (selectedVersion?.parameters ||
    functionData?.toolFunction?.parameters) as
    | OperationParameters[]
    | undefined;

  return (
    <>
      <h4>Tool Function</h4>
      {error && <Icon style={{ color: 'white' }} type="CloseLarge" />}
      {isLoading && <Icon style={{ color: 'white' }} type="Loader" />}
      {operations && (
        <ToolboxFunctionDropdown
          categories={getCategories(operations)}
          initialFunction={functionData?.toolFunction}
          onFunctionSelected={onFunctionSelected}
        />
      )}
      {!!parameters?.length && renderParameter(parameters)}
    </>
  );
};

const ParameterTitle = styled.h4`
  display: inline-flex;
  align-items: center;
`;

const ParameterIcon = styled(Icon)`
  margin-left: 5px;
`;

export const node = {
  title: 'Function',
  subtitle: 'Function',
  color: '#9118af',
  icon: 'Function',
  inputPins: [],
  outputPins: [],
  functionEffectReference: effectId,
  functionData: {
    toolFunction: {},
  },
} as StorableNode;
