import { Button, Flex } from '@cognite/cogs.js';

import { useTranslation } from 'common';

const CanvasTopbarPublishButton = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Flex gap={8}>
      <Button type="primary">{t('publish')}</Button>
    </Flex>
  );
};

export default CanvasTopbarPublishButton;
