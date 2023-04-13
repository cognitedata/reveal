import { Button, Flex } from '@cognite/cogs.js';
import { useTranslations } from 'hooks/translations';
import { makeDefaultTranslations } from 'utils/translations';
import { useState } from 'react';
import { ScheduleClock } from 'components/Icons/ScheduleClock';

import { ScheduledCalculationModal } from './ScheduledCalculationModal';

const defaultTranslations = makeDefaultTranslations('Save and Schedule');

export const ScheduledCalculationButton = () => {
  const { t } = useTranslations(
    Object.keys(defaultTranslations),
    'ScheduledCalculation'
  );

  const [visible, setVisible] = useState<boolean>(false);
  return (
    <>
      <Button onClick={() => setVisible(true)} size="small">
        <Flex gap={8} alignItems="center">
          <ScheduleClock />
          {t['Save and Schedule']}
        </Flex>
      </Button>
      {visible ? (
        <ScheduledCalculationModal
          visible={visible}
          onClose={() => setVisible(false)}
        />
      ) : null}
    </>
  );
};
