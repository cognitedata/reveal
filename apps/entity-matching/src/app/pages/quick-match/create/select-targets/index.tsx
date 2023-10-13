import { useTranslation } from '../../../../common';
import Step from '../../../../components/step';
import TargetSelectionTable from '../../../../components/target-selector-table';

const SelectTargets = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Step
      subtitle={t('select-target-step-subtitle')}
      title={t('select-target-step-title', { step: 2 })}
      dataTestId="target-select-step"
    >
      <TargetSelectionTable />
    </Step>
  );
};

export default SelectTargets;
