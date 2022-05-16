import React from 'react';

import { ConditionalWrapperWithProps } from '@cognite/react-container';

import { Topbar } from 'pages/authorized/menubar';

import { CollapsingContainer } from './CollapsingContainer';
import { PageWrapper, TopbarContainer, PageContent } from './elements';

interface WrapperProps {
  hideTopbar?: boolean;
}
const WrappedTopbar: React.FC<WrapperProps> = ({ hideTopbar }) =>
  !hideTopbar ? (
    <TopbarContainer>
      <Topbar />
    </TopbarContainer>
  ) : null;

export interface Props {
  /**
   * When set to true, the page will not render the Topbar.
   * (CollapseToolbar doesn't make a difference if this is set to true)
   */
  hideTopbar?: boolean;

  /**
   * True if you want the page (body) to be scrollable. If this is false, the
   * max-height will be set to 100vh so you can make your own scrolling elements
   * within.
   */
  scrollPage: boolean;
  /**
   * When scrolling up a bit, the topbar pops down into view.
   */
  collapseTopbar?: boolean;
}

export const Page: React.FC<React.PropsWithChildren<Props>> = React.memo(
  ({ collapseTopbar, scrollPage, hideTopbar, children }) => {
    return (
      <PageWrapper id="page-wrapper" scrollPage={scrollPage}>
        <ConditionalWrapperWithProps
          wrap={CollapsingContainer}
          condition={scrollPage && collapseTopbar}
        >
          <WrappedTopbar hideTopbar={hideTopbar} />
        </ConditionalWrapperWithProps>

        <PageContent scrollPage={scrollPage}>{children}</PageContent>
      </PageWrapper>
    );
  }
);
