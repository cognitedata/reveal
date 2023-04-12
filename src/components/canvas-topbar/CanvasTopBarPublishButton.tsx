import { Button, Flex } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import { Flow } from 'types';

type CanvasTopbarPublishButtonProps = {
  flow: Flow;
};

const CanvasTopbarPublishButton = ({
  flow,
}: CanvasTopbarPublishButtonProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Flex gap={8}>
      <Button type="primary">{t('publish')}</Button>
    </Flex>
  );
};

export default CanvasTopbarPublishButton;
