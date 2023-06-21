import React from 'react';

type LineThicknessIconProps = {
  fill?: string;
};

export const LineThicknessIcon: React.FC<LineThicknessIconProps> = ({
  fill = 'black',
}) => {
  return (
    <svg
      width="14"
      height="12"
      viewBox="0 0 14 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0.999719C0 0.36728 0.671573 0.499939 1.5 0.499939H12.5C13.3284 0.499939 14 0.437439 14 0.999719C14 1.562 13.3284 1.49994 12.5 1.49994H1.5C0.671573 1.49994 0 1.63216 0 0.999719Z"
        fill={fill}
        fill-opacity="0.7"
      />
      <path
        d="M2.0735e-05 5.00014C2.0735e-05 4.30582 0.671594 4.00014 1.50002 4.00014H12.5C13.3284 4.00014 14 4.356 14 5.00014C14 5.64429 13.3284 6.00014 12.5 6.00014H1.50002C0.671594 6.00014 2.0735e-05 5.69446 2.0735e-05 5.00014Z"
        fill={fill}
        fill-opacity="0.7"
      />
      <path
        d="M2.0735e-05 10.0001C2.0735e-05 9.17171 0.671594 8.50014 1.50002 8.50014H12.5C13.3284 8.50014 14 9.17171 14 10.0001C14 10.8286 13.3284 11.5001 12.5 11.5001H1.50002C0.671594 11.5001 2.0735e-05 10.8286 2.0735e-05 10.0001Z"
        fill={fill}
        fill-opacity="0.7"
      />
    </svg>
  );
};
