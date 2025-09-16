/*!
 * Copyright 2025 Cognite AS
 */
export function generateCanvasFingerprint(): string {
  const canvas = document.createElement('canvas');
  const canvasContext = canvas.getContext('2d');

  if (!canvasContext) {
    return 'canvas-context-error';
  }

  const placeholder = 'Fingerprint placeholder';

  // Contributes to uniqunes of fingerprint
  canvasContext.textBaseline = 'top';
  canvasContext.font = "14px 'Arial'";
  canvasContext.textBaseline = 'alphabetic';
  canvasContext.fillStyle = '#f60';
  canvasContext.fillRect(125, 1, 62, 20);
  canvasContext.fillStyle = '#069';
  canvasContext.fillText(placeholder, 2, 15);
  canvasContext.fillStyle = 'rgba(102, 204, 0, 0.7)';
  canvasContext.fillText(placeholder, 4, 17);

  return canvas.toDataURL();
}
