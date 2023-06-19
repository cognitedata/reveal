import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { AppState } from './modules/App';
import { ToolbarState } from './modules/toolbar';
import { TreeViewState } from './modules/TreeView';

export type RootState = {
  app: AppState;
  treeView: TreeViewState;
  toolbar: ToolbarState;
};

export type ReduxThunk<
  ActionType extends Action<string>,
  ReturnType = void
> = ThunkAction<ReturnType, RootState, unknown, ActionType>;
