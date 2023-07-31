import { ClusterGroup } from 'clusters';
import { createContext } from 'react';

type LoginContextType = {
  appName: string;
  clientId: string;
  cluster: string;
  setCluster: (cluster: string) => void;
  clusters: ClusterGroup[];
  move: (project: string) => void;
  isProduction: boolean;
  hideLegacyAuth: boolean;
  defaultAzureDirectory?: string;
};

const LoginContext = createContext<LoginContextType>(undefined!);

export default LoginContext;
