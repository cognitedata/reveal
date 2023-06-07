/**
 * Download Charts
 */
import { ComponentProps, useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { makeDefaultTranslations } from 'utils/translations';
import Dropdown from 'components/Dropdown/Dropdown';

const defaultTranslations = makeDefaultTranslations(
  'PNG',
  'CSV',
  'Download',
  'Calculations'
);

interface SharingDropdownProps {
  translations?: typeof defaultTranslations;
  onDownloadCalculations?: () => void;
  onDownloadImage: () => void;
  onCsvDownload: () => void;
  label?: string | undefined;
}

const DownloadDropdown = ({
  translations,
  onDownloadCalculations,
  onDownloadImage,
  onCsvDownload,
  label,
}: SharingDropdownProps) => {
  const t = { ...defaultTranslations, ...translations };
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const options: ComponentProps<typeof Dropdown>['options'] = [
    {
      label: t.PNG,
      icon: 'Image',
      onClick: onDownloadImage,
    },
    {
      label: t.CSV,
      icon: 'DataTable',
      onClick: onCsvDownload,
    },
  ];
  if (onDownloadCalculations) {
    options.push({
      label: t.Calculations,
      icon: 'Function',
      onClick: onDownloadCalculations,
    });
  }
  return (
    <Dropdown
      style={{ width: '14rem' }}
      title={t.Download}
      open={isMenuOpen}
      onClose={() => setIsMenuOpen(false)}
      options={options}
    >
      <Button
        icon="Download"
        type="ghost"
        aria-label="Open dropdown"
        onClick={() => setIsMenuOpen((prevState) => !prevState)}
      >
        {label}
      </Button>
    </Dropdown>
  );
};

DownloadDropdown.translationKeys = Object.keys(defaultTranslations);

export default DownloadDropdown;
