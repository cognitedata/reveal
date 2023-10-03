import { useState } from 'react';
import { Trans } from 'react-i18next';

import { Flex, Body, Checkbox, Modal } from '@cognite/cogs.js';

import { useTranslations } from '../../hooks/translations';
import { makeDefaultTranslations } from '../../utils/translations';

type Props = {
  name: string;
  onOk: (deleteTimeseries: boolean) => Promise<void>;
  onCancel: () => void;
};

const defaultTranslations = makeDefaultTranslations(
  'Delete scheduled calculation?',
  'Delete saved time series',
  'Yes, delete scheduled',
  'Cancel',
  'The scheduled <strong>{{name}}</strong> will be deleted forever and cannot be restored.'
);

export const ScheduledCalculationDeleteModal = ({
  name,
  onOk,
  onCancel,
}: Props) => {
  const { t, translate } = useTranslations(
    Object.keys(defaultTranslations),
    'ScheduledCalculationDeleteModal'
  );
  const [deleteTimeseries, setDeleteTimeseries] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <Modal
      visible
      icon="Delete"
      title="Delete scheduled calculation"
      onCancel={onCancel}
      okDisabled={isDeleting}
      destructive
      onOk={async () => {
        try {
          setIsDeleting(true);
          await onOk(deleteTimeseries);
        } finally {
          setIsDeleting(false);
        }
      }}
      okText={t['Yes, delete scheduled']}
    >
      <Flex direction="column" gap={16}>
        <Body level={2} as="span">
          <Trans
            i18nKey="The scheduled <strong>{{name}}</strong> will be deleted forever and cannot be restored."
            t={translate}
            values={{ name }}
          />
        </Body>
        <Checkbox
          onChange={(e) => setDeleteTimeseries(e.target.checked)}
          name="DeleteScheduledCalculation"
          checked={deleteTimeseries}
        >
          {t['Delete saved time series']}
        </Checkbox>
      </Flex>
    </Modal>
  );
};
