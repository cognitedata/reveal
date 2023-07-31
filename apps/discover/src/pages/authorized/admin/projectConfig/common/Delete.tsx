import { Button } from '@cognite/cogs.js';

export const DeleteButton = ({
  handleChange,
}: {
  handleChange: () => void;
}) => {
  return (
    <Button
      icon="Delete"
      aria-label="Delete item"
      onClick={handleChange}
      type="ghost"
    />
  );
};
