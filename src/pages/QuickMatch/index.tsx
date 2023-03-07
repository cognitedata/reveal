import { SecondaryTopbar } from '@cognite/cdf-utilities';
import { Body as _Body, Button, Colors, Flex } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import ViewModel from 'components/view-model';
import ModelConfiguration from 'components/model-configation';
import QuickMatchTitle from 'components/quick-match-title';
import ResourceSelectionTable from 'components/resource-selector-table';
import TargetSelectionTable from 'components/target-selector-table';
import { useQuickMatchContext } from 'context/QuickMatchContext';

import styled from 'styled-components';

export default function QuickMatch() {
  const { t } = useTranslation();
  const { step, hasNextStep, hasPrevStep, popStep, pushStep } =
    useQuickMatchContext();

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      <SecondaryTopbar title={t('quick-match')} />

      <Body>
        <QuickMatchTitle />
        {step === 'sourceSelect' && <ResourceSelectionTable />}
        {step === 'targetSelect' && <TargetSelectionTable />}
        {step === 'modelParams' && <ModelConfiguration />}
        {step === 'viewModel' && <ViewModel />}
      </Body>
      <BottomRow justifyContent="space-between">
        <Button disabled={!hasPrevStep()} onClick={() => popStep()}>
          {t('navigate-back')}
        </Button>
        <Button
          disabled={!hasNextStep()}
          onClick={() => {
            pushStep();
          }}
          type="primary"
        >
          {t('navigate-next')}
        </Button>
      </BottomRow>
    </Flex>
  );
}

const Body = styled(_Body)`
  padding: 12px 24px;
  flex-grow: 1;
  border-top: 1px solid ${Colors['border--muted']};
  border-bottom: 1px solid ${Colors['border--muted']};
`;

const BottomRow = styled(Flex)`
  padding: 8px;
`;
