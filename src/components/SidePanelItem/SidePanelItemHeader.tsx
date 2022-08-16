import { Button, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  SidePanelItemInternalProps,
  SidePanelItemProps,
} from './SidePanelItem';

type SidePanelItemHeaderProps<T extends string> = Pick<
  SidePanelItemProps<T>,
  'extraContent' | 'title'
> &
  SidePanelItemInternalProps<T>;

const SidePanelItemHeader = <T extends string>({
  activePanelKey,
  extraContent,
  onChange,
  onClose,
  title,
}: SidePanelItemHeaderProps<T>): JSX.Element => {
  return (
    <StyledHeader>
      {extraContent?.left?.({ activePanelKey, onChange, onClose })}
      <StyledTitle level={5}>
        {typeof title === 'string'
          ? title
          : title({ activePanelKey, onChange, onClose })}
      </StyledTitle>
      <StyledHeaderRight>
        {extraContent?.right && (
          <StyledHeaderExtraContentRight>
            {extraContent.right({ activePanelKey, onChange, onClose })}
          </StyledHeaderExtraContentRight>
        )}
        <Button icon="PanelLeft" onClick={onClose} size="small" />
      </StyledHeaderRight>
    </StyledHeader>
  );
};

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 12px;
`;

const StyledTitle = styled(Title)`
  white-space: nowrap;

  :not(:first-child) {
    margin-left: 8px;
  }
`;

const StyledHeaderRight = styled.div`
  margin-left: auto;
`;

const StyledHeaderExtraContentRight = styled.div`
  margin-right: 8px;
`;

export default SidePanelItemHeader;
