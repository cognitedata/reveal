import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Configuration = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
`;

const System = styled.div`
  background-color: var(--cogs-white);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 468px;
`;

const SystemConfiguration = styled(Configuration)`
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  padding: 16px;
  & p {
    text-align: center;
    color: var(--cogs-greyscale-grey5);
    font-weight: bold;
  }
`;

const Source = styled(System)``;

const Target = styled(System)``;

const SystemHeader = styled(Header)`
  margin-bottom: unset;
  padding: 16px 32px;
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
`;

const Arrow = styled.div`
  padding: 40px;
  display: flex;
  justify-content: center;
  width: max(296px, 50px);
  & svg {
    width: 100%;
    stroke: var(--cogs-greyscale-grey4);
  }
`;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const New = () => {
  const query = useQuery();
  const name = query.get('name');

  return (
    <>
      <Header>
        <b>{name}</b>
        <Button type="primary" style={{ height: '36px' }} disabled>
          Save Configuration
        </Button>
      </Header>
      <Configuration>
        <Source>
          <SystemHeader>
            <b>Petrel Studio</b>
            <Icon type="Settings" />
          </SystemHeader>
          <SystemConfiguration>
            <p>No Source repository selected</p>
            <Button type="primary">Configure</Button>
          </SystemConfiguration>
        </Source>
        <Arrow>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 300 31"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
              d="M2 16.6337h296L283.383 2M2 16.6337h296l-14.617 11.973"
            />
          </svg>
        </Arrow>
        <Target>
          <SystemHeader>
            <b>Open Works</b>
            <Icon type="Settings" />
          </SystemHeader>

          <SystemConfiguration>
            <p>No Target repository selected</p>
            <Button type="primary">Configure</Button>
          </SystemConfiguration>
        </Target>
      </Configuration>
    </>
  );
};

export default New;
