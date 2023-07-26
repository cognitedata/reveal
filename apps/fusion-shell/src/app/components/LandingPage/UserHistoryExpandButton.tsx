import styled from 'styled-components';

import { Body, Colors, Flex, Icon, IconType } from '@cognite/cogs.js';

import { useTranslation } from '../../../i18n';

type UserHistoryExpandButtonProps = {
  isExpand: boolean;
  onToggleExpand: () => void;
};

const UserHistoryExpandButton = ({
  isExpand,
  onToggleExpand,
}: UserHistoryExpandButtonProps): JSX.Element => {
  const { t } = useTranslation();

  const buttonProps: {
    label: string;
    iconType: string;
  } = isExpand
    ? {
        label: t('label-view-less'),
        iconType: 'ChevronUpSmall',
      }
    : {
        label: t('label-view-more'),
        iconType: 'ChevronDownSmall',
      };

  return (
    <ExpandUserHistoryTableButton
      role="button"
      onClick={onToggleExpand}
      direction="row"
      justifyContent="center"
      alignItems="center"
      $isExpand={isExpand}
    >
      <Body level={3}>{buttonProps?.label}</Body>
      <Icon type={buttonProps?.iconType as IconType} />
    </ExpandUserHistoryTableButton>
  );
};

const ExpandUserHistoryTableButton = styled(Flex)<{
  $isExpand?: boolean;
}>`
  gap: 8px;
  height: 42px;
  cursor: pointer;
  width: 100%;
  border-top: ${({ $isExpand }) =>
    $isExpand ? `1px solid ${Colors['border--muted']}` : `none`};

  :hover {
    background: ${Colors['surface--interactive--hover']};
  }
`;

export default UserHistoryExpandButton;
