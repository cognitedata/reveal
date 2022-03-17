import { Operation } from '@cognite/calculation-backend';
import classNames from 'classnames';
import { memo, useEffect, useState } from 'react';
import { NodeProps, Position } from 'react-flow-renderer';
import styled from 'styled-components/macro';
import { Flex } from '@cognite/cogs.js';
import { defaultTranslations } from 'components/NodeEditor/translations';
import { NodeTypes } from '../../types';
import {
  AUTO_ALIGN_PARAM,
  FUNCTION_NODE_DRAG_HANDLE_CLASSNAME,
  PIN_MIN_HEIGHT,
} from '../../constants';
import { NodeWrapper } from '../elements';
import NodeHandle from '../NodeHandle';
import NodeWithActionBar from '../NodeWithActionBar';
import FunctionParameterForm from './FunctionParameterForm/FunctionParameterForm';

export type FunctionNodeDataDehydrated = {
  selectedOperation: { op: string; version: string };
  parameterValues: { [key: string]: string | number | boolean };
};

export type FunctionNodeCallbacks = {
  onParameterValuesChange: (
    nodeId: string,
    formData: { [key: string]: any }
  ) => void;
  onDuplicateNode: (nodeId: string, nodeType: NodeTypes) => void;
  onRemoveNode: (nodeId: string) => void;
};

export type FunctionNodeData = FunctionNodeDataDehydrated &
  FunctionNodeCallbacks & {
    translations: typeof defaultTranslations;
    operation?: Operation;
    readOnly: boolean;
  };

const FunctionNode = memo(
  ({ id, data, selected }: NodeProps<FunctionNodeData>) => {
    const {
      selectedOperation,
      parameterValues,
      onParameterValuesChange,
      onDuplicateNode,
      onRemoveNode,
      operation,
      readOnly,
      translations: t,
    } = data;

    const [areParamsVisible, setAreParamsVisible] = useState<boolean>(false);

    useEffect(() => {
      setAreParamsVisible(false);
    }, [selected]);

    const selectedOperationVersion = operation?.versions.find(
      ({ version }) => version === selectedOperation.version
    );

    if (!selectedOperationVersion) {
      return null;
    }

    const nodeHeight = selectedOperationVersion.inputs.length * PIN_MIN_HEIGHT;

    // Remove auto-align parameter so it's not rendered in the form
    const parameters = (selectedOperationVersion.parameters || []).filter(
      (p) => p.param !== AUTO_ALIGN_PARAM
    );

    const containerClasses = classNames(FUNCTION_NODE_DRAG_HANDLE_CLASSNAME, {
      selected,
    });

    return (
      <NodeWithActionBar
        capabilities={{
          canEdit: !readOnly && parameters.length > 0,
          canDuplicate: !readOnly,
          canRemove: !readOnly,
          canSeeInfo: Boolean(selectedOperationVersion.description),
        }}
        actions={{
          onEditFunctionClick:
            parameters.length > 0
              ? () => setAreParamsVisible((isVisible) => !isVisible)
              : undefined,
          onDuplicateClick: () => onDuplicateNode(id, NodeTypes.CONSTANT),
          onRemoveClick: () => onRemoveNode(id),
        }}
        data={{
          indslFunction: selectedOperationVersion,
        }}
        status={{
          isEditing: areParamsVisible,
        }}
        isActionBarVisible={selected}
        translations={t}
      >
        <NodeWrapper
          className={containerClasses}
          style={{
            minHeight: nodeHeight,
            position: 'relative',
            padding: 10,
          }}
          onDoubleClick={() =>
            parameters.length && setAreParamsVisible((isVisible) => !isVisible)
          }
        >
          <HandleContainer height={nodeHeight} position="left">
            {selectedOperationVersion.inputs.map((input) => (
              <FunctionNodeHandle
                key={input.param}
                id={`${input.param}`}
                type="target"
                position={Position.Left}
              />
            ))}
          </HandleContainer>
          <FunctionName>{selectedOperationVersion.name}</FunctionName>
          {!areParamsVisible && (
            <Flex gap={8} justifyContent="space-between" alignItems="center">
              <div>
                {selectedOperationVersion.inputs.map(({ param, name }) => (
                  <InputName key={param}>{name}</InputName>
                ))}
              </div>
              <div>
                {selectedOperationVersion.outputs.map(({ name }) => (
                  <InputName key={name}>{name}</InputName>
                ))}
              </div>
            </Flex>
          )}
          {areParamsVisible && !!parameters.length && (
            <FunctionParameterForm
              nodeId={id}
              parameters={parameters}
              parameterValues={parameterValues}
              onParameterValuesChange={(nodeId, formData) => {
                onParameterValuesChange(nodeId, formData);
                setAreParamsVisible(false);
              }}
              translations={t}
            />
          )}
          <HandleContainer height={nodeHeight} position="right">
            {selectedOperationVersion.outputs.map((output, i) => (
              <FunctionNodeHandle
                key={`out-result-${output.name}`}
                id={`out-result-${i}`}
                type="source"
                position={Position.Right}
              />
            ))}
          </HandleContainer>
        </NodeWrapper>
      </NodeWithActionBar>
    );
  }
);

const HandleContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  justify-items: center;
  position: absolute;
  bottom: -3px;
  height: ${(props: { height?: number; position: 'left' | 'right' }) =>
    props.height}px;
  left: ${(props: { height?: number; position: 'left' | 'right' }) =>
    props.position === 'left' ? '-4px' : 'unset'};
  right: ${(props: { height?: number; position: 'left' | 'right' }) =>
    props.position === 'right' ? '-4px' : 'unset'};
  pointer-events: all;
`;

const FunctionNodeHandle = styled(NodeHandle)`
  position: unset;
`;

const FunctionName = styled.span`
  font-weight: 500;
`;

const InputName = styled.p`
  font-size: 10px;
  font-weight: 400;
  line-height: 24px;
  color: var(--cogs-text-color-secondary);
  margin-bottom: 0;
`;

export default FunctionNode;
