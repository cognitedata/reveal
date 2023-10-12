import styled from 'styled-components';

import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { Job } from '@transformations/types';
import {
  ColorStatus,
  getIconPropsFromJobStatus,
  RUN_BOX_SIZE,
} from '@transformations/utils';

import { Colors } from '@cognite/cogs.js';

import RecentRunItemTooltip from './RecentRunItemTooltip';

interface RecentRunItemProps {
  job: Job;
}

const RecentRunItem = ({ job }: RecentRunItemProps) => {
  const iconProps = getIconPropsFromJobStatus(job.status);
  const { expandRunHistoryCard } = useTransformationContext();

  const handleClick = (id: number) => {
    expandRunHistoryCard(id);
  };

  return (
    <RecentRunItemTooltip job={job}>
      <StyledRunBox
        $color={iconProps.status}
        href={`${window.location.origin}${window.location.pathname}${window.location.search}#${job.id}`}
        onClick={() => handleClick(job.id)}
      />
    </RecentRunItemTooltip>
  );
};

const StyledRunBox = styled.a<{
  $color: ColorStatus;
}>`
  background-color: ${({ $color }) =>
    Colors[`surface--status-${$color}--muted--default`]};
  border-radius: 4px;
  display: block;
  height: ${RUN_BOX_SIZE}px;
  transition: all 0.3s linear;
  width: ${RUN_BOX_SIZE}px;

  :hover {
    background-color: ${({ $color }) =>
      Colors[`surface--status-${$color}--strong--hover`]};
  }
`;

export default RecentRunItem;
