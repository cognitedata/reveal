import React from 'react';
import styled from 'styled-components';
import { Icon, Input } from '@cognite/cogs.js';

const Container = styled.article`
  padding: 32px;

  background-color: var(--cogs-white);
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.1), 0 0 4px rgba(0, 0, 0, 0.1);
  border-radius: 16px 0 0 16px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  & h2 {
    font-size: 16px;
  }
`;

const CloseIcon = styled(Icon)`
  cursor: pointer;
`;

const Section = styled.section`
  & details {
    & summary {
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      outline: none;
      cursor: pointer;
    }
    & > div {
      background-color: indianred;
      margin: 16px 0 0 16px;
      & > h3 {
        padding-left: 16px;
        margin-bottom: 4px;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
      }
      & > Input {
        width: 100%;
      }
    }
  }
`;

const DetailView = () => {
  return (
    <Container>
      <Header>
        <h2>Detail View</h2>
        <CloseIcon type="LargeClose" onClick={() => alert('close')} />
      </Header>
      <Section>
        <details>
          <summary>Source</summary>
          <div>
            <h3>Name</h3>
            <Input
              type="text"
              value="perf_L15_L14"
              variant="noBorder"
              disabled
            />
            <h3>External Id</h3>
            <Input
              type="text"
              value="perf_L15_L14"
              variant="noBorder"
              disabled
            />
          </div>
        </details>
      </Section>
    </Container>
  );
};

export default DetailView;
