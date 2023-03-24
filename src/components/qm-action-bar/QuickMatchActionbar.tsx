import {
  Button,
  ButtonProps,
  Icon,
  IconProps,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { useTranslation } from 'common/i18n';
import { RawSource, SourceType } from 'types/api';

type QuickMatchActionBarProps = {
  selectedRows: RawSource[] | number[];
  sourceType: SourceType;
  onClose: () => void;
};

const QuickMatchActionBar = ({
  selectedRows,
  sourceType,
  onClose,
}: QuickMatchActionBarProps) => {
  const { t } = useTranslation();
  const shouldDisplay = !!selectedRows.length;

  if (!shouldDisplay) {
    return null;
  }

  return (
    <>
      <StyledActionBarContainer>
        <StyledActionBarInfo>
          <StyledActionBarTitle>
            {t('n-source-type-selected', {
              count: selectedRows.length || 0,
              sourceType: sourceType,
            })}
          </StyledActionBarTitle>
        </StyledActionBarInfo>
        <StyledActionBarButtonGroup>
          <Tooltip
            content={t('clear-selection')}
            css={{ transform: 'translateY(-8px)' }}
          >
            <StyledActionButton
              iconType="Close"
              onClick={onClose}
              aria-label={t('close')}
              inverted
            />
          </Tooltip>
        </StyledActionBarButtonGroup>
      </StyledActionBarContainer>
    </>
  );
};

export default QuickMatchActionBar;

const StyledActionBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  inset: auto 40px 24px;
  height: 56px;
  padding: 0px 16px;
  background-color: rgba(0, 0, 0, 0.9);
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
`;

const StyledActionBarInfo = styled.div`
  display: flex;
  gap: 4px;
  flex-direction: column;
`;

const StyledActionBarTitle = styled(Title).attrs({
  level: 5,
})`
  letter-spacing: -0.01em;
  color: #fff;
`;

const StyledActionBarButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

type ActionButtonProps = ButtonProps & {
  iconType?: IconProps['type'];
  text?: string;
};

const ActionButton = ({
  type = 'ghost',
  text,
  iconType,
  onClick,
  ...props
}: ActionButtonProps) => (
  <Button type={type as any} onClick={onClick} {...props}>
    {iconType && <Icon type={iconType} />}
    {text && <span>{text}</span>}
  </Button>
);

const StyledActionButton = styled(ActionButton)`
  color: ${(props) => {
    switch (props.type) {
      case 'ghost-destructive':
        return '#ff928a';
      case 'secondary':
        return 'rgba(0, 0, 0, 0.9)';
      default:
        return '#fff';
    }
  }};

  &:hover {
    color: rgba(0, 0, 0, 0.9);
    opacity: 1;
  }

  i:not(:only-child) {
    margin-right: 10px;
  }
`;
