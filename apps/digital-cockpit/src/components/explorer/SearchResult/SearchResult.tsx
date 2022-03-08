import { Body } from '@cognite/cogs.js';
import IconContainer from 'components/icons';
import { ResourceType } from 'types/core';

import { SearchResultContainer, SearchResultDetails } from './elements';

export type SearchResultProps = {
  type: ResourceType;
  name?: string;
  description?: string;
  onClick?: () => void;
};

const SearchResult = ({
  type,
  name,
  description,
  onClick,
}: SearchResultProps) => {
  return (
    <SearchResultContainer onClick={onClick}>
      <IconContainer
        type={`Resource.${type}`}
        className="search-result--icon"
      />
      <SearchResultDetails>
        <Body level={2} strong>
          {name}
        </Body>
        {description}
      </SearchResultDetails>
    </SearchResultContainer>
  );
};

export default SearchResult;
