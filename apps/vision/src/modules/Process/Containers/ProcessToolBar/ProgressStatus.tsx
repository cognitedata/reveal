/* eslint-disable no-nested-ternary */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Progress } from 'antd';

import { Body, Button, Col, Icon, Micro, Row, Title } from '@cognite/cogs.js';

import { VisionDetectionModelType } from '../../../../api/vision/detectionModels/types';
import { useThunkDispatch } from '../../../../store';
import { RootState } from '../../../../store/rootReducer';
import { AnnotationsBadge } from '../../../Common/Components/AnnotationsBadge/AnnotationsBadge';
import { makeSelectTotalAnnotationCountForFileIds } from '../../../Common/store/annotation/selectors';
import { AnnotationsBadgeStatuses } from '../../../Common/types';
import {
  selectAllJobs,
  selectAllJobsForAllFilesDict,
  selectIsPollingComplete,
  selectIsProcessingStarted,
  selectPageCount,
} from '../../store/selectors';
import { setSummaryModalVisibility } from '../../store/slice';

export default function ProgressStatus() {
  const dispatch = useThunkDispatch();

  const processFileIds = useSelector(
    (state: RootState) => state.processSlice.fileIds
  );

  const selectTotalAnnotationCountForFileIds = useMemo(
    makeSelectTotalAnnotationCountForFileIds,
    []
  );
  const annotationCounts = useSelector(({ annotationReducer }: RootState) =>
    selectTotalAnnotationCountForFileIds(annotationReducer, processFileIds)
  );

  const fileCount = processFileIds.length;

  const pageCount = useSelector((state: RootState) => {
    return selectPageCount(state.processSlice);
  });

  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const isProcessingStarted = useSelector((state: RootState) => {
    return selectIsProcessingStarted(state.processSlice);
  });

  const jobs = useSelector((state: RootState) => {
    return selectAllJobs(state.processSlice);
  });

  const fileJobList = useSelector((state: RootState) => {
    return selectAllJobsForAllFilesDict(state.processSlice);
  });

  const progress = useMemo(() => {
    let processedFileCount = 0;
    fileJobList.forEach((item) => {
      processedFileCount += +item.jobs.every((job) =>
        ['Completed', 'Failed'].includes(job.status)
      ) as number;
    });
    return Math.round((processedFileCount / fileCount) * 100);
  }, [fileJobList]);

  const disableSummary =
    !fileCount || !isProcessingStarted || !isPollingFinished;

  const handleOnSummaryClick = () => {
    dispatch(setSummaryModalVisibility(true));
  };

  const annotationStatus = () => {
    const [tag, text, objects, gdpr]: any[] = [[], [], [], []];
    Object.entries(jobs).forEach(([_, job]) => {
      if (job.jobId > 0) {
        // HACK due to getFakeQueuedJob(), postVisionJob.Pending in processSlice
        if (job.type === VisionDetectionModelType.OCR) {
          text.push(job.status);
        }
        if (job.type === VisionDetectionModelType.TagDetection) {
          tag.push(job.status);
        }
        if (job.type === VisionDetectionModelType.PeopleDetection) {
          gdpr.push(job.status);
        }
        if (
          [
            VisionDetectionModelType.ObjectDetection,
            VisionDetectionModelType.GaugeReader,
          ].includes(job.type)
        ) {
          objects.push(job.status);
        }
      }
    });

    const annotationBadgeProps = {
      tag: tag.length
        ? {
            status:
              tag.includes('Running') || tag.includes('Queued')
                ? 'Running'
                : 'Completed',
          }
        : {},
      gdpr: gdpr.length
        ? {
            status:
              gdpr.includes('Running') || gdpr.includes('Queued')
                ? 'Running'
                : 'Completed',
          }
        : {},
      text: text.length
        ? {
            status:
              text.includes('Running') || text.includes('Queued')
                ? 'Running'
                : 'Completed',
          }
        : {},
      objects: objects.length
        ? {
            status:
              objects.includes('Running') || objects.includes('Queued')
                ? 'Running'
                : 'Completed',
          }
        : {},
    };

    return annotationBadgeProps as AnnotationsBadgeStatuses;
  };

  const progressFormat = (percent: number | undefined) => {
    if (percent === 100) {
      return (
        <SuccessContainer>
          <Micro style={{ paddingRight: '10px' }}>
            {fileCount}/{fileCount} files{' '}
          </Micro>
          <div style={{ color: '#31C25A' }}>
            <Icon type="CheckmarkFilled" />
          </div>
        </SuccessContainer>
      );
    }
    return <Micro>{percent}%</Micro>;
  };

  return (
    <>
      <Container style={{ paddingBottom: '25px' }}>
        <Row cols={4}>
          <Col span={1}>
            <Title level="6">
              {isPollingFinished ? 'Files processed' : 'Processing files'}
            </Title>
          </Col>
          <Col span={2}>
            <Body level={2} strong>
              {fileCount} files on {pageCount} page{pageCount > 1 ? 's' : ''}
            </Body>
          </Col>
          <Col span={1}>
            <StyledButton
              type="ghost"
              disabled={disableSummary}
              onClick={handleOnSummaryClick}
            >
              Processing Summary
            </StyledButton>
          </Col>
        </Row>
        <Row cols={4}>
          <Col span={2}>
            {AnnotationsBadge(annotationCounts, annotationStatus())}
          </Col>
          <Col span={2}>
            <Progress
              percent={progress}
              format={(percent) => progressFormat(percent)}
              size="small"
              type="line"
              strokeColor="#31C25A"
              showInfo
              trailColor="#E8E8E8"
              strokeLinecap="round"
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}

// styling issues with progress from antd, need to modify values directly
const Container = styled.div`
  padding: 10px;
  box-sizing: border-box;
  border-radius: 10px;
  background-color: rgba(74, 103, 251, 0.1);
  border: 0.5px solid #dcdcdc;
  min-width: 300px;

  .ant-progress-outer {
    width: 80%;
  }
`;

const StyledButton = styled(Button)`
  padding: 0;
  height: 100%;
  background: transparent;
`;

const SuccessContainer = styled.div`
  display: inline-flex;
  align-items: center;
`;
