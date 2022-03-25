import { CollapsePanelProps, CollapseProps, Icon } from '@cognite/cogs.js';
import { DataElement, Detection, DetectionType } from 'scarlet/types';

import { DataSource, DataSourceHeader } from '..';

import * as Styled from './style';

type DataSourcePanelProps = {
  detection: Detection;
  dataElement: DataElement;
  isPrimaryOnApproval?: boolean;
  focused?: boolean;
  isApproved?: boolean;
  isDraft?: boolean;
  collapseProps?: Omit<CollapseProps, 'children'>;
};

export const DataSourcePanel = ({
  detection,
  dataElement,
  isPrimaryOnApproval = false,
  focused = false,
  isApproved = false,
  isDraft = false,
  collapseProps,
}: DataSourcePanelProps) => (
  <Styled.Collapse expandIcon={expandIcon} {...collapseProps}>
    <Styled.Panel
      header={
        <DataSourceHeader
          key={detection.id}
          label={getLabel(detection)}
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
      />
    </Styled.Panel>
  </Styled.Collapse>
);

const getLabel = (detection: Detection) => {
  const defaultLabel = 'No source';

  switch (detection.type) {
    case DetectionType.PCMS:
      return 'PCMS';
    case DetectionType.MANUAL_INPUT:
      return 'Manual input';
    case DetectionType.MANUAL_EXTERNAL:
      return 'External source';
    case DetectionType.MANUAL:
    case DetectionType.SCANNER:
      return detection.documentExternalId || defaultLabel;
    default:
      return defaultLabel;
  }
};

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
