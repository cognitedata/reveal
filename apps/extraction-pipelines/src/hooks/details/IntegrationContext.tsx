import React, { PropsWithChildren, useContext, useReducer } from 'react';
import { Integration } from '../../model/Integration';
import { User } from '../../model/User';

type OwnerActions = {
  type: 'UPDATE_OWNER';
  payload: { owner: User };
};
type NameActions = {
  type: 'UPDATE_NAME';
  payload: Pick<Integration, 'name'>;
};
type DescriptionActions = {
  type: 'UPDATE_DESCRIPTION';
  payload: Pick<Integration, 'description'>;
};

type IntegrationActions =
  | {
      type: 'UPDATE_AUTHOR';
      payload: { index: number; author: User };
    }
  | {
      type: 'REMOVE_AUTHOR';
      payload: { index: number };
    }
  | {
      type: 'ADD_AUTHOR';
      payload: User;
    };

type ChangesActions =
  | {
      type: 'ADD_CHANGE';
      payload: Update;
    }
  | {
      type: 'REMOVE_CHANGE';
      payload: Update;
    };

type Updateable =
  | 'authors.name'
  | 'authors.email'
  | 'owner'
  | 'name'
  | 'description';

type Update = { index?: number; name: Updateable };

interface StateType {
  integration: Integration | null;
  updates: Set<string>;
}
type ContextActions =
  | IntegrationActions
  | ChangesActions
  | OwnerActions
  | NameActions
  | DescriptionActions;

interface IntegrationContextType {
  state: StateType;
  dispatch: React.Dispatch<ContextActions>;
}

const initialState = {
  integration: null,
  updates: new Set<string>(),
};
const IntegrationContext = React.createContext<IntegrationContextType>({
  state: initialState,
  dispatch: () => null,
});

interface Props {
  initIntegration: Integration;
}

function changeReducer(state: StateType, action: ChangesActions): StateType {
  switch (action.type) {
    case 'ADD_CHANGE': {
      state.updates.add(`${action.payload.name}-${action.payload.index ?? 0}`);
      return {
        ...state,
        updates: state.updates,
      };
    }
    case 'REMOVE_CHANGE': {
      state.updates.delete(
        `${action.payload.name}-${action.payload.index ?? 0}`
      );
      return { ...state, updates: state.updates };
    }
    default: {
      return state;
    }
  }
}
function ownerReducer(state: StateType, action: OwnerActions): StateType {
  switch (action.type) {
    case 'UPDATE_OWNER': {
      if (!state.integration) {
        throw new Error('ownerReducer: No integration');
      }
      return {
        ...state,
        integration: { ...state.integration, owner: action.payload.owner },
      };
    }
    default: {
      return state;
    }
  }
}

function nameReducer(state: StateType, action: NameActions): StateType {
  switch (action.type) {
    case 'UPDATE_NAME': {
      if (!state.integration) {
        throw new Error('nameReducer: No integration');
      }
      return {
        ...state,
        integration: { ...state.integration, name: action.payload.name },
      };
    }
    default: {
      return state;
    }
  }
}
function descriptionReducer(
  state: StateType,
  action: DescriptionActions
): StateType {
  switch (action.type) {
    case 'UPDATE_DESCRIPTION': {
      if (!state.integration) {
        throw new Error('descriptionReducer: No integration');
      }
      return {
        ...state,
        integration: {
          ...state.integration,
          description: action.payload.description,
        },
      };
    }
    default: {
      return state;
    }
  }
}

const authorReducer = (state: StateType, action: IntegrationActions) => {
  if (!state.integration) {
    throw new Error('authorReducer: No integration');
  }
  switch (action.type) {
    case 'UPDATE_AUTHOR': {
      const aut = state.integration.authors.map((author, index) => {
        if (index === action.payload.index) {
          return action.payload.author;
        }
        return author;
      });
      return {
        ...state,
        integration: { ...state.integration, authors: aut },
      };
    }
    case 'REMOVE_AUTHOR': {
      const updatedAuthors =
        state.integration.authors.filter(
          (_, i) => i !== action.payload.index
        ) ?? [];
      return {
        ...state,
        integration: { ...state.integration, authors: updatedAuthors },
      } as StateType;
    }
    case 'ADD_AUTHOR': {
      const existingAuthors = state.integration.authors ?? [];
      const updatedAuthors = [...existingAuthors, { ...action.payload }];
      return {
        ...state,
        integration: { ...state.integration, authors: updatedAuthors },
      };
    }
    default: {
      return state;
    }
  }
};

const integrationReducer = (
  state: StateType,
  action: ContextActions
): StateType => {
  switch (action.type) {
    case 'UPDATE_AUTHOR':
    case 'REMOVE_AUTHOR':
    case 'ADD_AUTHOR': {
      return authorReducer(state, action);
    }
    case 'ADD_CHANGE':
    case 'REMOVE_CHANGE': {
      return changeReducer(state, action);
    }
    case 'UPDATE_OWNER': {
      return ownerReducer(state, action);
    }
    case 'UPDATE_NAME': {
      return nameReducer(state, action);
    }
    case 'UPDATE_DESCRIPTION': {
      return descriptionReducer(state, action);
    }

    default:
      return state;
  }
};

export const IntegrationProvider = ({
  children,
  initIntegration,
}: PropsWithChildren<Props>) => {
  const [state, dispatch] = useReducer(integrationReducer, {
    integration: initIntegration,
    updates: new Set<string>(),
  });

  return (
    <IntegrationContext.Provider value={{ state, dispatch }}>
      {children}
    </IntegrationContext.Provider>
  );
};

export const useIntegration = () => {
  const context = useContext(IntegrationContext);
  if (context === undefined) {
    throw new Error(
      'You can not use integration context with out IntegrationProvider'
    );
  }
  return context;
};
