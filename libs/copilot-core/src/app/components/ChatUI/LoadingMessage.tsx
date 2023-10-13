import styled from 'styled-components';

import { Body, Flex, Icon } from '@cognite/cogs.js';

import { useCopilotContext } from '../../hooks/useCopilotContext';

export const LoadingMessage = () => {
  const { loadingStatus } = useCopilotContext();

  if (loadingStatus) {
    return (
      <Wrapper
        style={{ padding: 16 }}
        justifyContent="center"
        alignItems="center"
        direction="row"
      >
        <div id="wrapper">
          <Icon type="Loader" />
          <Body level={3}>{loadingStatus.status}</Body>
        </div>
      </Wrapper>
    );
  }
  return <></>;
};

const Wrapper = styled(Flex)`
  color: #6f3be4;
  width: 100%;
  .cogs-body-3 {
    color: #6f3be4;
    flex: 1;
  }
  #wrapper {
    display: inline-flex;
    direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
`;
