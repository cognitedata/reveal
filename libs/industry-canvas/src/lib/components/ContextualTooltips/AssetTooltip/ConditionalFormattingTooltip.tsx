import React from 'react';

import styled from 'styled-components';

import { v4 as uuid } from 'uuid';

import { Colors, Button, Icon } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/plotting-components';

import { TIME_SELECT } from '@data-exploration-lib/core';

import { translationKeys } from '../../../common/i18n/translationKeys';
import { useTimeseries } from '../../../hooks/useTimeseries';
import useTimeseriesLatestValues from '../../../hooks/useTimeseriesLatestValue';
import { useTranslation } from '../../../hooks/useTranslation';
import * as ContextualTooltip from '../ContextualTooltip';

import ConditionalLiveSensorValue, {
  LIVE_SENSOR_VALUE_SIZE_PX,
} from './ConditionalLiveSensorValue';
import Rules from './Rules';
import { Condition, RuleType } from './types';

type ConditionalFormattingTooltipProps = {
  id: number;
  onBackClick: () => void;
  onSaveClick: (rules: RuleType[]) => void;
  initialRules?: RuleType[];
};

const getNewRule = (): RuleType => ({
  id: uuid(),
  then: 'green',
  condition: Condition.EQUALS,
  comparisonValue: 0,
});

const ConditionalFormattingTooltip: React.FC<
  ConditionalFormattingTooltipProps
> = ({ id, onBackClick, onSaveClick, initialRules = [] }) => {
  const [rules, setRules] = React.useState<RuleType[]>(initialRules);
  const { data: timeseries, isLoading } = useTimeseries(id);

  const { data: valueByTsId, isLoading: valueByTsIdIsLoading } =
    useTimeseriesLatestValues([id]);

  const { t } = useTranslation();

  if (isLoading || valueByTsIdIsLoading || timeseries === undefined) {
    return <Icon type="Loader" />;
  }

  const onAddRuleClick = () => {
    setRules((prevRules) => [...prevRules, getNewRule()]);
  };

  const value = valueByTsId?.[id];

  return (
    <ShamefulOffsetContainer>
      <ContextualTooltip.Container>
        <ContextualTooltip.Header>
          <ContextualTooltip.InnerHeaderWrapper>
            <ContextualTooltip.HeaderButton
              icon="Close"
              type="secondary"
              inverted
              onClick={onBackClick}
              size="small"
            />
            <ContextualTooltip.Label>
              {timeseries.name ?? timeseries.externalId}
            </ContextualTooltip.Label>
          </ContextualTooltip.InnerHeaderWrapper>
        </ContextualTooltip.Header>

        <ValueRow>
          <ConditionalLiveSensorValue
            value={value}
            unit={timeseries.unit}
            rules={rules}
          />

          <TimeseriesChart
            timeseries={{ id: timeseries.id }}
            variant="small"
            dateRange={TIME_SELECT['1Y'].getTime()}
            numberOfPoints={100}
            height={55}
            dataFetchOptions={{
              mode: 'aggregate',
            }}
            autoRange
            styles={{
              backgroundColor: Colors['surface--muted--inverted'],
            }}
            inverted
          />
        </ValueRow>

        <Rules rules={rules} onRulesChange={setRules} />

        <ButtonsContainer>
          <Button icon="Add" size="small" inverted onClick={onAddRuleClick}>
            {t(translationKeys.CONDITIONAL_FORMATTING_ADD_RULE, 'Add rule')}
          </Button>
          <Button
            type="primary"
            size="small"
            inverted
            onClick={() => onSaveClick(rules)}
          >
            {t(translationKeys.CONDITIONAL_FORMATTING_SAVE, 'Save')}
          </Button>
        </ButtonsContainer>
      </ContextualTooltip.Container>
    </ShamefulOffsetContainer>
  );
};

const ShamefulOffsetContainer = styled.div`
  margin: ${LIVE_SENSOR_VALUE_SIZE_PX + 2}px 0;
`;

const ValueRow = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  padding-top: 8px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 13px;
  padding-top: 13px;
`;

export default ConditionalFormattingTooltip;
