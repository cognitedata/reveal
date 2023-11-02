import { Flex } from '@cognite/cogs.js';

import { PageHeader, SitesSideBarContainer } from '../components';
import { useTranslation } from '../hooks/useTranslation';

import { FilesView } from '.';

export const HomePage = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t('contextualize-engineering-diagrams')}
        subtitle={t('page-header-subtitle')}
      />

      <Flex>
        <SitesSideBarContainer />
        <FilesView />
      </Flex>
    </>
  );
};
