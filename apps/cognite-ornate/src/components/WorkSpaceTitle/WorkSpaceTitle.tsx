import { WorkSpaceTitleWrapper } from './elements';

type WorkSpaceTitleProps = {
  title: string;
};

const WorkSpaceTitle = ({ title = 'My Workspace' }: WorkSpaceTitleProps) => {
  return <WorkSpaceTitleWrapper>{title}</WorkSpaceTitleWrapper>;
};

export default WorkSpaceTitle;
