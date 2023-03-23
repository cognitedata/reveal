import { useTranslation } from 'common';
import Step from 'components/step';
import { Pipeline } from 'hooks/entity-matching-pipelines';

type ConfigureProps = {
  pipeline: Pipeline;
};

const Configure = ({}: ConfigureProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Step title={t('configure-pipeline-step-title', { step: 3 })}>
      configure
    </Step>
  );
};

export default Configure;
