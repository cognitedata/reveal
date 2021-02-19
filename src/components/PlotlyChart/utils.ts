export function convertLineStyle(lineStyle?: 'solid' | 'dashed' | 'dotted') {
  switch (lineStyle) {
    case 'solid':
      return 'solid';
    case 'dashed':
      return 'dash';
    case 'dotted':
      return 'dot';
    default:
      return 'solid';
  }
}
