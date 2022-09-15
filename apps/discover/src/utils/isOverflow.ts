export const isOverflow = ({
  clientWidth,
  clientHeight,
  scrollWidth,
  scrollHeight,
}: {
  clientWidth: number;
  clientHeight: number;
  scrollWidth: number;
  scrollHeight: number;
}) => {
  return scrollHeight > clientHeight || scrollWidth > clientWidth;
};
