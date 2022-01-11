import { Menu } from '@cognite/cogs.js';
import { AppearanceDropdown } from 'components/AppearanceDropdown';

type Props = {
  onUpdate: (diff: any) => void;
};
export default function ToolsMenu({ onUpdate }: Props) {
  return (
    <Menu.Submenu
      content={
        <Menu>
          <Menu.Submenu content={<AppearanceDropdown onUpdate={onUpdate} />}>
            <span>Appearance</span>
          </Menu.Submenu>
          <Menu.Submenu
            content={
              <Menu>
                <Menu.Item>Gaps</Menu.Item>
                <Menu.Item>Freshness</Menu.Item>
                <Menu.Item>Drift Detector</Menu.Item>
              </Menu>
            }
          >
            <span>Data Quality</span>
          </Menu.Submenu>
          <Menu.Item>Min / Max</Menu.Item>
          <Menu.Item>Limit</Menu.Item>
        </Menu>
      }
    >
      <span>Tools</span>
    </Menu.Submenu>
  );
}
