import { Flex, Label } from '@cognite/cogs.js';
import { useTranslation } from 'common/i18n';

type AppliedFilterItem = {
  key: string;
  label: string;
  onClick?: () => void;
};

type AppliedFiltersProps = {
  items?: AppliedFilterItem[];
  onClear?: () => void;
};

const AppliedFilters = ({
  items,
  onClear,
}: AppliedFiltersProps): JSX.Element => {
  const { t } = useTranslation();

  if (!items?.length) {
    return <></>;
  }

  return (
    <Flex gap={8}>
      {items.map(({ key, label, onClick }) => (
        <Label
          size="medium"
          icon="Close"
          iconPlacement="right"
          key={key}
          onClick={onClick}
        >
          {label}
        </Label>
      ))}
      {!!onClear && (
        <Label size="medium" variant="unknown" onClick={onClear}>
          {t('clear-all')}
        </Label>
      )}
    </Flex>
  );
};

export default AppliedFilters;
