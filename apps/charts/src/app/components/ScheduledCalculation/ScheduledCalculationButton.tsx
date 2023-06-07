import { Button, Flex } from '@cognite/cogs.js';
import { useTranslations } from '@charts-app/hooks/translations';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { useState } from 'react';
import { ScheduleClock } from '@charts-app/components/Icons/ScheduleClock';

import { ScheduledCalculationModal } from './ScheduledCalculationModal';

const defaultTranslations = makeDefaultTranslations('Save and Schedule');

export const ScheduledCalculationButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
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
          onClose={() => setVisible(false)}
          workflowId={workflowId}
        />
      ) : null}
    </>
  );
};
