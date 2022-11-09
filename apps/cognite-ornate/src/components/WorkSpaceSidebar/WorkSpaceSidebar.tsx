import { PropsWithChildren, ReactNode } from 'react';

import {
  Sidebar,
  SidebarContentWrapper,
  SidebarFooter,
  SidebarHeader,
  SidebarInnerContentWrapper,
} from './elements';

type WorkSpaceSidebarProps = PropsWithChildren<{
  isOpen: boolean;
  header?: ReactNode;
  content?: ReactNode;
  footer?: ReactNode;
}>;

const WorkSpaceSidebar = ({
  isOpen,
  header,
  content,
  footer,
  children,
}: WorkSpaceSidebarProps) => {
  return (
    <Sidebar className={isOpen ? 'active' : ''}>
      <SidebarHeader>{header}</SidebarHeader>
      <SidebarContentWrapper>
        <SidebarInnerContentWrapper>{content}</SidebarInnerContentWrapper>
        <SidebarFooter>{footer}</SidebarFooter>
        {children}
      </SidebarContentWrapper>
    </Sidebar>
  );
};

export default WorkSpaceSidebar;
