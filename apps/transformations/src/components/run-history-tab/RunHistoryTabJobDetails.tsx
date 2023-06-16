import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import TargetDescription from '@transformations/components/target/TargetDescription';
import {
  useCancelTransformation,
  useDuration,
  useJobDetails,
} from '@transformations/hooks';
import { Job, TransformationRead } from '@transformations/types';
import { useDurationFormat } from '@transformations/utils/time';

import { Timestamp } from '@cognite/cdf-utilities';
import { Body, Button, Colors, Overline, Flex } from '@cognite/cogs.js';

import RunHistoryChart from './RunHistoryChart';

type RunHistoryTabJobDetailsProps = {
  jobId: Job['id'];
  transformationId: TransformationRead['id'];
};

const RunHistoryTabJobDetails = ({
  jobId,
  transformationId,
}: RunHistoryTabJobDetailsProps): JSX.Element => {
  const { t } = useTranslation();

  const { data: details } = useJobDetails(jobId);

  const durationInMs = useDuration(details?.startedTime, details?.finishedTime);
  const duration = useDurationFormat(durationInMs);

  const { mutate: cancelTransformation } = useCancelTransformation();

  const isRunning = !details?.finishedTime;

  const handleCancelRun = () => {
    cancelTransformation(transformationId);
  };

  if (!details) {
    return <></>;
  }

  return (
    <StyledContainer>
      <RunHistoryChart jobId={jobId} />
      <StyledDetailsContainer>
        <StyledDetailsGrid>
          <StyledDetailsFieldContainer>
            <StyledDetailsFieldOverline>
              {t('created')}
            </StyledDetailsFieldOverline>
            <Body level={3}>
              <Timestamp absolute timestamp={details?.createdTime} />
            </Body>
          </StyledDetailsFieldContainer>
          <StyledDetailsFieldContainer>
            <StyledDetailsFieldOverline>
              {t('started')}
            </StyledDetailsFieldOverline>
            <Body level={3}>
              <Timestamp absolute timestamp={details.startedTime} />
            </Body>
          </StyledDetailsFieldContainer>
          <StyledDetailsFieldContainer>
            <StyledDetailsFieldOverline>
              {t('finished')}
            </StyledDetailsFieldOverline>
            <Body level={3}>
              <Timestamp absolute timestamp={details.finishedTime} />
            </Body>
          </StyledDetailsFieldContainer>
          <StyledDetailsFieldContainer>
            <StyledDetailsFieldOverline>Target</StyledDetailsFieldOverline>
            <Body level={3}>
              <TargetDescription
                destination={details.destination}
                conflictMode={details.conflictMode}
              />
            </Body>
          </StyledDetailsFieldContainer>
          <StyledDetailsFieldContainer>
            <StyledDetailsFieldOverline>
              {t('duration')}
            </StyledDetailsFieldOverline>
            <Body level={3}>{duration}</Body>
          </StyledDetailsFieldContainer>
          <StyledDetailsFieldContainer>
            <StyledDetailsFieldOverline>
              {t('run-id')}
            </StyledDetailsFieldOverline>
            <Body level={3}>{details.id}</Body>
          </StyledDetailsFieldContainer>
        </StyledDetailsGrid>
        {isRunning && (
          <Button
            onClick={handleCancelRun}
            css={{ 'align-self': 'flex-start' }}
          >
            {t('cancel-run')}
          </Button>
        )}
      </StyledDetailsContainer>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledDetailsContainer = styled(Flex)`
  flex-direction: column;
  background-color: ${Colors['surface--medium']};
  border-radius: 8px;
  padding: 12px;
  gap: 12px;
`;

const StyledDetailsGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(200px, max-content));
`;

const StyledDetailsFieldContainer = styled.div`
  flex: 1;
`;

const StyledDetailsFieldOverline = styled(Overline).attrs({ level: 3 })`
  color: ${Colors['text-icon--muted']};
  text-transform: uppercase;
`;

export default RunHistoryTabJobDetails;
