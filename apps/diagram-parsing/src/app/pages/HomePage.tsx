import { Heading, Body } from '@cognite/cogs.js';

import { useTranslation } from '../hooks/useTranslation';

export const HomePage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading>{t('contextualize-engineering-diagrams')}</Heading>

      <Body size="large">Under development...</Body>
    </>
  );
};
