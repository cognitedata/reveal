import { ChainSelectionAction } from './ChainSelectionAction';
import { TextAction } from './TextAction';

export const actionRenderers = {
  None: () => <TextAction disabled />,
  Message: TextAction,
  wait: TextAction,
  ChainSelection: ChainSelectionAction,
};
