export interface Props {
  value: number;
  min: number;
  max: number;
}

export const isInRange = ({ value, min, max }: Props) => {
  return min <= value && value <= max;
};
