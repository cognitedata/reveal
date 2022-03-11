import { useEffect, useMemo, useState } from 'react';
import { CollapsePanelProps, Icon } from '@cognite/cogs.js';
import { useDataPanelState } from 'scarlet/hooks';
import { DataElement, DetectionState, DetectionType } from 'scarlet/types';
import usePrevious from 'hooks/usePrevious';

import { DataSource, DataSourceHeader, NewDataSource } from '..';

import * as Styled from './style';

type DataSourceListProps = {
  dataElement: DataElement;
};

export const DataSourceList = ({ dataElement }: DataSourceListProps) => {
  const [activeDetectionId, setActiveDetectionId] = useState<string>();
  const [sortingIds, setSortingIds] = useState<string[]>([]);
  const { activeDetection } = useDataPanelState();

  const PCMSDetection = useMemo(
    () =>
      dataElement.detections.find(
        (d) =>
          d.type === DetectionType.PCMS && !['', 'N/A'].includes(d.value || '')
      ),
    [dataElement]
  );

  const isPCMSDetectionPrimary = PCMSDetection?.isPrimary || false;

  const detections = useMemo(
    () =>
      dataElement.detections
        ?.filter(
          (detection) =>
            detection.state !== DetectionState.OMITTED &&
            detection.type !== DetectionType.PCMS
        )
        .sort((a, b) => {
          let aRank = 0;
          let bRank = 0;

          if (sortingIds.includes(a.id)) {
            aRank = sortingIds.indexOf(a.id);
          } else {
            aRank += a.state === DetectionState.APPROVED ? 0 : 1;
          }

          if (sortingIds.includes(b.id)) {
            bRank = sortingIds.indexOf(b.id);
          } else {
            bRank += b.state === DetectionState.APPROVED ? 0 : 1;
          }

          return aRank - bRank;
        }) || [],
    [dataElement]
  );

  useMemo(() => {
    setSortingIds(detections.map((item) => item.id));
  }, []);

  // set initial active detection
  useEffect(() => {
    // if (!detections.length) {
    //   setActiveDetectionIds(['PCMS']);
    //   return;
    // }

    if (activeDetection) {
      setActiveDetectionId(activeDetection.id);
      return;
    }

    const approvedDetectionId = detections.find(
      (item) => item.state === DetectionState.APPROVED
    )?.id;

    let activeDetectionId = approvedDetectionId;

    if (!isPCMSDetectionPrimary && !activeDetectionId) {
      activeDetectionId = detections.length ? detections[0].id : undefined;
    }

    setActiveDetectionId(activeDetectionId || undefined);
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
        setActiveDetectionId(newDetection.id);
      }
    }
  }, [detections]);

  return (
    <>
      <NewDataSource />
      {PCMSDetection ? (
        <Styled.Collapse
          expandIcon={expandIcon}
          defaultActiveKey={PCMSDetection.id}
        >
          <Styled.Panel
            header={
              <DataSourceHeader
                label="PCMS"
                isApproved={isPCMSDetectionPrimary}
              />
            }
            key={PCMSDetection.id}
            isActive
          >
            <DataSource
              id={PCMSDetection.id}
              dataElement={dataElement}
              detection={PCMSDetection}
              value={PCMSDetection.value}
            />
          </Styled.Panel>
        </Styled.Collapse>
      ) : (
        <Styled.EmptySource>
          <Styled.EmptySourceHead>
            <DataSourceHeader label="PCMS" disabled />
          </Styled.EmptySourceHead>
          <Styled.EmptySourceBody>Not available</Styled.EmptySourceBody>
        </Styled.EmptySource>
      )}
      {!!detections.length && (
        <Styled.Collapse
          expandIcon={expandIcon}
          activeKey={activeDetectionId}
          onChange={setActiveDetectionId}
          accordion
        >
          {detections.map((detection) => (
            <Styled.Panel
              header={
                <DataSourceHeader
                  label={detection.documentExternalId!}
                  isApproved={detection.state === DetectionState.APPROVED}
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
                focused={detection.id === activeDetectionId}
                isPrimaryOnApproval={detections.length === 1}
              />
            </Styled.Panel>
          ))}
        </Styled.Collapse>
      )}
    </>
  );
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
