import { Operation } from '@cognite/calculation-backend';
import ActionBar, { ActionBarProps } from './ActionBar';

type NodeWithActionBarProps = ActionBarProps & {
  isActionBarVisible: boolean;
  toolFunction?: Operation;
  children: React.ReactNode;
};

const NodeWithActionBar = ({
  isActionBarVisible,
  children,
  ...props
}: NodeWithActionBarProps) => {
  return (
    <>
      {isActionBarVisible && <ActionBar {...props} />}
      {children}
    </>
  );
};

export default NodeWithActionBar;
