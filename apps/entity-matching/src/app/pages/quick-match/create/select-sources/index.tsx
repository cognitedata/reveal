import { useTranslation } from '../../../../common';
import SourceSelectionTable from '../../../../components/source-selector-table';
import Step from '../../../../components/step';

const SelectSources = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Step
      subtitle={t('select-source-step-subtitle')}
      title={t('select-source-step-title', { step: 1 })}
    >
      <SourceSelectionTable />
    </Step>
  );
};

export default SelectSources;
