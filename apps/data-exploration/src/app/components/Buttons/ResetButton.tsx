import { Button } from '@cognite/cogs.js';

interface Props {
  onClick?: () => void;
}
export const ResetButton: React.FC<Props> = ({ onClick }) => {
  return <Button onClick={onClick && onClick}>Reset</Button>;
};
