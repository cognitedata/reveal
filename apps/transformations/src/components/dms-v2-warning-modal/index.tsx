import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { TransformationRead } from '@transformations/types';
import { createInternalLink } from '@transformations/utils';

import { createLink } from '@cognite/cdf-utilities';
import {
  Body,
  Button,
  Colors,
  Flex,
  Icon,
  Title,
  Modal,
} from '@cognite/cogs.js';

type FDMWarningModalProps = {
  transformation: TransformationRead;
};

const DMSv2WarningModal = ({
  transformation,
}: FDMWarningModalProps): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Modal closable={false} hideFooter={true} visible>
      <StyledFDMRedirectInfoContainer>
        <BlueIcon size={48} type="InfoFilled" />
        <Title level={4}>{t('dms-v2-modal-title')}</Title>
        <Body level={2}>{t('dms-v2-modal-body')}</Body>
        <Flex gap={8}>
          <Button onClick={() => navigate(createInternalLink(''))}>
            {t('go-back-to-transformation-list')}
          </Button>
          <Button
            onClick={() =>
              navigate(
                createLink(`/transformations-previous/${transformation.id}`)
              )
            }
            type="primary"
          >
            {t('dms-v2-modal-ok')}
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

export default DMSv2WarningModal;
