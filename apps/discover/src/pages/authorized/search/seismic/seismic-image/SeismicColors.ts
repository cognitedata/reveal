interface SeismicColor {
  id: string;
  title: string;
  startColor: string;
  middleColor: string;
  endColor: string;
}

const colors: SeismicColor[] = [
  {
    id: 'greyscale',
    title: 'Grey scale',
    startColor: '#ffffff',
    middleColor: '',
    endColor: '#000000',
  },
  {
    id: 'redBlack',
    title: 'Red to black',
    startColor: '#ff0000',
    middleColor: '#FFFFFF',
    endColor: '#000000',
  },
  {
    id: 'redBlue',
    title: 'Red to blue',
    startColor: '#ff0000',
    middleColor: '#FFFFFF',
    endColor: '#0000ff',
  },
];

export type { SeismicColor };

export default colors;
