import { type ReactElement, type SVGProps } from 'react';

export const TouchPan = (props: SVGProps<SVGSVGElement>): ReactElement => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M30 44C30 40.686 27.314 38 24 38C20.686 38 18 40.686 18 44V64C18 80.568 31.432 94 48 94C64.568 94 78 80.568 78 64V48C78 44.686 75.314 42 72 42C68.686 42 66 44.686 66 48V44C66 40.686 63.314 38 60 38C56.686 38 54 40.686 54 44V40C54 36.686 51.314 34 48 34C44.686 34 42 36.686 42 40V12C42 8.686 39.314 6 36 6C32.686 6 30 8.686 30 12V58V44Z"
      stroke="#ABB9FB"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M80 16H52"
      stroke="white"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M74 10L80 16L74 22"
      stroke="white"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M58 10L52 16L58 22"
      stroke="white"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TouchZoom = (props: SVGProps<SVGSVGElement>): ReactElement => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M53.98 36C53.98 32.686 56.666 30 59.98 30C63.294 30 65.98 32.686 65.98 36V40C65.98 36.686 68.666 34 71.98 34C75.294 34 77.98 36.686 77.98 40V46V43.876C77.98 40.562 80.666 37.876 83.98 37.876C87.294 37.876 89.98 40.562 89.98 43.876V64C89.98 80.568 76.548 94 59.98 94C51.696 94 44.1961 90.642 38.7661 85.214L17.2961 58.178C15.4061 55.798 15.6021 52.38 17.7501 50.23C20.0861 47.894 23.8721 47.894 26.2081 50.23L34.658 58.68C37.36 61.382 41.9781 59.468 41.9781 55.648V46V12C41.9781 8.686 44.6641 6 47.9781 6C51.2921 6 53.9781 8.686 53.9781 12V40"
      stroke="#ABB9FB"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 40L32 18"
      stroke="white"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 26V18H24"
      stroke="white"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 32V40H18"
      stroke="white"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TouchSelect = (props: SVGProps<SVGSVGElement>): ReactElement => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M32.01 30.6575C27.2747 28.4126 24 23.5887 24 18C24 10.268 30.268 4 38 4C45.732 4 52 10.268 52 18C52 23.5887 48.7253 28.4126 43.99 30.6575"
      stroke="white"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 50C32 46.686 29.314 44 26 44C22.686 44 20 46.686 20 50V64C20 80.568 33.432 94 50 94C66.568 94 80 80.568 80 64V50C80 46.686 77.314 44 74 44C70.686 44 68 46.686 68 50V46C68 42.686 65.314 40 62 40C58.686 40 56 42.686 56 46V42C56 38.686 53.314 36 50 36C46.686 36 44 38.686 44 42V18C44 14.686 41.314 12 38 12C34.686 12 32 14.686 32 18V62V50Z"
      stroke="#ABB9FB"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
