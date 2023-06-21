import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { createInternalLink } from '@transformations/utils';

import {
  Body,
  Button,
  Colors,
  Flex,
  Icon,
  Title,
  Modal,
} from '@cognite/cogs.js';

const DMSV3WarningModal = (): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Modal closable={false} hideFooter={true} visible>
      <StyledFDMRedirectInfoContainer>
        <BlueIcon size={48} type="InfoFilled" />
        <Title level={4}>{t('unsupported-destination-type')}</Title>
        <Body level={2}>{t('dms-v3-modal-body')}</Body>
        <Flex gap={8}>
          <Button
            icon="ArrowLeft"
            onClick={() => navigate(createInternalLink(''))}
            type="primary"
          >
            {t('go-back-to-transformation-list')}
          </Button>
        </Flex>
      </StyledFDMRedirectInfoContainer>
    </Modal>
  );
};

const BlueIcon = styled(Icon)`
  color: ${Colors['text-icon--status-neutral']};
`;

const StyledFDMRedirectInfoContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
  padding: 0 24px 12px;
`;

export default DMSV3WarningModal;
