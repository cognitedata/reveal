import { SecondaryTopbar } from '@cognite/cdf-utilities';
import { Body as _Body, Button, Colors, Flex } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import QuickMatchTitle from 'components/quick-match-title';
import { useQuickMatchContext } from 'context/QuickMatchContext';
import { Route, Routes } from 'react-router-dom';
import SelectSources from './select-sources';
import CreateModel from './create-model';
import ConfigureModel from './configure-model';
import SelectTargets from './select-targets';

const QuickMatchCreate = (): JSX.Element => {
  const { t } = useTranslation();
  const { hasNextStep, hasPrevStep, popStep, pushStep } =
    useQuickMatchContext();

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      <SecondaryTopbar title={t('quick-match')} />

      <Body>
        <QuickMatchTitle />
        <Routes>
          <Route path="/select-sources" element={<SelectSources />} />
          <Route path="/select-targets" element={<SelectTargets />} />
          <Route path="/configure-model" element={<ConfigureModel />} />
          <Route path="/create-model" element={<CreateModel />} />
        </Routes>
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
};

const Body = styled(_Body)`
  padding: 12px;
  flex-grow: 1;
  border-top: 1px solid ${Colors['border--muted']};
  border-bottom: 1px solid ${Colors['border--muted']};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BottomRow = styled(Flex)`
  padding: 8px;
`;

export default QuickMatchCreate;
