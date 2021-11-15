import { ActionStatus } from '@platypus-app/types';
import { Solution } from '@platypus/platypus-core';

export interface SolutionsStateVM {
  solutions: Solution[];
  solutionsStatus: ActionStatus;
  error: string;
}
