import { Route, Routes } from 'react-router-dom';

import { Body as _Body, Button, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../../common';
import Page from '../../../components/page';
import { useQuickMatchContext } from '../../../context/QuickMatchContext';

import ConfigureModel from './configure-model';
import CreateModel from './create-model';
import SelectSources from './select-sources';
import SelectTargets from './select-targets';
const QuickMatchCreate = (): JSX.Element => {
  const { t } = useTranslation();
  const { hasNextStep, hasPrevStep, popStep, pushStep } =
    useQuickMatchContext();

  // eslint-disable-next-line
  const configureModel = window.location.href.indexOf('configure-model') !== -1;

  return (
    <Page
      extraContent={
        <Flex gap={8}>
          {hasPrevStep() && (
            <Button disabled={!hasPrevStep()} onClick={() => popStep()}>
              {t('navigate-back')}
            </Button>
          )}
          <Button
            disabled={!hasNextStep()}
            onClick={() => {
              pushStep();
            }}
            type="primary"
          >
            {configureModel ? t('run-model') : t('navigate-next')}
          </Button>
        </Flex>
      }
      subtitle={t('create')}
      title={t('quick-match')}
    >
      <Routes>
        <Route path="/select-sources" element={<SelectSources />} />
        <Route path="/select-targets" element={<SelectTargets />} />
        <Route path="/configure-model" element={<ConfigureModel />} />
        <Route
          path="/create-model/:modelId?/:predictJobId?/:rulesJobId?/:applyRulesJobId?"
          element={<CreateModel />}
        />
      </Routes>
    </Page>
  );
};

export default QuickMatchCreate;
