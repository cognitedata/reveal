export const Pen = ({ color }: { color: string }) => {
  return (
    <svg
      width="70"
      height="35"
      viewBox="0 0 70 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1220_116844)">
        <g filter="url(#filter0_d_1220_116844)">
          <rect
            opacity="0.5"
            x="37.5609"
            y="27.5"
            width="20"
            height="32.439"
            transform="rotate(-90 37.5609 27.5)"
            fill="url(#paint0_linear_1220_116844)"
          />
          <rect
            opacity="0.5"
            x="37.5609"
            y="27.5"
            width="20"
            height="32.439"
            transform="rotate(-90 37.5609 27.5)"
            fill="url(#paint1_linear_1220_116844)"
          />
          <path
            opacity="0.5"
            d="M32.439 27.5L32.439 7.5L10.2439 14.6053L10.2439 20.3947L32.439 27.5Z"
            fill="url(#paint2_linear_1220_116844)"
          />
          <path
            opacity="0.5"
            d="M32.439 27.5L32.439 7.5L10.2439 14.6053L10.2439 20.3947L32.439 27.5Z"
            fill="url(#paint3_linear_1220_116844)"
          />
          <path
            d="M10.2439 14.1666L2.92235 16.549C2.00159 16.8486 2.00159 18.1512 2.92235 18.4508L10.2439 20.8333L10.2439 14.1666Z"
            fill={color}
          />
          <path
            d="M37.5609 27.5L37.5609 7.5L31.7316 7.5C31.1794 7.5 30.7316 7.94772 30.7316 8.5L30.7316 26.5C30.7316 27.0523 31.1794 27.5 31.7316 27.5L37.5609 27.5Z"
            fill={color}
          />
          <path
            d="M37.5609 27.5L37.5609 7.5L31.7316 7.5C31.1794 7.5 30.7316 7.94772 30.7316 8.5L30.7316 26.5C30.7316 27.0523 31.1794 27.5 31.7316 27.5L37.5609 27.5Z"
            fill="url(#paint4_linear_1220_116844)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_1220_116844"
          x="0.231812"
          y="5.5"
          width="75.7681"
          height="28"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="2" dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1220_116844"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1220_116844"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_1220_116844"
          x1="37.5609"
          y1="43.7195"
          x2="59.2276"
          y2="43.7195"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D3D3D3" />
          <stop offset="0.0989583" stopColor="#C4C4C4" />
          <stop offset="0.192708" stopColor="#BCBCBC" />
          <stop offset="0.432505" stopColor="#C4C4C4" stopOpacity="0.19" />
          <stop offset="0.609375" stopColor="#E3E3E3" stopOpacity="0" />
          <stop offset="0.859375" stopColor="#C4C4C4" stopOpacity="0.355342" />
          <stop offset="1" stopColor="#C4C4C4" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1220_116844"
          x1="37.5609"
          y1="43.7195"
          x2="59.2276"
          y2="43.7195"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D3D3D3" stopOpacity="0" />
          <stop offset="0.510417" stopColor="#C4C4C4" stopOpacity="0" />
          <stop offset="0.8125" stopColor="#A69B9B" stopOpacity="0.355342" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1220_116844"
          x1="18.2114"
          y1="25"
          x2="21.3581"
          y2="4.10727"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D3D3D3" />
          <stop offset="0.0989583" stopColor="#C4C4C4" />
          <stop offset="0.192708" stopColor="#BCBCBC" />
          <stop offset="0.432505" stopColor="#C4C4C4" stopOpacity="0.19" />
          <stop offset="0.609375" stopColor="#E3E3E3" stopOpacity="0" />
          <stop offset="0.859375" stopColor="#C4C4C4" stopOpacity="0.355342" />
          <stop offset="1" stopColor="#C4C4C4" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_1220_116844"
          x1="22.1951"
          y1="27.5"
          x2="22.1951"
          y2="5.83333"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D3D3D3" stopOpacity="0" />
          <stop offset="0.510417" stopColor="#C4C4C4" stopOpacity="0" />
          <stop offset="0.8125" stopColor="#A69B9B" stopOpacity="0.355342" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_1220_116844"
          x1="34.1463"
          y1="27.5"
          x2="34.1463"
          y2="7.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.22968" stopColor={color} />
          <stop offset="0.582303" stopColor="white" stopOpacity="0.6" />
          <stop offset="0.798517" stopColor="white" stopOpacity="0.309588" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <clipPath id="clip0_1220_116844">
          <rect
            width="70"
            height="34"
            fill="white"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
