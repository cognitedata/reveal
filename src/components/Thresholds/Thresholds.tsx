import { ComponentProps, useState } from 'react';
import {
  ChartThreshold,
  ChartTimeSeries,
  ChartWorkflow,
} from 'models/charts/charts/types/types';
import ThresholdItem from 'components/Thresholds/ThresholdItem';
import { Button, Collapse } from '@cognite/cogs.js';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';
import { ExpandIcon, ThresholdCollapse } from 'components/Thresholds/elements';
import { Container } from '../Common/SidebarElements';

interface Props
  extends Omit<ComponentProps<typeof ThresholdItem>, 'threshold'> {
  thresholds: ChartThreshold[];
  sources: (ChartTimeSeries | ChartWorkflow)[];
  onUpdateThresholdName: (id: string, name: string) => void;
  onAddThreshold: () => void;
}

const Thresholds = ({
  thresholds,
  sources,
  onUpdateThresholdName,
  onAddThreshold,
  ...thresholdItemProps
}: Props) => {
  const [activeKey, setActiveKey] = useState(['1']);

  const onChange = (key: any) => {
    setActiveKey(key);
  };

  return (
    <Container>
      <div>
        <Button
          icon="Plus"
          type="tertiary"
          aria-label="Add threshold"
          onClick={() => {
            onAddThreshold();
            setActiveKey((prevState) => [
              '1',
              ...prevState.map((k) => String(parseInt(k, 10) + 1)),
            ]);
          }}
        />
      </div>
      <br />
      <ThresholdCollapse
        activeKey={activeKey}
        onChange={onChange}
        expandIcon={({ isActive }) => (
          <ExpandIcon isActive={Boolean(isActive)} type="ChevronDownLarge" />
        )}
      >
        {thresholds.map((threshold, index) => (
          <Collapse.Panel
            key={`${index + 1}`}
            header={
              <TranslatedEditableText
                value={threshold.name}
                onChange={(val) => onUpdateThresholdName(threshold.id, val)}
                hideButtons
              />
            }
          >
            <ThresholdItem
              threshold={threshold}
              sources={sources}
              {...thresholdItemProps}
            />
          </Collapse.Panel>
        ))}
      </ThresholdCollapse>
    </Container>
  );
};

Thresholds.translationKeys = ThresholdItem.translationKeys;

export default Thresholds;
