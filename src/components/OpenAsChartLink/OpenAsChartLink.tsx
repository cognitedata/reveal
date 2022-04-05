import { ElementType, ReactNode } from 'react';
import { openAsChartURL } from './openAsChartUrl';

type FunctionProps = Parameters<typeof openAsChartURL>[0];
type Props = FunctionProps & {
  children?: ReactNode;
  component?: ElementType;
};

const OpenAsChartLink = ({
  children = 'Open as Chart',
  component: Component = 'a',
  ...props
}: Props) => (
  <Component href={openAsChartURL(props)} target="_blank" rel="noreferrer">
    {children}
  </Component>
);

export default OpenAsChartLink;
