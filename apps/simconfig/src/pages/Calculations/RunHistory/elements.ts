import styled from 'styled-components/macro';

export const RunDetailsBox = styled.dt`
  margin: 1em;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ssd-title {
    margin-top: 1em;
  }

  .model-title {
    display: flex;
    .version {
      margin-left: 1.5em;
    }
  }

  dl {
    margin: 16px 0;
    dt {
      font-weight: bold;
      &::after {
        content: ':';
      }
    }
  }

  .charts-buttons {
    display: flex;
    flex-direction: column;
    margin-top: 1em;
    a {
      margin-top: 1em;
    }
  }
`;
