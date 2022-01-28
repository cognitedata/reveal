import { useMemo, useState } from 'react';
import { CollapsePanelProps, Icon } from '@cognite/cogs.js';
import { useAppState } from 'scarlet/hooks';
import { DataElement, DetectionState, DetectionType } from 'scarlet/types';

import { DataSource, DataSourceHeader, NewDataSource } from '..';

import * as Styled from './style';

type DataSourceListProps = {
  dataElement: DataElement;
};

export const DataSourceList = ({ dataElement }: DataSourceListProps) => {
  const { pcms } = useAppState();
  const isPCMSAvailable = Boolean(pcms.data);
  const [sortingIds, setSortingIds] = useState<string[]>([]);

  const detections = useMemo(
    () =>
      dataElement.detections
        ?.filter((detection) => detection.state !== DetectionState.OMITTED)
        .sort((a, b) => {
          const aRank = sortingIds.includes(a.id)
            ? sortingIds.indexOf(a.id)
            : 100500;

          const bRank = sortingIds.includes(b.id)
            ? sortingIds.indexOf(b.id)
            : 100500;

          return aRank - bRank;
        }) || [],
    [dataElement]
  );

  useMemo(() => {
    setSortingIds(
      detections
        .sort((a) => (a.state === DetectionState.APPROVED ? -1 : 0))
        .map((item) => item.id)
    );
  }, []);

  const defaultActiveKey = useMemo(() => {
    if (!detections.length) return 'PCMS';

    const detectionIds = detections
      .filter(
        (item) =>
          item.state === DetectionState.APPROVED ||
          (item.type === DetectionType.MANUAL && !item.value)
      )
      .map((item) => item.id);

    return detectionIds.length ? detectionIds : detections[0].id;
  }, [detections]);

  let amount = detections.length;
  if (isPCMSAvailable) amount += 1;

  return (
    <>
      <Styled.Header className="cogs-detail">
        <Icon type="DataSource" />
        <span className="strong">Data sources ({amount})</span>
      </Styled.Header>

      {isPCMSAvailable && (
        <Styled.Collapse
          expandIcon={expandIcon}
          defaultActiveKey={defaultActiveKey}
        >
          <Styled.Panel
            header={<DataSourceHeader label="PCMS" disabled />}
            isActive={!detections.length}
            key="PCMS"
          >
            <DataSource
              dataElement={dataElement}
              value={dataElement.pcmsValue}
              disabled
            />
          </Styled.Panel>
        </Styled.Collapse>
      )}

      {detections.map((detection) => (
        <Styled.Collapse
          expandIcon={expandIcon}
          defaultActiveKey={defaultActiveKey}
          key={detection.id}
        >
          <Styled.Panel
            header={
              <DataSourceHeader
                label={detection.documentExternalId!}
                approved={detection.state === DetectionState.APPROVED}
              />
            }
            key={detection.id}
            isActive
          >
            <DataSource
              dataElement={dataElement}
              detection={detection}
              value={detection.value}
            />
          </Styled.Panel>
        </Styled.Collapse>
      ))}
      <NewDataSource isActive={!detections.length} />
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
