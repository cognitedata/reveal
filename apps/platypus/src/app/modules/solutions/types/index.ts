import { ActionStatus } from '@platypus-app/types';
import { DataModel } from '@platypus/platypus-core';

export interface SolutionsStateVM {
  solutions: DataModel[];
  solutionsStatus: ActionStatus;
  error: string;
}
