import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { TransformationRead } from '@transformations/types';
import { shouldDisableUpdatesOnTransformation } from '@transformations/utils';

import { Body, Colors, Flex, Icon } from '@cognite/cogs.js';

type TransformationBannerProps = {
  transformation: TransformationRead;
};

const TransformationBanner = ({
  transformation,
}: TransformationBannerProps): JSX.Element => {
  const { t } = useTranslation();
  const { setIsScheduleModalOpen } = useTransformationContext();

  if (shouldDisableUpdatesOnTransformation(transformation)) {
    return (
      <StyledWarningTextContainer>
        <Icon
          css={{ color: Colors['text-icon--status-neutral'] }}
          type="InfoFilled"
        />
        <Body
          level={3}
          strong
          style={{
            color: Colors['text-icon--strong'],
          }}
        >
          {t('you-cannot-edit-scheduled-transformation')}{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsScheduleModalOpen(true);
            }}
          >
            {t('edit-schedule')}.
          </a>
        </Body>
      </StyledWarningTextContainer>
    );
  }

  if (transformation.blocked) {
    return (
      <StyledBlockedTextContainer>
        <Icon
          type="WarningFilled"
          css={{ color: Colors['text-icon--status-critical'] }}
        />
        <Body level={3} strong style={{ color: Colors['text-icon--strong'] }}>
          {transformation.blocked.reason ??
            t(
              'transformation-details-sidebar-panel-history-blocked-warning-title'
            )}
        </Body>
      </StyledBlockedTextContainer>
    );
  }

  return <></>;
};

const StyledBannerTextContainer = styled(Flex).attrs({
  alignItems: 'center',
  gap: 8,
})`
  padding: 12px 16px;
  margin: 12px;
  border-radius: 8px;
`;

const StyledWarningTextContainer = styled(StyledBannerTextContainer)`
  background-color: ${Colors['surface--status-neutral--muted--default--alt']};
  border: 1px solid ${Colors['border--status-neutral--muted']};
`;

const StyledBlockedTextContainer = styled(StyledBannerTextContainer)`
  background-color: ${Colors['surface--status-critical--muted--default--alt']};
  border: 1px solid ${Colors['border--status-critical--muted']};
`;

export default TransformationBanner;
