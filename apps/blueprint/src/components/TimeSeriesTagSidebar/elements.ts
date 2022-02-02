import styled from 'styled-components';

export const FormWrapper = styled.div<{ isAdmin: boolean }>`
  .adminOnly {
    display: ${(props) => (props.isAdmin ? 'block' : 'none')};
  }

  section {
    margin-bottom: 16px;
    h3 {
      font-size: 16px;
      line-height: 24px;
      color: #595959;
      margin-bottom: 8px;
    }
  }

  .chart {
    border-bottom: 1px solid var(--cogs-greyscale-grey4);
    background: var(--cogs-greyscale-grey1);
    padding: 8px 16px;
    // Compensation for forced drawer styles
    margin-left: -16px;
    margin-right: -16px;
    margin-top: -16px;
  }

  .indicator-range {
    .inputs {
      display: flex;
      gap: 8px;
      input {
        width: 50%;
      }
    }
  }

  .options {
    label {
      margin-bottom: 8px;
    }
  }
`;

export const TimeSeriesPreviewWrapper = styled.div`
  .display-value {
    font-weight: bold;
    font-size: 32px;
    line-height: 48px;

    letter-spacing: -0.02em;
  }
  header {
    margin-bottom: 16px;
  }

  .chart-container {
    position: relative;
    .min,
    .max {
      position: absolute;
      right: 0;
    }
    .max {
      top: 0;
    }
    .min {
      bottom: 0;
    }
  }
`;
