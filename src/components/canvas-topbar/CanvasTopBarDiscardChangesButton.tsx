import { Button, Flex } from '@cognite/cogs.js';

import { useTranslation } from 'common';

const CanvasTopbarDiscardChangesButton = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Flex gap={8}>
      <Button>{t('details-discard-changes')}</Button>
    </Flex>
  );
};

export default CanvasTopbarDiscardChangesButton;
