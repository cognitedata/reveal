import React from 'react';
import styled from 'styled-components';
import { Colors, Badge } from '@cognite/cogs.js';
import { Flex } from 'components/Common';
import { useParsingJob } from 'modules/contextualization/pnidParsing/hooks';

const Indicator = styled(Badge)`
  width: 12px;
  height: 12px;
  align-self: center;
  && {
    padding: 0;
  }
`;

type Props = {
  workflowId: number;
  file: any;
};

export default function PnidParsingStatus({
  workflowId,
  file,
}: Props): JSX.Element {
  const {
    status: parsingJobStatus,
    jobId,
    failedFiles,
  } = useParsingJob(workflowId);

  const didFileFail = failedFiles?.find(
    (failedFile) => failedFile.fileId === file?.id
  );

  if (parsingJobStatus === 'Failed')
    return <FailedStatus message="Parsing job failed" />;

  if (jobId) {
    if (didFileFail)
      return (
        <FailedStatus
          message={didFileFail?.errorMessage ?? 'Failed to parse file'}
        />
      );
    if (parsingJobStatus === 'Completed')
      return <SuccessStatus message="Finished" />;
    return <ParsingStatus />;
  }
  return <PendingStatus />;
}

const PendingStatus = (): JSX.Element => (
  <Flex>
    <Indicator
      background={Colors['text-color-secondary'].hex()}
      text=""
      className="cogs-badge"
    />
    <span>Pending...</span>
  </Flex>
);

const ParsingStatus = (): JSX.Element => (
  <Flex>
    <Indicator
      background={Colors.warning.hex()}
      text=""
      className="cogs-badge"
    />
    <span>Parsing diagrams...</span>
  </Flex>
);

const FailedStatus = ({ message }: { message: string }): JSX.Element => (
  <Flex>
    <Indicator
      background={Colors.danger.hex()}
      text=""
      className="cogs-badge"
    />
    <span>{message}</span>
  </Flex>
);

const SuccessStatus = ({ message }: { message: string }): JSX.Element => (
  <Flex>
    <Indicator
      background={Colors.success.hex()}
      text=""
      className="cogs-badge"
    />
    <span>{message}</span>
  </Flex>
);
