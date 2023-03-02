/* eslint-disable no-nested-ternary */
import { Body, Icon, Tooltip, Slider, Title } from '@cognite/cogs.js';
import React, { useState } from 'react';
import {
  AutoMLMetrics,
  AutoMLModelType,
  AutoMLTrainingJob,
} from 'src/api/vision/autoML/types';
import { dateformat, getDateDiff } from 'src/utils/DateUtils';
import styled from 'styled-components';
import { AutoMLStatusBadge } from 'src/modules/AutoML/Components/AutoMLStatusBadge';
import { InputNumber } from 'antd';

export const getPrecisionAndRecall = (
  threshold: number,
  items?: AutoMLMetrics[]
) => {
  // Find the item with closest confidenceThreshold to specified threshold
  const metrics = items?.length
    ? items?.reduce((prev, curr) => {
        return Math.abs(curr.confidenceThreshold - threshold) <
          Math.abs(prev.confidenceThreshold - threshold)
          ? curr
          : prev;
      })
    : undefined;

  return (
    metrics || {
      confidenceThreshold: 0,
      precision: 0,
      recall: 0,
      f1score: 0,
    }
  );
};

export const formatModelType = (modelType: AutoMLModelType) => {
  return modelType === 'classification'
    ? 'Classification'
    : modelType === 'objectdetection'
    ? 'Object detection'
    : 'Unknown';
};

export const AutoMLMetricsOverview = (props: { model?: AutoMLTrainingJob }) => {
  const { model } = props;
  const [currentThreshold, setCurrentThreshold] = useState<number>(50);

  const convertToPercent = (value: number) => {
    return `${Math.round(100 * value * 10) / 10} %`;
  };

  const onThresholdChange = (value: number) => {
    setCurrentThreshold(value);
  };

  const { precision, recall } = getPrecisionAndRecall(
    currentThreshold / 100,
    model?.modelEvaluation?.metrics
  );

  const renderPerformance = () => {
    return (
      <>
        {model?.status === 'Completed' ? (
          <>
            <Title level={6}>Performance</Title>
            <Body strong level={2}>
              Score threshold
              <Tooltip
                wrapped
                content="The confidence threshold returns predictions as positive if their confidence score is the selected value or higher. A higher confidence threshold increases precision but lowers recall, and vice versa."
              >
                <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
              </Tooltip>
            </Body>
            <ModelDataContainer
              style={{ paddingBottom: '10px', alignItems: 'center' }}
            >
              <Slider
                min={0}
                max={100}
                value={currentThreshold}
                onChange={(value) => onThresholdChange(value)}
                step={10}
              />
              <InputNumber
                style={{ marginLeft: '10px' }}
                type="number"
                min={0}
                max={100}
                step={10}
                value={currentThreshold}
                onChange={onThresholdChange}
                // TODO: switch back to the Input component in cogs.js once the issue in
                // https://cognitedata.slack.com/archives/C011E10CW2F/p1655890641506019?thread_ts=1655888255.471469&cid=C011E10CW2F
                // is resolved
                // width={70}
                // size="small"
                // style={{
                //   MozAppearance: 'textfield',
                //   alignContent: 'center',
                // }}
              />
            </ModelDataContainer>

            <ModelDataContainer>
              <Body strong level={2}>
                Precision
                <Tooltip
                  wrapped
                  content="The percentage of predictions that were correct (positive)."
                >
                  <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                </Tooltip>
              </Body>
              <Body strong level={2}>
                {convertToPercent(precision)}
              </Body>
            </ModelDataContainer>
            <ModelDataContainer>
              <Body strong level={2}>
                Recall
                <Tooltip
                  wrapped
                  content="The percentage of all ground truth items that were successfully predicted by the model."
                >
                  <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                </Tooltip>
              </Body>

              <Body strong level={2}>
                {convertToPercent(recall)}
              </Body>
            </ModelDataContainer>
          </>
        ) : (
          <>
            <Title level={6}>Performance</Title>
            <StyledBody level={2}>Performance data not available</StyledBody>
          </>
        )}
      </>
    );
  };

  const renderModelOptions = () => {
    return (
      model && (
        <>
          <Title level={6}>Model information</Title>
          <ModelDataContainer>
            <Body strong level={2}>
              id
            </Body>
            <Body strong level={2}>
              {model.jobId}
            </Body>
          </ModelDataContainer>
          <ModelDataContainer>
            <Body strong level={2}>
              Status
            </Body>
            <Body strong level={2}>
              <AutoMLStatusBadge
                status={model.status}
                errorMessage={model.errorMessage}
                large
              />
            </Body>
          </ModelDataContainer>

          <ModelDataContainer>
            <Body strong level={2}>
              Model type
            </Body>
            <Body strong level={2}>
              {formatModelType(model.modelType)}
            </Body>
          </ModelDataContainer>

          <ModelDataContainer>
            <Body strong level={2}>
              Created time
            </Body>
            <Body strong level={2}>
              {dateformat(new Date(model.createdTime))}
            </Body>
          </ModelDataContainer>
          <ModelDataContainer>
            <Body strong level={2}>
              Elapsed training time
            </Body>
            <Body strong level={2}>
              {getDateDiff(
                new Date(model.startTime),
                new Date(model.statusTime) // model.statusTime corresponds to training completed time if job is completed, else time when the request was made
              )}
            </Body>
          </ModelDataContainer>
        </>
      )
    );
  };

  return (
    <Container>
      <MetricContainer>{renderModelOptions()}</MetricContainer>
      <MetricContainer>{renderPerformance()}</MetricContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

const MetricContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 49%;
  border-radius: 5px;
  border: 1px solid #e8e8e8;
  background: #fafafa;
  padding: 16px;
  gap: 16px;
`;

const ModelDataContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .numberInputWrapper {
    align-self: center;
  }
`;

const StyledBody = styled(Body)`
  display: flex;
  width: 100%;
  height: 100%;
  color: '#00000073';
  justify-content: center;
  align-items: center;
`;
