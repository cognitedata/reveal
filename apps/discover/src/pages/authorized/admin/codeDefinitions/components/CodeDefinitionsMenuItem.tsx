import { Menu, Body } from '@cognite/cogs.js';

interface Props {
  label: string;
  isActive: boolean;
  onItemClicked: () => void;
}
export const CodeDefinitionsMenuItem: React.FC<Props> = ({
  isActive,
  label,
  onItemClicked,
}) => {
  return (
    <Menu.Item
      style={
        isActive ? { backgroundColor: 'var(--cogs-midblue-7)' } : undefined
      }
      onClick={onItemClicked}
    >
      <Body strong level={2}>
        {label}
      </Body>
    </Menu.Item>
  );
};
