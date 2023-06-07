import ChartsDropdown from '@charts-app/components/Dropdown/Dropdown';
import {
  makeDefaultTranslations,
  translationKeys,
} from '@charts-app/utils/translations';

const defaultTranslations = makeDefaultTranslations('Duplicate', 'Delete');

type Props = {
  name: string;
  readOnly?: boolean;
  onDuplicateClick: () => void;
  onDeleteClick: () => void;
  translations?: typeof defaultTranslations;
};

const ChartListDropdown = ({
  name,
  readOnly = false,
  onDuplicateClick,
  onDeleteClick,
  translations,
}: Props) => {
  const t = { ...defaultTranslations, ...translations };

  const readOnlyMenuItems = [
    {
      label: t.Duplicate,
      icon: 'Duplicate' as const,
      onClick: onDuplicateClick,
    },
  ];

  const ownerMenuItems = [
    {
      label: t.Delete,
      icon: 'Delete' as const,
      onClick: onDeleteClick,
    },
  ];

  return (
    <ChartsDropdown.Uncontrolled
      title={name}
      options={
        readOnly ? readOnlyMenuItems : [...ownerMenuItems, ...readOnlyMenuItems]
      }
      btnProps={{ icon: 'EllipsisVertical' }}
    />
  );
};

ChartListDropdown.displayName = 'ChartListDropdown';
ChartListDropdown.defaultTranslations = defaultTranslations;
ChartListDropdown.translationKeys = translationKeys(defaultTranslations);
ChartListDropdown.translationNamespace = 'ChartListDropdown';

export default ChartListDropdown;
