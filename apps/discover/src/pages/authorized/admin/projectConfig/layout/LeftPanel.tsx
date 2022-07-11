import React, { useState } from 'react';

import { ProjectConfig } from '@cognite/discover-api-types';

import { SearchBox } from 'components/Filters';
import { useTranslation } from 'hooks/useTranslation';

import { Metadata } from '../../../../../domain/projectConfig/types';
import { ConfigFields } from '../fields/ConfigFields';

import {
  ProjectConfigSidebar,
  PaddingBottomBorder,
  ConfigFieldsWrapper,
} from './elements';

type Props = {
  metadata: Metadata;
  selected: string;
  setSelected: (path: string) => void;
  config?: ProjectConfig;
};

export const LeftPanel: React.FC<Props> = ({
  selected,
  metadata,
  setSelected,
  config,
}) => {
  const { t } = useTranslation();
  const [searchText, handleSearch] = useState<string>('');

  return (
    <ProjectConfigSidebar direction="column">
      <PaddingBottomBorder>
        <SearchBox
          placeholder={t('Search')}
          onSearch={handleSearch}
          value={searchText}
        />
      </PaddingBottomBorder>
      <ConfigFieldsWrapper direction="column" gap={8}>
        <ConfigFields
          prefixPath=""
          metadata={metadata}
          selected={selected}
          setSelected={setSelected}
          config={config}
        />
      </ConfigFieldsWrapper>
    </ProjectConfigSidebar>
  );
};
