export const isDurationEmpty = (duration: number[]): boolean => {
  return (
    duration && duration.length > 1 && duration[0] === 0 && duration[1] === 0
  );
};
