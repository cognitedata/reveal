import { useTranslation } from '@entity-matching-app/common';
import Step from '@entity-matching-app/components/step';
import TargetSelectionTable from '@entity-matching-app/components/target-selector-table';

const SelectTargets = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Step
      subtitle={t('select-target-step-subtitle')}
      title={t('select-target-step-title', { step: 2 })}
    >
      <TargetSelectionTable />
    </Step>
  );
};

export default SelectTargets;
