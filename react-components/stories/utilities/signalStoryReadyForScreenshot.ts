export function signalStoryReadyForScreenshot(): void {
  const finishedElement = document.createElement('div');
  finishedElement.id = 'story-done';
  document.body.appendChild(finishedElement);
}
