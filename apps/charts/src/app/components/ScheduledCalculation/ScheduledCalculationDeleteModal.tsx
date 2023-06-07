import { useState } from 'react';
import { Trans } from 'react-i18next';

import styled from 'styled-components';

import { useTranslations } from '@charts-app/hooks/translations';
import { makeDefaultTranslations } from '@charts-app/utils/translations';

import { Flex, Title, Button, Body, Checkbox, Icon } from '@cognite/cogs.js';

import { StyledModal } from './elements';

const StyledDeleteIcon = styled(Icon)`
  color: var(--cogs-text-icon--status-critical);
`;

const DeleteModalHeader = ({ title }: { title: string }) => {
  return (
    <Flex gap={12} alignItems="center">
      <StyledDeleteIcon type="Delete" />
      <Title level={5}>{title}</Title>
    </Flex>
  );
};

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
    <StyledModal
      visible
      title={<DeleteModalHeader title="Delete scheduled calculation" />}
      width={600}
      onCancel={onCancel}
      footer={
        <Flex justifyContent="end" gap={16}>
          <Button type="ghost" onClick={onCancel}>
            {t.Cancel}
          </Button>
          <Button
            type="danger"
            onClick={async () => {
              try {
                setIsDeleting(true);
                await onOk(deleteTimeseries);
              } finally {
                setIsDeleting(false);
              }
            }}
            loading={isDeleting}
          >
            {t['Yes, delete scheduled']}
          </Button>
        </Flex>
      }
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
    </StyledModal>
  );
};
