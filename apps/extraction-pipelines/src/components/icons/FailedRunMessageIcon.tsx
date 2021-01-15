import React, { FunctionComponent } from 'react';

interface FailedRunMessageIconProps {}

export const FailedRunMessageIcon: FunctionComponent<FailedRunMessageIconProps> = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="10" fill="#E32351" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.25 4H10.75V5.57501C12.4617 5.92247 13.75 7.43578 13.75 9.25V12.25H15.25V13.75H13.75H12.25H7.75H6.25H4.75V12.25H6.25V9.25C6.25 7.43578 7.53832 5.92247 9.25 5.57501V4ZM12.25 9.25V12.25H7.75V9.25C7.75 8.00736 8.75736 7 10 7C11.2426 7 12.25 8.00736 12.25 9.25ZM10.75 16V14.5H9.25V16H10.75Z"
        fill="white"
      />
    </svg>
  );
};
