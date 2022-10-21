import { Flex, Icon, IconType, Label, Tooltip } from '@cognite/cogs.js';
import Typography from 'antd/lib/typography';
import { useTranslation } from 'common/i18n';
import styled from 'styled-components';

const { Text } = Typography;

type TabTitleProps = {
  key?: string;
  iconType?: IconType | undefined;
  title: string;
  disabled?: boolean | undefined;
  isTooltip?: boolean | undefined;
  label?: string | number;
};

const TabTitle = ({
  disabled = false,
  iconType,
  title,
  isTooltip,
  label,
  key,
}: TabTitleProps): JSX.Element => {
  const { t } = useTranslation();

  const getTitle = () => {
    return (
      <Flex direction="row" alignItems="center" gap={6}>
        {iconType && <Icon type={iconType}></Icon>}
        <StyledTitle disabled={disabled}>{title}</StyledTitle>
        {label && (
          <Label variant="unknown" size="small">
            {label}
          </Label>
        )}
      </Flex>
    );
  };

  if (isTooltip) {
    return (
      <Tooltip
        content={
          <p>
            {t('resource-count-p1-1', { resourceName: title })}{' '}
            <b>{key?.toLocaleLowerCase()}:read</b> {t('resource-count-p1-2')}
            <br />
            <b style={{ fontStyle: 'italic' }}>{t('resource-count-p2')}</b>
          </p>
        }
        wrapped
      >
        {getTitle()}
      </Tooltip>
    );
  }

  return getTitle();
};

const StyledTitle = styled(Text)`
  font-weight: 500;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.9);
`;

export default TabTitle;
