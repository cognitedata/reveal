import { Button } from '@cognite/cogs.js';

import { RESET } from './constants';

interface Props {
  onClick?: () => void;
}
export const ResetButton: React.FC<Props> = ({ onClick }) => {
  return <Button onClick={onClick && onClick}>{RESET}</Button>;
};
