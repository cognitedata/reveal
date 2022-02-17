import { LocationState } from 'history';
import { AppState } from 'store/modules/App';
import { TreeViewState } from 'store/modules/TreeView';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { ToolbarState } from 'store/modules/toolbar';

export type RootState = {
  router: LocationState;
  app: AppState;
  treeView: TreeViewState;
  toolbar: ToolbarState;
};

export type ReduxThunk<
  ActionType extends Action<string>,
  ReturnType = void
> = ThunkAction<ReturnType, RootState, unknown, ActionType>;
