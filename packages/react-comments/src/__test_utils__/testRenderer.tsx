import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, RenderResult, RenderOptions } from '@testing-library/react';

interface Props {
  component: React.FC<any>;
  props?: any;
}
const WrappedWithProviders: React.FC<Props> = ({ component, props = {} }) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {React.createElement(component, props)}
    </QueryClientProvider>
  );
};

export const testRenderer = <Type extends unknown>(
  component: React.FC<Type>,
  props?: Type,
  options?: RenderOptions
): RenderResult => {
  return render(
    <WrappedWithProviders component={component} props={props} />,
    options
  );
};
