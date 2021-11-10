import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ProjectConfig } from '@cognite/discover-api-types';

import { SearchBox } from 'components/filters';

import { ConfigFields } from './ConfigFields';
import {
  ProjectConfigSidebar,
  PaddingBottomBorder,
  ConfigFieldsWrapper,
} from './elements';
import { Metadata } from './types';

type Props = {
  metadata: Metadata;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
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
