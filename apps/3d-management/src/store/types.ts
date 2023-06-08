import { AppState } from '@3d-management/store/modules/App';
import { TreeViewState } from '@3d-management/store/modules/TreeView';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { ToolbarState } from '@3d-management/store/modules/toolbar';

export type RootState = {
  app: AppState;
  treeView: TreeViewState;
  toolbar: ToolbarState;
};

export type ReduxThunk<
  ActionType extends Action<string>,
  ReturnType = void
> = ThunkAction<ReturnType, RootState, unknown, ActionType>;
