import { Button, Flex } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import { Flow } from 'types';

type CanvasTopbarDiscardChangesButtonProps = {
  flow: Flow;
};

const CanvasTopbarDiscardChangesButton = ({
  flow,
}: CanvasTopbarDiscardChangesButtonProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Flex gap={8}>
      <Button>{t('details-discard-changes')}</Button>
    </Flex>
  );
};

export default CanvasTopbarDiscardChangesButton;
