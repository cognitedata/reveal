import { Button } from '@cognite/cogs.js';
import { RESET } from './constants';

interface Props {
  onClick?: () => void;
}
export const ResetButton: React.FC<Props> = (props) => {
  return <Button {...props}>{RESET}</Button>;
};
