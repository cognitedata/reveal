/**
 * Translated wrapper for Editable Text
 */
import { useTranslations } from 'hooks/translations';
import EditableText, {
  defaultTranslations,
  EditableTextProps,
} from './EditableText';

const TranslatedEditableText = (props: EditableTextProps) => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(EditableText.translationKeys, 'EditableText').t,
  };

  const params = {
    ...props,
    translations: t,
  };

  return <EditableText {...params} />;
};

export default TranslatedEditableText;
