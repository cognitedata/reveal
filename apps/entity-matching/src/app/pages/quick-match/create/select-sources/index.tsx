import { useTranslation } from '@entity-matching-app/common';
import SourceSelectionTable from '@entity-matching-app/components/source-selector-table';
import Step from '@entity-matching-app/components/step';

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
