/**
 * Download Charts
 */
import { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { useScreenshot } from 'use-screenshot-hook';
import { downloadImage, toggleDownloadChartElements } from 'utils/charts';
import { Chart } from 'models/chart/types';
import { makeDefaultTranslations } from 'utils/translations';
import Dropdown from 'components/Dropdown/Dropdown';
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
  const [isCSVModalVisible, setIsCSVModalVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Dropdown
        style={{ width: '14rem' }}
        title={t.Download}
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        options={[
          {
            label: t.PNG,
            icon: 'Image',
            onClick: () => {
              const height = toggleDownloadChartElements(true);
              takeScreenshot('png').then((image) => {
                toggleDownloadChartElements(false, height);
                downloadImage(image, chart.name);
              });
            },
          },
          {
            label: t['CSV (Time series only)'],
            icon: 'DataTable',
            onClick: () => setIsCSVModalVisible(true),
          },
        ]}
      >
        <Button
          icon="Download"
          type="ghost"
          aria-label="Open dropdown"
          onClick={() => setIsMenuOpen((prevState) => !prevState)}
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
