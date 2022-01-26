import { CollapsePanelProps, Icon } from '@cognite/cogs.js';
import { useAppState } from 'scarlet/hooks';
import { DataElement, DetectionState } from 'scarlet/types';

import { DataSource, DataSourceHeader, NewDataSource } from '..';

import * as Styled from './style';

type DataSourceListProps = {
  dataElement: DataElement;
};

export const DataSourceList = ({ dataElement }: DataSourceListProps) => {
  const { pcms } = useAppState();
  const isPCMSAvailable = Boolean(pcms.data);

  const detections =
    dataElement.detections?.filter(
      (detection) => detection.state !== DetectionState.OMITTED
    ) || [];

  let amount = detections.length;
  if (isPCMSAvailable) amount += 1;

  return (
    <>
      <Styled.Header className="cogs-detail">
        <Icon type="DataSource" />
        <span className="strong">Data sources ({amount})</span>
      </Styled.Header>

      <Styled.Collapse expandIcon={expandIcon}>
        {isPCMSAvailable && (
          <Styled.Panel header={<DataSourceHeader label="PCMS" disabled />}>
            <DataSource
              dataElement={dataElement}
              value={dataElement.pcmsValue}
              disabled
            />
          </Styled.Panel>
        )}
        {detections.map((detection) => (
          <Styled.Panel
            header={
              <DataSourceHeader
                label={detection.documentExternalId!}
                approved={detection.state === DetectionState.APPROVED}
              />
            }
            key={detection.id}
          >
            <DataSource
              dataElement={dataElement}
              detection={detection}
              value={detection.value}
            />
          </Styled.Panel>
        ))}
      </Styled.Collapse>
      <NewDataSource />
    </>
  );
};

const expandIcon = ({ isActive }: CollapsePanelProps) => {
  return (
    <Icon
      type="ChevronDownLarge"
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
