import { SubAppProvider } from '@cognite/cdf-utilities';

export interface FusionSubAppContainerProps {
  children: React.ReactNode;
}
export const SubAppContainer = ({ children }: FusionSubAppContainerProps) => {
  return (
    <SubAppProvider
      user={{ cluster: 'https://localhost:300', project: 'mock', id: '' }}
    >
      {children}
    </SubAppProvider>
  );
};
