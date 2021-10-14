import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchBox } from 'components/filters';

import { ConfigFields } from './ConfigFields';
import {
  ProjectConfigSidebar,
  SearchBoxWrapper,
  ConfigFieldsWrapper,
} from './elements';
import { Config, Metadata } from './types';

type Props = {
  metadata: Metadata;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  config?: Config;
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
      <SearchBoxWrapper>
        <SearchBox
          placeholder={t('Search')}
          onSearch={handleSearch}
          value={searchText}
        />
      </SearchBoxWrapper>
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
