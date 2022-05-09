import styled from 'styled-components';

export const RowWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 2px solid var(--cogs-greyscale-grey2);
  cursor: pointer;
  &:hover {
    background: #f6f7ff;
  }
  .row--image {
    width: 148px;
    height: 64px;
    background: var(--cogs-greyscale-grey2);
    margin-right: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      object-fit: cover;
      width: 100%;
    }
  }

  .row--meta {
    display: flex;
    flex-direction: column;
    h4,
    div {
      margin: 0;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      color: var(--cogs-greyscale-grey9);
    }
    div {
      color: var(--cogs-greyscale-grey7);
    }
  }
`;

export const TimeSeriesPreviewContainer = styled.div`
  svg {
    overflow: visible;
  }
`;
