import { useState } from 'react';

import styled from 'styled-components';

import { Instance } from '../../services/types';
import { ThreeDResults } from '../search/results/ThreeDResults';
import { SearchConfiguration } from '../search/SearchConfiguration';

import { ThreeDSearchTopBar } from './ThreeDSearchTopBar';

interface Props {
  onZoomButtonClick?: (instance: Instance | undefined) => void;
}

export const ThreeDSearchResults: React.FC<Props> = ({ onZoomButtonClick }) => {
  const [displayMapped, setDisplayMapped] = useState(true);

  return (
    <Container>
      <SearchContent>
        <SearchConfiguration />
        <ThreeDSearchTopBar
          displayOnlyMapped3dData={displayMapped}
          onFilterChanged={(value) => {
            setDisplayMapped(value === 'mapped');
          }}
        />
        <ThreeDResults
          onZoomButtonClick={onZoomButtonClick}
          displayOnlyMapped3dData={displayMapped}
        />
      </SearchContent>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  max-height: 100%;
  overflow: auto;
`;

const SearchContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 0 16px;
  overflow-x: hidden;
`;
