import { Flex, Icon, Chip, Menu } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const FilterButtonText = styled.span`
  margin-right: auto;
`;

export const SearchInputWrapper = styled.div`
  margin-bottom: 8px;
`;

export const SortActionWrapper = styled.div`
  .cogs-label {
    color: var(--cogs-text-icon--muted);
    font-size: 12px;
    background: none;
    margin: -4px;
    cursor: pointer;

    :hover {
      background: none;
    }
  }
`;

export const OptionWrapper = styled(Flex)`
  flex-direction: row;
  padding: 8px;
  border-radius: 6px;
  align-items: center;

  :hover {
    background: var(--cogs-surface--interactive--hover);
  }
`;

export const LabelWrapper = styled(Flex)`
  flex-direction: column;
  /* width: 100%; */
  margin-right: 16px;
`;

export const OptionLabel = styled.span`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
`;

export const OptionSecondaryLabel = styled.span`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: var(--cogs-text-icon--muted);
  margin-left: 26px;
  margin-top: 2px;
`;

export const ChildOptionsIcon = styled(Icon).attrs({
  type: 'ChevronRightLarge',
})`
  & > svg {
    width: 16px;
  }
  margin-left: 8px;
  visibility: ${(props: { visible: boolean }) =>
    props.visible ? 'visible' : 'hidden'};
`;

export const ApplyButtonWrapper = styled.div`
  margin-top: 4px;
`;

export const EmptyStateText = styled.span`
  color: var(--cogs-text-icon--muted);
  margin: auto;
`;

export const OptionContainer = styled.div`
  overflow: auto;
`;

export const OptionMenuContainer: any = styled(Menu)`
  max-height: 350px;
  overflow: auto;
  max-width: 270px;
`;

export const OptionMenuLoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 16px;
  gap: 8px;
  text-align: center;
`;

export const OptionCount = styled.div`
  display: flex;
  align-items: center;
  background: var(--cogs-surface--status-neutral--muted--default);
  color: var(--cogs-text-icon--status-neutral);
  padding: 2px 6px;
  margin-left: auto;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
`;

export const OptionCountDisabled = styled(OptionCount)`
  background: var(--cogs-surface--status-undefined--muted--default);
  color: var(--cogs-text-icon--status-undefined);
`;
