import { Button, Body, Flex } from '@cognite/cogs.js';
import styled from 'styled-components';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useState } from 'react';

type Props = {
  onLoadClick: () => void;
  doesSupportAcl: boolean;
};

export function TransformationPlaceholder({
  onLoadClick,
  doesSupportAcl,
}: Props) {
  const { t } = useTranslation('Transformation');
  const [isShown, toggleShown] = useState(true);
  return isShown ? (
    <Wrapper data-cy="transformation-placeholder">
      <BasicPlaceholder type="Search" onClose={() => toggleShown(false)}>
        <Flex direction="column" justifyContent="center" alignItems="center">
          <Body level="1" strong style={{ fontSize: 18, marginBottom: 8 }}>
            {t(
              'transformation-placeholder-title',
              'Your data model has currently no data'
            )}
          </Body>

          <Body level="2">
            {doesSupportAcl
              ? t(
                  'transformation-placeholder-body',
                  'You have to load data through transformations.'
                )
              : t(
                  'transformation-acl-message',
                  'You do not have enough permissions to load data.'
                )}
          </Body>
          <StyledButton
            type="primary"
            icon="ExternalLink"
            iconPlacement="right"
            onClick={onLoadClick}
            aria-label="Load transformation"
            data-cy="load-transformation"
            disabled={!doesSupportAcl}
          >
            {t('transformation-placeholder-button', 'Load data')}
          </StyledButton>
        </Flex>
      </BasicPlaceholder>
    </Wrapper>
  ) : null;
}

const StyledButton = styled(Button)`
  && {
    width: 120px;
    margin-top: 24px;
  }
`;

const Wrapper = styled.div`
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  top: 25%;
  margin: auto;
  width: 440px;
  height: 320px;
  border-radius: 16px;
  background: #fafafa;
  box-shadow: 0px 1px 16px 4px rgba(79, 82, 104, 0.1),
    0px 1px 8px rgba(79, 82, 104, 0.08), 0px 1px 2px rgba(79, 82, 104, 0.24);
`;
