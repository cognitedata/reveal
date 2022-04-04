import { CollapsePanelProps, CollapseProps, Icon } from '@cognite/cogs.js';
import { DataElement, Detection } from 'scarlet/types';
import { getDetectionSourceLabel } from 'scarlet/utils';

import { DataSource, DataSourceHeader } from '..';

import * as Styled from './style';

type DataSourcePanelProps = {
  detection: Detection;
  dataElement: DataElement;
  isPrimaryOnApproval?: boolean;
  focused?: boolean;
  isApproved?: boolean;
  isDraft?: boolean;
  hasConnectedElements: boolean;
  collapseProps?: Omit<CollapseProps, 'children'>;
};

export const DataSourcePanel = ({
  detection,
  dataElement,
  isPrimaryOnApproval = false,
  focused = false,
  isApproved = false,
  isDraft = false,
  hasConnectedElements,
  collapseProps,
}: DataSourcePanelProps) => (
  <Styled.Collapse expandIcon={expandIcon} {...collapseProps}>
    <Styled.Panel
      header={
        <DataSourceHeader
          key={detection.id}
          label={getDetectionSourceLabel(detection)}
          isApproved={isApproved}
        />
      }
      key={detection.id}
      isActive
    >
      <DataSource
        key={detection.id}
        dataElement={dataElement}
        detection={detection}
        focused={focused}
        isPrimaryOnApproval={isPrimaryOnApproval}
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
