import React from 'react';

import styled from 'styled-components/macro';

import { useTenantConfig } from 'hooks/useTenantConfig';
import { useFilterBarIsOpen } from 'modules/sidebar/selectors';
import { Flex, sizes } from 'styles/layout';

import { BaseFilter } from '../components/BaseFilter';

import { DocumentFilter } from './DocumentFilter';
import { SeismicFilter } from './SeismicFilter';
import { WellsFilter } from './WellsFilter';

const FiltersContainer = styled(Flex)`
  flex: 1;
  flex-direction: column;
  padding: ${sizes.normal};
`;

export const LandingFilter: React.FC = React.memo(() => {
  const { data: tenantConfig } = useTenantConfig();
  const isOpen = useFilterBarIsOpen();

  if (!tenantConfig) {
    return null;
  }

  return (
    <BaseFilter>
      <FiltersContainer>
        {isOpen && (
          <>
            <DocumentFilter.Title />
            {!tenantConfig?.wells?.disabled && <WellsFilter.Title />}
            {!tenantConfig?.seismic?.disabled && <SeismicFilter.Title />}
          </>
        )}
      </FiltersContainer>
    </BaseFilter>
  );
});
