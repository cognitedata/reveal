/**
 * Download Charts
 */
import { Button, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { useScreenshot } from 'use-screenshot-hook';
import { downloadImage, toggleDownloadChartElements } from 'utils/charts';
import { Chart } from 'models/chart/types';
import { useCallback, useState } from 'react';
import { makeDefaultTranslations } from 'utils/translations';
import CSVModal, {
  defaultTranslations as CSVModalDefaultTranslations,
} from './CSVModal';

const defaultTranslations = makeDefaultTranslations(
  'PNG',
  'CSV (Time series only)',
  'Download'
);

interface SharingDropdownProps {
  chart: Chart;
  translations?: typeof defaultTranslations;
  csvModalTranslations?: typeof CSVModalDefaultTranslations;
}

const DownloadDropdown = ({
  chart,
  translations,
  csvModalTranslations,
}: SharingDropdownProps) => {
  const t = { ...defaultTranslations, ...translations };
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
            <Menu.Header>{t.Download}</Menu.Header>
            <Menu.Item
              onClick={() => {
                const height = toggleDownloadChartElements(true);
                takeScreenshot('png').then((image) => {
                  toggleDownloadChartElements(false, height);
                  downloadImage(image, chart.name);
                });
              }}
            >
              <Icon type="Image" /> {t.PNG}
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                setIsCSVModalVisible(true);
              }}
            >
              <Icon type="DataTable" />
              {t['CSV (Time series only)']}
            </Menu.Item>
          </Menu>
        }
      >
        <Button
          onClick={handleToggleMenu}
          icon="Download"
          type="ghost"
          aria-label={t.Download}
        />
      </Dropdown>
      <CSVModal
        isOpen={isCSVModalVisible}
        onClose={() => setIsCSVModalVisible(false)}
        translations={csvModalTranslations}
      />
    </>
  );
};

DownloadDropdown.translationKeys = Object.keys(defaultTranslations);
DownloadDropdown.csvModalTranslationKeys = Object.keys(
  CSVModalDefaultTranslations
);

export default DownloadDropdown;
