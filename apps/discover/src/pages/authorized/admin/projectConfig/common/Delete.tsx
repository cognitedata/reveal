import { Button } from '@cognite/cogs.js';

export const DeleteButton = ({
  handleChange,
}: {
  handleChange: () => void;
}) => {
  return (
    <Button
      icon="Trash"
      aria-label="Delete item"
      onClick={() => handleChange()}
      type="ghost"
    />
  );
};
