import { useTranslation } from 'common';

import ModelConfiguration from 'components/model-configation';
import Step from 'components/step';

const ConfigureModel = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Step isCentered title={t('configure-model-step-title', { step: 3 })}>
      <ModelConfiguration />
    </Step>
  );
};

export default ConfigureModel;
