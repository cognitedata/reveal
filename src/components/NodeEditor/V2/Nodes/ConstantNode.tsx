import { Input } from '@cognite/cogs.js';
import { defaultTranslations } from 'components/NodeEditor/translations';
import Joi from 'joi';
import { memo, useEffect, useState, useCallback } from 'react';
import { NodeProps, Position } from 'react-flow-renderer';
import styled from 'styled-components/macro';
import { NodeTypes } from '../types';
import { NodeWrapper, NoDragWrapper } from './elements';
import NodeHandle from './NodeHandle';
import NodeWithActionBar from './NodeWithActionBar';

export type ConstantNodeDataDehydrated = {
  value: number;
};

export type ConstantNodeCallbacks = {
  onConstantChange: (nodeId: string, newValue: number) => void;
  onDuplicateNode: (nodeId: string, nodeType: NodeTypes) => void;
  onRemoveNode: (nodeId: string) => void;
};

export type ConstantNodeData = ConstantNodeDataDehydrated &
  ConstantNodeCallbacks & {
    readOnly: boolean;
    translations: typeof defaultTranslations;
  };

const numberValidator = Joi.number();

const ConstantNode = memo(
  ({ id, data, selected }: NodeProps<ConstantNodeData>) => {
    const {
      value,
      readOnly,
      onConstantChange,
      onDuplicateNode,
      onRemoveNode,
      translations: t,
    } = data;
    const [isInputVisible, setIsInputVisible] = useState<boolean>(selected);
    const [localValue, setLocalValue] = useState(String(value));
    const { error } = numberValidator.validate(parseFloat(localValue));
    const isValid = !error;

    useEffect(() => {
      setLocalValue(String(value));
    }, [value]);

    useEffect(() => {
      if (!selected) {
        setIsInputVisible(false);
        setLocalValue(String(value));
      }
    }, [selected, value]);

    const handleUpdateValue = useCallback(() => {
      if (isValid) {
        onConstantChange(id, parseFloat(localValue));
      }
    }, [isValid, id, onConstantChange, localValue]);

    const handleKeyPress = useCallback(
      (event) => {
        if (event.key === 'Enter') {
          handleUpdateValue();
          setIsInputVisible(false);
        }
      },
      [handleUpdateValue]
    );

    const handleChange = useCallback((event) => {
      setLocalValue(event.target.value);
    }, []);

    const handleInputDoubleClick = useCallback((event) => {
      event.stopPropagation();
    }, []);

    return (
      <NodeWithActionBar
        isActionBarVisible={selected && !readOnly}
        actions={{
          onEditClick: () => setIsInputVisible((isVisible) => !isVisible),
          onDuplicateClick: () => onDuplicateNode(id, NodeTypes.CONSTANT),
          onRemoveClick: () => onRemoveNode(id),
        }}
        capabilities={{
          canEdit: true,
          canDuplicate: true,
          canRemove: true,
          canSeeInfo: false,
        }}
        status={{
          isEditing: isInputVisible,
        }}
        translations={t}
      >
        <NodeWrapper
          className={selected ? 'selected' : ''}
          onDoubleClick={() => setIsInputVisible((isVisible) => !isVisible)}
        >
          <NodeHandle type="source" position={Position.Right} />
          <span>{t.Constant}</span>
          {!isInputVisible && <Value>{value}</Value>}
          {isInputVisible && (
            <NoDragWrapper>
              <Input
                type="number"
                value={localValue}
                isValid={isValid}
                onDoubleClick={handleInputDoubleClick}
                onKeyPress={handleKeyPress}
                onChange={handleChange}
                onBlur={handleUpdateValue}
              />
            </NoDragWrapper>
          )}
        </NodeWrapper>
      </NodeWithActionBar>
    );
  }
);

const Value = styled.div`
  color: var(--cogs-greyscale-grey6);
  font-size: 10px;
  font-weight: 400;
`;

export default ConstantNode;
