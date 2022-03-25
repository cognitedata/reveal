type BoundingBoxGraphicProps = {
  width?: string;
  height?: string;
};

export const BoundingBoxGraphic = (props: BoundingBoxGraphicProps) => (
  <svg
    {...props}
    viewBox="0 0 66 35"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="1"
      y="1"
      width="62"
      height="33"
      rx="0.5"
      fill="white"
      stroke="#D9D9D9"
    />
    <path d="M4 5.75012H25V9.25012H4V5.75012Z" fill="#E8E8E8" />
    <path d="M49.5 5.75H60V9.25H49.5V5.75Z" fill="#E8E8E8" />
    <path d="M28.5 5.75H46V9.25H28.5V5.75Z" fill="#E8E8E8" />
    <path d="M60 26.75H39V30.25H60V26.75Z" fill="#E8E8E8" />
    <path d="M14.5 26.75H4V30.25H14.5V26.75Z" fill="#E8E8E8" />
    <path d="M35.5 26.75H18V30.25H35.5V26.75Z" fill="#E8E8E8" />
    <path d="M4 12.75H60V16.25H4V12.75Z" fill="#E8E8E8" />
    <path d="M4 19.75H33.75V23.25H4V19.75Z" fill="#E8E8E8" />
    <path
      d="M37.25 18.7C37.25 18.3134 37.5634 18 37.95 18H59.3C59.6866 18 60 18.3134 60 18.7V24.3C60 24.6866 59.6866 25 59.3 25H37.95C37.5634 25 37.25 24.6866 37.25 24.3V18.7Z"
      fill="#FF8746"
      fillOpacity="0.2"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M59.3 18.35H37.95C37.7567 18.35 37.6 18.5067 37.6 18.7V24.3C37.6 24.4933 37.7567 24.65 37.95 24.65H59.3C59.4933 24.65 59.65 24.4933 59.65 24.3V18.7C59.65 18.5067 59.4933 18.35 59.3 18.35ZM37.95 18C37.5634 18 37.25 18.3134 37.25 18.7V24.3C37.25 24.6866 37.5634 25 37.95 25H59.3C59.6866 25 60 24.6866 60 24.3V18.7C60 18.3134 59.6866 18 59.3 18H37.95Z"
      fill="#FF6918"
    />
    <path d="M61.0557 22.5H61.9446V30.5H61.0557V22.5Z" fill="#FF6918" />
    <path
      d="M65.5 26.0555L65.5 26.9444L57.5 26.9444L57.5 26.0555L65.5 26.0555Z"
      fill="#FF6918"
    />
  </svg>
);
