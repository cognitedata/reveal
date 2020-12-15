import { LocationState } from 'history';
import { AppState } from 'src/store/modules/App';
import { TreeViewState } from 'src/store/modules/TreeView';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { ToolbarState } from 'src/store/modules/toolbar';

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
