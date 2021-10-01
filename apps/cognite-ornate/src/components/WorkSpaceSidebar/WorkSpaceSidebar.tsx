import {
  Sidebar,
  SidebarContentWrapper,
  SidebarFooter,
  SidebarHeader,
  SidebarInnerContentWrapper,
} from './elements';

type WorkSpaceSidebarProps = {
  isOpen: boolean;
  header?: React.ReactChild;
  content?: React.ReactChild | React.ReactChild[];
  footer?: React.ReactChild;
  children?: React.ReactChild | React.ReactChild[];
};

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
