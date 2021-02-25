import React from 'react';
import { useLocation } from 'react-router-dom';
import { match as matchRoute } from 'path-to-regexp';
import styled from 'styled-components';
import 'antd/dist/antd.css';
import { Flex as BaseFlex, Steps, StepsType } from 'components/Common';

const Flex = styled(BaseFlex)`
  margin-bottom: 40px;
  padding-bottom: 30px;
  height: 20px;
`;

type RouteFunction = (keys: { [key: string]: string }) => React.ReactNode[];
export type BreadcrumbRouteMap = {
  [key: string]: RouteFunction | React.ReactNode[];
};
type BreadcrumbsProps = { routesMap: BreadcrumbRouteMap };
export const Breadcrumbs = (props: BreadcrumbsProps) => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const mainPath = pathSnippets[1]; // first is always tenant
  // @ts-ignore // TODO fix this later
  const steps: StepsType[] = Object.entries(props.routesMap)
    .filter((route) => route[0].includes(`/${mainPath}`))
    .map((route) => {
      const matches = pathSnippets
        .map((_, index: number) => {
          const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
          return matchRoute<{ [key: string]: string }>(route[0], {
            decode: decodeURIComponent,
          })(url);
        })
        .filter((partialUrl) => partialUrl);
      const path = matches[0] ? matches[0].path : undefined;
      const isFunction = typeof route[1] === 'function';
      const breadcrumbs = isFunction
        ? // @ts-ignore
          (route[1] as RouteFunction)(matches[0].params)
        : route[1];
      return {
        path,
        breadcrumbs,
      };
    });
  const currentStep = steps.findIndex(
    (step) => step.path === location.pathname
  );

  if (!steps.length) {
    return <span />;
  }
  return (
    <Flex row>
      <Steps steps={steps} current={currentStep} className="breadcrumb-steps" />
    </Flex>
  );
};
