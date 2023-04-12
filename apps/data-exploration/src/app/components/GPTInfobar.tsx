import { Body, Flex, Icon, Infobar } from '@cognite/cogs.js';

import styled from 'styled-components';

export const GPTInfobar = ({ onClose }: { onClose: () => void }) => {
  return (
    <GPTTipContainer>
      <InfobarWrapper close onClose={onClose}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icon type="LightBulb" />
          <Body style={{ paddingLeft: '10.5px' }}>
            Tip: Add a question mark to your search to get ChatGPT powered
            results
          </Body>
        </div>
      </InfobarWrapper>
    </GPTTipContainer>
  );
};

const GPTTipContainer = styled(Flex)`
  padding: 16px;
  padding-bottom: 8px;
  align-items: center;
  display: grid;
`;

const InfobarWrapper = styled(Infobar).attrs({ type: 'neutral' })`
  border-radius: 6px;
  border: 1px solid rgba(64, 120, 240, 0.2);
  color: #3059b3;
  .cogs-infobar--close p {
    margin-left: 0;
  }
`;
