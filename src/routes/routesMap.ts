import { WorkflowStep } from 'modules/workflows';
import { paths } from './paths';

export type PathData = {
  path: (workflowId?: string | number, fileId?: string | number) => string;
  staticPath: string;
  title: string;
  workflowStepName?: WorkflowStep;
  skippable?: boolean;
  showOnStepList?: boolean;
  comboBox?: string;
  substeps?: PathData[];
};

export const routesMap = () => {
  const map: PathData[] = Object.values(paths);
  return map;
};

export const stepsMap = () => {
  const routes = routesMap();
  const steps = routes
    .filter((path: PathData) => path.showOnStepList)
    .reduce((acc: PathData[], curr: PathData) => {
      if (curr.comboBox) {
        const existingComboBoxIndex = acc.findIndex(
          (step) => step.title === curr.comboBox
        );
        if (existingComboBoxIndex !== -1) {
          // eslint-disable-next-line no-param-reassign
          acc[existingComboBoxIndex].substeps = [
            ...(acc[existingComboBoxIndex].substeps ?? []),
            curr,
          ];
        } else
          acc.push({
            ...curr,
            substeps: [curr],
            title: curr.comboBox,
          });
      } else acc.push(curr);
      return acc;
    }, [] as PathData[]);
  return steps as PathData[];
};
