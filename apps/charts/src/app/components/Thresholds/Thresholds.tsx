import { ComponentProps, useState } from 'react';

import { ChartSource, ChartThreshold } from '@cognite/charts-lib';
import { Button, Collapse } from '@cognite/cogs.js';

import {
  ExpandIcon,
  ContentContainer,
  SidebarCollapse,
  SidebarHeaderActions,
  CollapsePanelTitle,
} from '../Common/SidebarElements';
import TranslatedEditableText from '../EditableText/TranslatedEditableText';

import ThresholdItem from './ThresholdItem';

interface Props
  extends Omit<ComponentProps<typeof ThresholdItem>, 'threshold'> {
  thresholds: ChartThreshold[];
  sources: ChartSource[];
  onUpdateThresholdName: (id: string, name: string) => void;
  onAddThreshold: () => void;
}

const Thresholds = ({
  thresholds,
  sources,
  onUpdateThresholdName,
  onAddThreshold,
  translations,
  ...thresholdItemProps
}: Props) => {
  const [activeKey, setActiveKey] = useState(['1']);

  const onChange = (key: any) => {
    setActiveKey(key);
  };

  return (
    <ContentContainer>
      <SidebarHeaderActions>
        <Button
          icon="Plus"
          type="primary"
          size="small"
          aria-label="Add threshold"
          onClick={() => {
            onAddThreshold();
            setActiveKey((prevState) => [
              '1',
              ...prevState.map((k) => String(parseInt(k, 10) + 1)),
            ]);
          }}
        >
          {translations?.['Add new'] || 'Add new'}
        </Button>
      </SidebarHeaderActions>
      <SidebarCollapse
        activeKey={activeKey}
        onChange={onChange}
        expandIcon={({ isActive }) => (
          <ExpandIcon $active={Boolean(isActive)} type="ChevronDownLarge" />
        )}
      >
        {thresholds.map((threshold, index) => (
          <Collapse.Panel
            key={`${index + 1}`}
            header={
              <CollapsePanelTitle>
                <TranslatedEditableText
                  value={threshold.name}
                  onChange={(val) => onUpdateThresholdName(threshold.id, val)}
                  hideButtons
                />
              </CollapsePanelTitle>
            }
          >
            <ThresholdItem
              threshold={threshold}
              sources={sources}
              translations={translations}
              {...thresholdItemProps}
            />
          </Collapse.Panel>
        ))}
      </SidebarCollapse>
    </ContentContainer>
  );
};

Thresholds.translationKeys = ThresholdItem.translationKeys;

export default Thresholds;
