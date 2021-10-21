export const toggleDownloadChartElements = (hide: boolean, height?: number) => {
  const elementsToHide = document.getElementsByClassName('downloadChartHide');
  const chartViewEl = document.getElementById('chart-view');
  const splitPane = (
    document.getElementsByClassName('SplitPane')[0] as HTMLElement
  ).style;
  if (hide) {
    const pane2Height = +(
      document.getElementsByClassName('Pane2')[0] as HTMLElement
    ).style.height.replace('px', '');
    Array.prototype.forEach.call(elementsToHide, (el) => {
      el.style.display = 'none';
    });
    if (chartViewEl) {
      chartViewEl.style.overflow = 'auto';
      chartViewEl.style.height = 'auto';
    }
    splitPane.overflow = 'auto';
    splitPane.display = 'block';
    splitPane.position = 'relative';
    (
      document.getElementsByClassName('Pane1')[0] as HTMLElement
    ).style.height = `${window.innerHeight - pane2Height - 130}px`;
    (document.getElementsByClassName('Pane2')[0] as HTMLElement).style.height =
      'auto';
    (
      document.getElementsByClassName('Resizer')[0] as HTMLElement
    ).style.display = 'none';
    (
      document.getElementsByClassName('PageLayout')[0] as HTMLElement
    ).style.height = 'auto';
    return pane2Height;
  }
  Array.prototype.forEach.call(elementsToHide, (el: HTMLElement) => {
    el.style.display =
      el.nodeName === 'TH' || el.nodeName === 'TD' ? 'table-cell' : 'flex';
  });
  if (chartViewEl) {
    chartViewEl.style.overflow = 'hidden';
    chartViewEl.style.height = '100%';
  }
  splitPane.overflow = 'hidden';
  splitPane.display = 'flex';
  splitPane.position = 'absolute';
  (document.getElementsByClassName('Pane1')[0] as HTMLElement).style.height =
    'auto';
  (
    document.getElementsByClassName('Pane2')[0] as HTMLElement
  ).style.height = `${height}px`;
  (document.getElementsByClassName('Resizer')[0] as HTMLElement).style.display =
    'block';
  (
    document.getElementsByClassName('PageLayout')[0] as HTMLElement
  ).style.height = '100vh';
  return 0;
};

export const downloadImage = (
  image: string | undefined,
  chartName: string | undefined
) => {
  if (!image) {
    return;
  }
  const a = document.createElement('a');
  a.href = image;
  a.download = `${chartName}.png`;
  a.click();
};
