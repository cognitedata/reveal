import * as React from 'react';

import styled from 'styled-components/macro';

import { useProjectConfig } from 'hooks/useProjectConfig';
import { useFilterBarIsOpen } from 'modules/sidebar/selectors';
import { Flex, sizes } from 'styles/layout';

import { BaseFilter } from '../components/BaseFilter';

import { DocumentFilter } from './DocumentFilter';
import { SeismicFilter } from './SeismicFilter';
import { WellsFilter } from './well/WellFilters';

const FiltersContainer = styled(Flex)`
  flex: 1;
  flex-direction: column;
  padding: ${sizes.normal};
`;

export const LandingFilter: React.FC = React.memo(() => {
  const { data: projectConfig } = useProjectConfig();
  const isOpen = useFilterBarIsOpen();

  if (!projectConfig) {
    return null;
  }

  return (
    <BaseFilter>
      <FiltersContainer>
        {isOpen && (
          <>
            <DocumentFilter.Title />
            {!projectConfig?.wells?.disabled && <WellsFilter.Title />}
            {!projectConfig?.seismic?.disabled && <SeismicFilter.Title />}
          </>
        )}
      </FiltersContainer>
    </BaseFilter>
  );
});
