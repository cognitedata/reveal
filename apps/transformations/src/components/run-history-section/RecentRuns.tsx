import styled from 'styled-components';

import { Job } from '@transformations/types';
import { RUN_BOX_SIZE } from '@transformations/utils';

import { Flex } from '@cognite/cogs.js';

import RecentRunItem from './RecentRunItem';

type RecentRunsProps = {
  jobs: Job[];
};

const RecentRuns = ({ jobs }: RecentRunsProps): JSX.Element => {
  return (
    <StyledContainer>
      {jobs.map((job) => (
        <RecentRunItem key={job.id} job={job} />
      ))}
    </StyledContainer>
  );
};

const StyledContainer = styled(Flex).attrs({ gap: 4 })`
  height: ${RUN_BOX_SIZE}px;
  min-height: ${RUN_BOX_SIZE}px;
  overflow: hidden;
`;

export default RecentRuns;
