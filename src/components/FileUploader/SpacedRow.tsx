/*
 * Taken from data-exploration because of FileUploader
 */
import styled from 'styled-components';

export const SpacedRow = styled.div`
  display: flex;
  align-items: stretch;

  & > * {
    margin-right: 6px;
    display: inline-flex;
  }
  .spacer {
    flex: 1;
  }
  & > *:nth-last-child(1) {
    margin-right: 0;
  }
`;
