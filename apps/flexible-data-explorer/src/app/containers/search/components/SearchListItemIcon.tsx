import styled from 'styled-components';

import { Chip, IconType } from '@cognite/cogs.js';

import { AiSearchIcon } from './AiSearchIcon';

export interface SearchListItemIconProps {
  icon?: IconType | 'AiSearch';
}

export const SearchListItemIcon: React.FC<SearchListItemIconProps> = ({
  icon,
}) => {
  if (icon === 'AiSearch') {
    return (
      <AiSearchIconChip>
        <AiSearchIcon />
      </AiSearchIconChip>
    );
  }

  return (
    <Chip
      icon={icon}
      // NOTE: ugly hack for now
      type={icon === 'List' ? 'success' : 'neutral'}
      size="small"
    />
  );
};

const AiSearchIconChip = styled.div`
  display: flex;
  padding: 6px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background: #8e5cff10;
`;
