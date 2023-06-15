import styled from 'styled-components';

import { useTranslation } from '@transformations/common/i18n';
import Tooltip from '@transformations/components/tooltip';
import { ProfileResultType } from '@transformations/hooks/profiling-service';
import { TOOLTIP_DELAY_IN_MS } from '@transformations/utils/constants';

import { Colors, Icon } from '@cognite/cogs.js';

type ProfileStatusIconProps = {
  resultType: ProfileResultType | undefined;
};

const ProfileStatusIcon = ({
  resultType,
}: ProfileStatusIconProps): JSX.Element => {
  const { t } = useTranslation();

  switch (resultType) {
    case 'running':
      return (
        <Tooltip
          content={t('data-profiling-running-info')}
          delay={TOOLTIP_DELAY_IN_MS}
          wrapped
        >
          <StyledLoader />
        </Tooltip>
      );
    case 'partial':
      return (
        <Tooltip
          content={t('data-profiling-partial-info')}
          delay={TOOLTIP_DELAY_IN_MS}
          wrapped
        >
          <StyledWarningIcon />
        </Tooltip>
      );
    case 'complete':
      return (
        <Tooltip
          content={t('data-profiling-complete-info')}
          delay={TOOLTIP_DELAY_IN_MS}
          wrapped
        >
          <StyledSuccessIcon />
        </Tooltip>
      );
    default:
      return <></>;
  }
};

const StyledLoader = styled(Icon).attrs({ type: 'Loader' })`
  margin: 4px 6px 0;
`;

const StyledSuccessIcon = styled(Icon).attrs({ type: 'CheckmarkFilled' })`
  margin: 4px 6px 0;
  color: ${Colors['text-icon--status-success']};
`;

const StyledWarningIcon = styled(Icon).attrs({ type: 'WarningFilled' })`
  margin: 4px 6px 0;
  color: ${Colors['text-icon--status-warning']};
`;

export default ProfileStatusIcon;
