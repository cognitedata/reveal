import { atom } from 'recoil';
import { WorkflowState } from '../types';

export const workflowsAtom = atom<{
  [key: string]: WorkflowState;
}>({
  key: 'workflowsAtom',
  default: {},
});
