interface Props {
  numberOfPoints: number;
  showMarkers: boolean;
}

export const shouldShowMarkers = ({ numberOfPoints, showMarkers }: Props) => {
  /**
   * If there is only 1 datapoint, line cannot be defined.
   * Hence, we force to show markers.
   * Then we can see only 1 marker for the datapoint.
   */
  if (numberOfPoints === 1 || showMarkers) {
    return true;
  }

  return false;
};
