import React, { PropsWithChildren } from 'react';

import { Flex, Title } from '@cognite/cogs.js';

import { useIsScreenWideEnough } from '../../hooks/useIsScreenWideEnough';

const TabContentContainer = ({ children }: PropsWithChildren) => (
  <Flex direction="column" gap={24}>
    {children}
  </Flex>
);

const TabContentTitle = ({
  shouldHideOnSmallerScreens = true,
  children,
}: { shouldHideOnSmallerScreens?: boolean } & PropsWithChildren) => {
  const isScreenWideEnough = useIsScreenWideEnough();
  return (
    <>
      {isScreenWideEnough && shouldHideOnSmallerScreens && (
        <Flex direction="column" gap={4}>
          <Title level={4}>{children}</Title>
        </Flex>
      )}
    </>
  );
};

const TabContentBody = ({ children }: PropsWithChildren) => (
  <Flex direction="column" gap={24}>
    {children}
  </Flex>
);

export const TabContent = () => <></>;
TabContent.Container = TabContentContainer;
TabContent.Title = TabContentTitle;
TabContent.Body = TabContentBody;
