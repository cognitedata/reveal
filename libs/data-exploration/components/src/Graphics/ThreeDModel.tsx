import React, { SVGProps } from 'react';

export const ThreeDModel = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width={100}
    {...props}
  >
    <circle cx={50} cy={50} r={41} fill="#F2F4FF" />
    <circle
      cx={50}
      cy={50}
      r={46.811}
      transform="rotate(3.357 50 50)"
      stroke="#B5B9FB"
    />
    <circle cx={50.5} cy={49.5} r={37} stroke="#ACB1FA" />
    <circle cx={49.5} cy={22.5} r={4.5} fill="#4D6AF2" />
    <path
      d="M48.293 84.282V23.16L28.21 28.947v61.448l20.083-6.112ZM9 84.282l19.21 6.111V28.865L9 23.16v61.123Z"
      fill="#fff"
      stroke="#DADADA"
    />
    <path
      d="M28.21 17.92 9 23.16l19.21 6.112 20.083-6.112-20.083-5.24Z"
      fill="#fff"
      stroke="#DADADA"
    />
    <path d="M48.293 83.41 28.21 77.296 9 83.409" stroke="#DADADA" />
    <path
      d="M48.293 84.283V23.16L28.21 17.92v72.475l20.083-6.112Z"
      stroke="#DADADA"
    />
    <path d="M33 68.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" fill="#ACB1FA" />
    <circle cx={78.5} cy={85.5} r={4.5} fill="#FB0" />
    <circle cx={38.334} cy={55.986} r={13.116} fill="#fff" stroke="#DADADA" />
    <path d="M25.5 58c2.49 2.75 21.833 2.581 24.5 0" stroke="#DADADA" />
    <path
      d="m57.025 26.652 20.957 66.362L57.025 100V26.653Z"
      fill="#fff"
      stroke="#DADADA"
    />
    <path
      d="M57.025 26.652V100l-21.83-6.986 21.83-66.361Z"
      fill="#FEFEFE"
      stroke="#DADADA"
    />
    <path d="m77.981 93.015-20.956-6.986-21.83 6.986" stroke="#DADADA" />
  </svg>
);
