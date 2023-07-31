import { ACTION_MESSAGE, NO_DEFINITION } from './constants';

export const NoCodeDefinition: React.FC = () => {
  return (
    <>
      <div>{NO_DEFINITION}</div>
      <div> {ACTION_MESSAGE}</div>
    </>
  );
};
