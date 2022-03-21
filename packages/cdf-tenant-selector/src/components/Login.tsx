import React, { useEffect, useContext } from 'react';
import {
  MemoryRouter as Router,
  Switch,
  Route,
  useHistory,
} from 'react-router-dom';
import { Loader } from '@cognite/cogs.js';
import { getFlow } from '@cognite/auth-utils';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ClusterGroup } from '../clusters';
import LoginContext from '../context';
import useSavedTenants from '../hooks/useSavedTenants';
import useLoginWithAzure from '../hooks/useLoginWithAzure';
import {
  getCommittedPage,
  commitLoginPage,
  hasTokenOrCode,
  isLoginError,
} from '../utilities';

import TenantSelectorBackground from './TenantSelectorBackground';
import StartPage from './StartPage';
import SignInWithMicrosoft from './SignInWithMicrosoft';
import SignInWithProjectName from './SignInWithProjectName';
import GuestUserAccount from './GuestUserAccount';
import Connected from './Connected';

type LoginProps = {
  appName: string;
  clientId: string;
  clusters: ClusterGroup[];
  cluster: string;
  setCluster: (cluster: string) => void;
  move: (project: string) => void;
  isProduction: boolean;
};

const cache = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: 1,
    },
  },
});

const LoginOuter = ({
  clientId,
  cluster,
  setCluster,
  clusters,
  appName,
  move,
  isProduction,
}: LoginProps) => {
  return (
    <LoginContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        clientId,
        cluster,
        setCluster,
        clusters,
        move,
        isProduction,
        appName,
      }}
    >
      <QueryClientProvider client={cache}>
        <TenantSelectorBackground>
          <title>{appName}</title>
          <Router>
            <Login />
          </Router>
        </TenantSelectorBackground>
      </QueryClientProvider>
    </LoginContext.Provider>
  );
};

const Login = () => {
  const { cluster, clientId } = useContext(LoginContext);
  const [, setSavedTenants] = useSavedTenants();
  const history = useHistory();
  const {
    login,
    logout,
    isLoading: isLoggingIn,
    isSuccess,
    isError,
  } = useLoginWithAzure();
  const hasUrlToken = !!hasTokenOrCode(clientId);
  const isLoading = hasUrlToken || isLoggingIn;

  useEffect(() => {
    if (!hasUrlToken) {
      history.push(getCommittedPage());
    }
    // Always clear the committed page because error is only shown
    // once after login
    commitLoginPage(null);
  }, [history, hasUrlToken]);

  useEffect(() => {
    const saveTenantInLS = () => {
      const { flow, options } = getFlow();

      if (flow === 'AZURE_AD' && options?.directory) {
        const tenant = options?.directory;
        setSavedTenants((prev: any) =>
          prev.includes(tenant) ? prev : [...prev, tenant]
        );
      }
    };

    if (isLoginError()) {
      // It only gets here when the tenant is valid
      // but the cluster is wrong
      // In this case the tenant ID is still saved in LS
      saveTenantInLS();
      return;
    }

    if (hasUrlToken) {
      login(
        {
          clientId,
          cluster,
          directory: getFlow().options?.directory,
          prompt: 'none',
        },
        { onSettled: saveTenantInLS }
      );
    }
  }, [cluster, login, setSavedTenants, hasUrlToken, clientId]);

  if (isSuccess === true) return <Connected logout={logout} />;

  return (
    <Switch>
      <Route exact path="/">
        {isLoading ? <Loader /> : <StartPage />}
      </Route>
      <Route exact path="/signInWithMicrosoft">
        <SignInWithMicrosoft login={login} isLoading={isLoading} />
      </Route>
      <Route exact path="/signInWithAsGuest">
        <GuestUserAccount
          login={login}
          isLoading={isLoading}
          isError={isError}
        />
      </Route>
      <Route exact path="/signInWithProjectName">
        <SignInWithProjectName />
      </Route>
    </Switch>
  );
};

export default LoginOuter;
