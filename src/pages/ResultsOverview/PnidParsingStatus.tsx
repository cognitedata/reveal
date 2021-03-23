import React from 'react';
import styled from 'styled-components';
import { Colors, Badge } from '@cognite/cogs.js';
import { Flex } from 'components/Common';

const Indicator = styled(Badge)`
  width: 12px;
  height: 12px;
  align-self: center;
  && {
    padding: 0;
  }
`;

type Props = {
  file: any;
};

export default function PnidParsingStatus({ file }: Props): JSX.Element {
  const { uploadJob, parsingJob } = file;

  if (uploadJob?.jobError) return <FailedStatus message="Failed to upload" />;
  if (parsingJob?.jobError) return <FailedStatus message="Failed to parse" />;

  if (uploadJob) {
    if (uploadJob.jobDone) return <SuccessStatus message="Completed" />;
    return <UploadingStatus />;
  }
  if (parsingJob) {
    if (parsingJob.jobDone) return <SuccessStatus message="Finished" />;
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

const UploadingStatus = (): JSX.Element => (
  <Flex>
    <Indicator
      background={Colors.midblue.hex()}
      text=""
      className="cogs-badge"
    />
    <span>Uploading...</span>
  </Flex>
);
const ParsingStatus = (): JSX.Element => (
  <Flex>
    <Indicator
      background={Colors.warning.hex()}
      text=""
      className="cogs-badge"
    />
    <span>Parsing P&ID...</span>
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
