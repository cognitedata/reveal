import React from 'react';

import styled from 'styled-components';

import { round } from 'lodash';

import { Tooltip, Colors } from '@cognite/cogs.js';

import zIndex from '../../../utils/zIndex';

import applyRules from './applyRules';
import { RuleType } from './types';

type LiveSensorValueProps = {
  value: number | string | undefined;
  unit?: string | undefined;
  rules: RuleType[];
  onClick?: () => void;
  opaque?: boolean;
};

const COLOR_DEFAULT = Colors['text-icon--status-undefined'];

export const LIVE_SENSOR_VALUE_SIZE_PX = 34;

const getParsedValue = (
  value: number | string | undefined,
  rules: RuleType[]
): {
  value: string;
  color: string;
} => {
  if (
    !Number.isFinite(value) ||
    value === undefined ||
    typeof value !== 'number'
  ) {
    return {
      value: value === undefined ? '-' : String(value),
      color: COLOR_DEFAULT,
    };
  }

  const color = applyRules(value, rules) ?? COLOR_DEFAULT;
  return {
    value: round(value, 2).toString(),
    color,
  };
};

const ConditionalLiveSensorValue: React.FC<LiveSensorValueProps> = ({
  value,
  rules,
  unit,
  onClick,
  opaque,
}) => {
  const { value: parsedValue, color } = getParsedValue(value, rules);
  return (
    <Tooltip content={`${value} ${unit ?? ''}`}>
      <Container color={color} onClick={onClick} opaque={opaque}>
        <Value>{parsedValue}</Value>
        <Unit>{unit}</Unit>
      </Container>
    </Tooltip>
  );
};

const Container = styled.div<{
  color: string;
  onClick?: any | undefined;
  opaque?: boolean;
}>`
  z-index: ${zIndex.MINIMUM}
  display: flex;
  justify-items: center;
  align-items: stretch;
  flex-direction: column;
  background: ${(props) => props.color};
  color: white;
  width: ${LIVE_SENSOR_VALUE_SIZE_PX}px;
  height: ${LIVE_SENSOR_VALUE_SIZE_PX}px;
  border-radius: 4px;
  justify-content: center;
  cursor: ${(props) => (props.onClick !== undefined ? 'pointer' : 'default')};
  overflow: hidden;
  padding: 2px;
  opacity: ${({ opaque }) => (opaque === undefined ? 1 : 0.9)};
`;

const Value = styled.div`
  flex-shrink: 1;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  overflow: hidden;
`;

const Unit = styled.div`
  flex-shrink: 1;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  overflow: hidden;
`;

export default ConditionalLiveSensorValue;
