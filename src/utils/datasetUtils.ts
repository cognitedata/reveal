import { Colors, LabelVariants } from '@cognite/cogs.js';
import { TranslationKeys } from 'common/i18n';

export const getGovernedStatus = (isGoverned: Boolean | undefined) => {
  let statusColor: string;
  let statusVariant: LabelVariants;
  let statusI18nKey: TranslationKeys;

  if (isGoverned) {
    statusColor = Colors['border--status-success--strong'];
    statusVariant = 'success';
    statusI18nKey = 'governed';
  } else if (isGoverned === false) {
    statusColor = Colors['border--status-critical--strong'];
    statusVariant = 'danger';
    statusI18nKey = 'ungoverned';
  } else {
    statusColor = Colors['border--status-warning--strong'];
    statusVariant = 'warning';
    statusI18nKey = 'not-defined';
  }

  return {
    statusColor,
    statusVariant,
    statusI18nKey,
  };
};
