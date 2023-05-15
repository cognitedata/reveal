import { Flex, Button, Body, Checkbox } from '@cognite/cogs.js';
import { useTranslations } from 'hooks/translations';
import { makeDefaultTranslations } from 'utils/translations';
import { useState } from 'react';
import { StyledModal, DeleteModalHeader } from './elements';

type Props = {
  name: string;
  onOk: (deleteTimeseries: boolean) => void;
  onCancel: () => void;
};

const defaultTranslations = makeDefaultTranslations(
  'Delete scheduled calculation?',
  'Delete result of calculation (time series)',
  'Yes, delete scheduled',
  'Cancel'
);

export const ScheduledCalculationDeleteModal = ({
  name,
  onOk,
  onCancel,
}: Props) => {
  const { t } = useTranslations(
    Object.keys(defaultTranslations),
    'ScheduledCalculationDeleteModal'
  );
  const [deleteTimeseries, setDeleteTimeseries] = useState(true);
  return (
    <StyledModal
      appElement={document.getElementsByTagName('body')}
      visible
      title={<DeleteModalHeader title="Delete scheduled calculation" />}
      width={600}
      onCancel={onCancel}
      footer={
        <Flex justifyContent="end" gap={16}>
          <Button type="ghost" onClick={onCancel}>
            {t.Cancel}
          </Button>
          <Button type="danger" onClick={() => onOk(deleteTimeseries)}>
            {t['Yes, delete scheduled']}
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" gap={16}>
        <Body level={2} strong>
          {`The schedule ${name} will be deleted forever and can't be restored.`}
        </Body>
        <Checkbox
          onChange={(val) => setDeleteTimeseries(val)}
          name="DeleteScheduledCalculation"
          checked={deleteTimeseries}
          value={deleteTimeseries}
        >
          {t['Delete result of calculation (time series)']}
        </Checkbox>
      </Flex>
    </StyledModal>
  );
};
