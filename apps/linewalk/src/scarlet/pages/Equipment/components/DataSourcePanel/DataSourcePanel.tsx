import { CollapsePanelProps, CollapseProps, Icon } from '@cognite/cogs.js';
import { DataElement, Detection } from 'scarlet/types';

import { DataSource, DataSourceHeader } from '..';

import * as Styled from './style';

type DataSourcePanelProps = {
  detection: Detection;
  dataElement: DataElement;
  focused?: boolean;
  isDraft?: boolean;
  isCalculated?: boolean;
  isDiscrepancy?: boolean;
  hasConnectedElements?: boolean;
  showArrow?: boolean;
  collapseProps?: Omit<CollapseProps, 'children'>;
};

export const DataSourcePanel = ({
  detection,
  dataElement,
  focused = false,
  isDraft = false,
  isCalculated = false,
  isDiscrepancy = false,
  hasConnectedElements = false,
  showArrow = true,
  collapseProps,
}: DataSourcePanelProps) => (
  <Styled.Collapse expandIcon={expandIcon} {...collapseProps}>
    <Styled.Panel
      header={
        <DataSourceHeader
          key={detection.id}
          detection={detection}
          isDiscrepancy={isDiscrepancy}
        />
      }
      key={detection.id}
      isActive
      showArrow={showArrow}
    >
      <DataSource
        key={detection.id}
        dataElement={dataElement}
        detection={detection}
        isCalculated={isCalculated}
        focused={focused}
        isDraft={isDraft}
        hasConnectedElements={hasConnectedElements}
      />
    </Styled.Panel>
  </Styled.Collapse>
);

const expandIcon = ({ isActive }: CollapsePanelProps) => {
  return (
    <Icon
      type="ChevronDownLarge"
      aria-label="Toggle data source"
      style={{
        marginRight: 0,
        width: '10px',
        transition: 'transform .2s',
        transform: `rotate(${!isActive ? 0 : -180}deg)`,
        flexShrink: 0,
      }}
    />
  );
};
