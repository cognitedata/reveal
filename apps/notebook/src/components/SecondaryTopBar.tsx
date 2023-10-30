import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import {
  Body,
  Button,
  Colors,
  Flex,
  Heading,
  Icon,
  PromoChip,
  Tooltip,
} from '@cognite/cogs.js';

const SecondaryTopBar = () => {
  const navigate = useNavigate();

  const handleGoBackClick = () => navigate(createLink('/'));

  return (
    <>
      <StyledContainer>
        <Flex alignItems="center" gap={8} style={{ marginLeft: 12 }}>
          <Button icon="ArrowLeft" onClick={handleGoBackClick} />
          <Heading level={5}>Jupyter Notebooks</Heading>

          <Tooltip
            position="bottom"
            maxWidth="300px"
            content="This feature is available for beta testing and will likely change. Use it for testing purposes only."
          >
            <PromoChip size="x-small">Beta</PromoChip>
          </Tooltip>
        </Flex>

        <Flex
          id="secondary-topbar-left"
          style={{ flex: 1, marginRight: 12 }}
          justifyContent="end"
        >
          <Flex
            gap={2}
            alignItems="center"
            style={{
              border: '1px solid var(--cogs-border--status-neutral--muted)',
              background: 'var(--cogs-surface--status-neutral--muted--default)',
              padding: 8,
              borderRadius: '32px',
              color: 'var(--cogs-text-icon--status-neutral)',
            }}
          >
            <Icon type="InfoFilled" />
            <Body size="small">Notebooks saved in folder</Body>
            <Icon type="FolderFilled" />
            <Body size="small">CDF are synced to CDF</Body>
          </Flex>
        </Flex>
      </StyledContainer>
    </>
  );
};

const StyledContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--muted']};
  display: flex;
  height: 56px;
  justify-content: space-between;
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  padding-left: 4px;
`;

export default SecondaryTopBar;
