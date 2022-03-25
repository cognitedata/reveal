import { useEffect, useMemo, useState } from 'react';
import { useDataPanelContext } from 'scarlet/hooks';
import {
  DataElement,
  DataPanelActionType,
  Detection,
  DetectionState,
  DetectionType,
} from 'scarlet/types';

import { DataSourceHeader, NewDataSource, DataSourcePanel } from '..';

import * as Styled from './style';

type DataSourceListProps = {
  dataElement: DataElement;
};

export const DataSourceList = ({ dataElement }: DataSourceListProps) => {
  const [activeDetectionId, setActiveDetectionId] = useState<string>();
  const [sortingIds, setSortingIds] = useState<string[]>([]);
  const { dataPanelState, dataPanelDispatch } = useDataPanelContext();
  const [topDetections, setTopDetections] = useState<Detection[]>([]);

  const { activeDetection, newDetection } = dataPanelState;

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
            !topDetections.some(
              (topDetection) => topDetection.id === detection.id
            )
        )
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

  useEffect(() => {
    setActiveDetectionId(activeDetection?.id);
  }, [activeDetection]);

  // set initial active detection
  useEffect(() => {
    if (activeDetection) {
      setActiveDetectionId(activeDetection.id);
      return;
    }

    const primaryDetectionId = detections.find(
      (item) => item.state === DetectionState.APPROVED && item.isPrimary
    )?.id;

    if (primaryDetectionId) {
      setActiveDetectionId(primaryDetectionId);
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

  useEffect(() => {
    const newTopDetections = dataElement.detections
      .filter((topDetection) =>
        topDetections.some((detection) => detection.id === topDetection.id)
      )
      .reverse();

    if (
      newDetection &&
      !dataElement.detections.some(
        (detection) => detection.id === newDetection.id
      )
    ) {
      newTopDetections.unshift(newDetection);
      setActiveDetectionId(newDetection?.id);
    }
    setTopDetections(newTopDetections);
  }, [newDetection, dataElement.detections]);

  useEffect(() => {
    if (
      newDetection &&
      !newDetection.state &&
      dataElement.detections.some(
        (detection) =>
          newDetection.id === detection.id &&
          detection.state === DetectionState.APPROVED
      )
    ) {
      dataPanelDispatch({
        type: DataPanelActionType.REMOVE_NEW_DETECTION,
      });
    }
  }, [dataElement.detections]);

  useEffect(() => {
    if (
      newDetection &&
      !newDetection.state &&
      dataElement.detections.some(
        (detection) =>
          newDetection.id === detection.id &&
          detection.state === DetectionState.APPROVED
      )
    ) {
      dataPanelDispatch({
        type: DataPanelActionType.REMOVE_NEW_DETECTION,
      });
      setActiveDetectionId(newDetection?.id);
    }

    return () => {
      dataPanelDispatch({
        type: DataPanelActionType.REMOVE_NEW_DETECTION,
      });
    };
  }, [dataElement.detections]);

  return (
    <Styled.Container>
      <NewDataSource />

      {topDetections.map((detection) => (
        <DataSourcePanel
          key={detection.id}
          detection={detection}
          dataElement={dataElement}
          isApproved={detection.state === DetectionState.APPROVED}
          focused={detection.id === activeDetectionId}
          isDraft={!detection.state}
          collapseProps={{
            activeKey: activeDetectionId,
            onChange: setActiveDetectionId,
            accordion: true,
          }}
        />
      ))}

      {PCMSDetection ? (
        <DataSourcePanel
          detection={PCMSDetection}
          dataElement={dataElement}
          isApproved={isPCMSDetectionPrimary}
          collapseProps={{
            defaultActiveKey: PCMSDetection.id,
          }}
        />
      ) : (
        <Styled.EmptySource>
          <Styled.EmptySourceHead>
            <DataSourceHeader label="PCMS" disabled />
          </Styled.EmptySourceHead>
          <Styled.EmptySourceBody>Not available</Styled.EmptySourceBody>
        </Styled.EmptySource>
      )}
      {detections.map((detection) => (
        <DataSourcePanel
          key={detection.id}
          detection={detection}
          dataElement={dataElement}
          isApproved={detection.state === DetectionState.APPROVED}
          isPrimaryOnApproval={detections.length === 1}
          focused={detection.id === activeDetectionId}
          collapseProps={{
            activeKey: activeDetectionId,
            onChange: setActiveDetectionId,
            accordion: true,
          }}
        />
      ))}
    </Styled.Container>
  );
};
