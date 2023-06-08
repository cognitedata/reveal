import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { JobStatus } from 'modules/types';

export const SetUpWrapper = styled.div.attrs(
  ({ jobStatus }: { jobStatus: JobStatus }) => {
    const style: React.CSSProperties = {
      border: `1px solid ${Colors['decorative--blue--600']}`,
      backgroundColor: `#f6f9ff`,
    };
    if (jobStatus === 'done') {
      style.border = `1px solid ${Colors['decorative--grayscale--400']}`;
      style.backgroundColor = Colors['decorative--grayscale--white'];
    }
    if (
      jobStatus === 'incomplete' ||
      jobStatus === 'error' ||
      jobStatus === 'rejected'
    ) {
      style.border = `1px solid ${Colors['decorative--yellow--300']}`;
      style.backgroundColor = `${Colors['decorative--yellow--100']}`;
    }
    return { style };
  }
)<{ jobStatus: JobStatus }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  margin: 0 16px 0 0;
  border-radius: 8px;
  max-width: 1024px;
  width: 100%;
`;

export const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  margin: 16px 0 28px 0;

  & > div > * {
    margin: 3px;
  }
  & > div > :first-child {
    margin-left: 0;
  }
  & > div > :last-child {
    margin-right: 0;
  }
`;
