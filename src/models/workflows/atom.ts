import { atom } from 'recoil';
import { WorkflowResult } from './types';

export const workflowsAtom = atom<{ [key: string]: WorkflowResult }>({
  key: 'workflowsAtom',
  default: {},
});
