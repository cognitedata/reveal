/**
 * Download Charts
 */
import { Button, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { useScreenshot } from 'use-screenshot-hook';
import { downloadImage, toggleDownloadChartElements } from 'utils/charts';
import { Chart } from 'models/chart/types';
import { useCallback, useState } from 'react';
import CSVModal from './CSVModal';

interface SharingDropdownProps {
  chart: Chart;
}

const DownloadDropdown = ({ chart }: SharingDropdownProps) => {
  const { takeScreenshot } = useScreenshot();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isCSVModalVisible, setIsCSVModalVisible] = useState(false);

  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen((visible) => !visible);
  }, []);

  return (
    <>
      <Dropdown
        visible={isMenuOpen}
        content={
          <Menu onClick={handleToggleMenu}>
            <Menu.Header>Download</Menu.Header>
            <Menu.Item
              onClick={() => {
                const height = toggleDownloadChartElements(true);
                takeScreenshot('png').then((image) => {
                  toggleDownloadChartElements(false, height);
                  downloadImage(image, chart.name);
                });
              }}
            >
              <Icon type="Image" /> PNG
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                setIsCSVModalVisible(true);
              }}
            >
              <Icon type="DataTable" />
              CSV (Time series only)
            </Menu.Item>
          </Menu>
        }
      >
        <Button
          onClick={handleToggleMenu}
          icon="Download"
          type="ghost"
          aria-label="Download"
        />
      </Dropdown>
      <CSVModal
        isOpen={isCSVModalVisible}
        onClose={() => setIsCSVModalVisible(false)}
      />
    </>
  );
};

export default DownloadDropdown;
