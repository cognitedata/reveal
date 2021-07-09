// manipulate DOM to change iframe width & height
const adjustIframeTagSize = (
  tag = '',
  TilePreviewHeight = '184',
  TilePreviewWidth = '298'
): string =>
  tag
    .replace(/(height=["|']?)(\d*)/, `$1${TilePreviewHeight}`)
    .replace(/(width=["|']?)(\d*)/, `$1${TilePreviewWidth}`);

export const renderIframe = (
  tag: string,
  TilePreviewHeight = '100%',
  TilePreviewWidth = '100%'
): JSX.Element | null => {
  if (!tag) {
    return null;
  }
  const elem = (
    <div
      className="iframe-preview"
      style={{ height: '100%', width: '100%' }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: adjustIframeTagSize(tag, TilePreviewHeight, TilePreviewWidth),
      }}
    />
  );
  return elem;
};
