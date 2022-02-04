import { useEffect, useMemo, useState } from 'react';
import { CollapsePanelProps, Icon } from '@cognite/cogs.js';
import { useAppState, useDataPanelState } from 'scarlet/hooks';
import { DataElement, DetectionState } from 'scarlet/types';
import usePrevious from 'hooks/usePrevious';

import { DataSource, DataSourceHeader, NewDataSource } from '..';

import * as Styled from './style';

type DataSourceListProps = {
  dataElement: DataElement;
};

export const DataSourceList = ({ dataElement }: DataSourceListProps) => {
  const { pcms } = useAppState();
  const isPCMSAvailable = Boolean(pcms.data);
  const [activeDetectionIds, setActiveDetectionIds] = useState<string[]>([]);
  const [sortingIds, setSortingIds] = useState<string[]>([]);
  const { activeDetection } = useDataPanelState();

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

  // set initial active detection
  useEffect(() => {
    if (!detections.length) {
      setActiveDetectionIds(['PCMS']);
      return;
    }

    if (activeDetection) {
      setActiveDetectionIds([activeDetection.id]);
      return;
    }

    const approvedDetectionId = detections.find(
      (item) => item.state === DetectionState.APPROVED
    )?.id;

    setActiveDetectionIds([approvedDetectionId || detections[0].id]);
  }, []);

  // open new detection
  const prevDetections = usePrevious(detections);
  useEffect(() => {
    if (prevDetections) {
      const prevDetectionsIds = prevDetections.map((detection) => detection.id);
      const newDetection = detections.find(
        (detection) => !prevDetectionsIds.includes(detection.id)
      );
      if (newDetection) {
        setActiveDetectionIds((prev) => [...prev, newDetection.id]);
      }
    }
  }, [detections]);

  let amount = detections.length;
  if (isPCMSAvailable) amount += 1;

  // zoom to new detection if panel was opened
  const prevActiveDetectionIds = usePrevious(activeDetectionIds);
  const newActiveDetectionId = useMemo(() => {
    if (!prevActiveDetectionIds) return undefined;

    const newDetectionId = activeDetectionIds.find(
      (id) => !prevActiveDetectionIds?.includes(id)
    );

    return newDetectionId;
  }, [activeDetectionIds]);

  return (
    <>
      <Styled.Header className="cogs-detail">
        <Icon type="DataSource" />
        <span className="strong">Data sources ({amount})</span>
      </Styled.Header>

      <Styled.Collapse
        expandIcon={expandIcon}
        activeKey={activeDetectionIds}
        onChange={setActiveDetectionIds as any}
      >
        {isPCMSAvailable && (
          <Styled.Panel
            header={<DataSourceHeader label="PCMS" disabled />}
            isActive={!detections.length}
            key="PCMS"
          >
            <DataSource
              id="PCMS"
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
            isActive
          >
            <DataSource
              id={detection.id}
              dataElement={dataElement}
              detection={detection}
              value={detection.value}
              focused={detection.id === newActiveDetectionId}
            />
          </Styled.Panel>
        ))}
      </Styled.Collapse>
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
