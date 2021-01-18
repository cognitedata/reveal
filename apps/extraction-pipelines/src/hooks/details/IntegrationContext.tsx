import React, { PropsWithChildren, useContext, useReducer } from 'react';
import { Integration } from '../../model/Integration';
import { User } from '../../model/User';

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
      type: 'UPDATE_CONTACT';
      payload: { index: number; contact: User };
    }
  | {
      type: 'REMOVE_CONTACT';
      payload: { index: number };
    }
  | {
      type: 'ADD_CONTACT';
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

type Updateable = 'contacts' | 'name' | 'description';

type Update = { index?: number; name: Updateable };

interface StateType {
  integration: Integration | null;
  updates: Set<string>;
}
type ContextActions =
  | IntegrationActions
  | ChangesActions
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

const contactReducer = (state: StateType, action: IntegrationActions) => {
  if (!state.integration) {
    throw new Error('contactReducer: No integration');
  }
  switch (action.type) {
    case 'UPDATE_CONTACT': {
      const aut = state.integration.contacts.map((contact, index) => {
        if (index === action.payload.index) {
          return action.payload.contact;
        }
        return contact;
      });
      return {
        ...state,
        integration: { ...state.integration, contacts: aut },
      };
    }
    case 'REMOVE_CONTACT': {
      const updatedContacts =
        state.integration.contacts.filter(
          (_, i) => i !== action.payload.index
        ) ?? [];
      return {
        ...state,
        integration: { ...state.integration, contacts: updatedContacts },
      } as StateType;
    }
    case 'ADD_CONTACT': {
      const existingContacts = state.integration.contacts ?? [];
      const updatedContacts = [...existingContacts, { ...action.payload }];
      return {
        ...state,
        integration: { ...state.integration, contacts: updatedContacts },
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
    case 'UPDATE_CONTACT':
    case 'REMOVE_CONTACT':
    case 'ADD_CONTACT': {
      return contactReducer(state, action);
    }
    case 'ADD_CHANGE':
    case 'REMOVE_CHANGE': {
      return changeReducer(state, action);
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
