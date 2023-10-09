import { SENSITIVE_ANNOTATION_LABELS } from '../constants/annotationSettingsConstants';

export const isSensitiveAnnotationLabel = (label?: string) => {
  return label
    ? SENSITIVE_ANNOTATION_LABELS.includes(label.trim().toLowerCase())
    : false;
};
