import { Body as _Body, Button, Colors, Flex } from '@cognite/cogs.js';
import { Route, Routes } from 'react-router-dom';
import styled from 'styled-components';

import { useTranslation } from 'common';
import Page from 'components/page';
import { useQuickMatchContext } from 'context/QuickMatchContext';

import SelectSources from './select-sources';
import CreateModel from './create-model';
import ConfigureModel from './configure-model';
import SelectTargets from './select-targets';

const QuickMatchCreate = (): JSX.Element => {
  const { t } = useTranslation();
  const { hasNextStep, hasPrevStep, popStep, pushStep } =
    useQuickMatchContext();

  return (
    <Page
      footer={
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
      }
      subtitle={t('create')}
      title={t('quick-match')}
    >
      <Routes>
        <Route path="/select-sources" element={<SelectSources />} />
        <Route path="/select-targets" element={<SelectTargets />} />
        <Route path="/configure-model" element={<ConfigureModel />} />
        <Route
          path="/create-model/:modelId?/:jobId?"
          element={<CreateModel />}
        />
      </Routes>
    </Page>
  );
};

const BottomRow = styled(Flex)`
  border-top: 1px solid ${Colors['border--muted']};
  bottom: 0;
  position: absolute;
  padding: 8px;
  width: 100%;
`;

export default QuickMatchCreate;
