import styled from 'styled-components';

import { useTranslation } from '@transformations/common/i18n';
import ProfileStatusIcon from '@transformations/components/profile-status';
import Separator from '@transformations/components/separator';
import { ProfileResultType } from '@transformations/hooks/profiling-service';
import { Typography } from 'antd';

import { Colors, Flex, Icon } from '@cognite/cogs.js';

const { Text } = Typography;

type ProfileSubActionsProps = {
  isProfileRowColumnCountLoading?: boolean;
  isProfileRowColumnCountFetched?: boolean;
  rowCount?: number;
  columnCount?: number;
  profileResultType?: ProfileResultType;
};

const ProfileSubActions = ({
  isProfileRowColumnCountLoading,
  rowCount: profileRowCount,
  columnCount: profileColCount,
  profileResultType,
}: ProfileSubActionsProps): JSX.Element => {
  const { t } = useTranslation();

  if (!isProfileRowColumnCountLoading) {
    <StyledLastUpdatedTimeLoaderIcon type="Loader" />;
  }

  return (
    <Flex justifyContent="center" alignItems="center">
      <StyledText>
        {t('row-profiled')}&nbsp;:&nbsp;<strong>{profileRowCount}</strong>
      </StyledText>
      <ProfileStatusIcon resultType={profileResultType} />
      <StyledText style={{ marginLeft: '6px' }}>
        {t('column-profiled')}&nbsp;:&nbsp;<strong>{profileColCount}</strong>
      </StyledText>
      <Separator style={{ margin: '0 12px' }} />
    </Flex>
  );
};

const StyledText = styled(Text)`
  white-space: nowrap;
`;

const StyledLastUpdatedTimeLoaderIcon = styled(Icon)`
  color: ${Colors['decorative--grayscale--400']};
  margin: 0 5px;
`;

export default ProfileSubActions;
