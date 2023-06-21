// import React, { useEffect, useRef, useState } from 'react';
// import { Prompt, useLocation, useNavigate } from 'react-router-dom';

// import { PROCESS_NAVIGATION_WARNING_PROMPT } from '@vision/constants/MessageConstants';
// import * as H from 'history';

// export const CustomPrompt = ({
//   when,
//   onOK,
// }: {
//   when: boolean;
//   onOK?: () => boolean;
// }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [showPrompt, setShowPrompt] = useState(false);
//   const showPromptRef = useRef(false);
//   const originalPath = useRef<H.Location<any> | null>(null);
//   const currentPath = useRef<H.Location<any> | null>(null);

//   const setShowPromptState = (state: boolean) => {
//     // since state variable can be stale for useeffect with not deps, ref is also used
//     showPromptRef.current = state;
//     setShowPrompt(state);
//   };

//   useEffect(() => {
//     // ideally should only run once
//     originalPath.current = location;
//     if (when) {
//       setShowPromptState(true);
//     } else {
//       setShowPromptState(false);
//     }
//   }, [when]);

//   const onPressOk = () => {
//     setShowPromptState(false);
//   };

//   const onPressCancel = () => {
//     if (
//       currentPath.current &&
//       !currentPath.current.pathname.includes('vision/workflow')
//     ) {
//       setShowPromptState(true);
//       if (originalPath.current) {
//         navigate(-1);
//       }
//     }
//   };

//   useEffect(() => {
//     if (!showPrompt && currentPath.current) {
//       // when navigation allowed
//       navigate(
//         {
//           pathname: currentPath.current.pathname,
//           search: currentPath.current?.search,
//         },
//         {
//           state: {
//             ...currentPath.current.state,
//           },
//         }
//       );
//     }
//   }, [showPrompt]);

//   useEffect(() => {
//     return () => {
//       if (
//         when &&
//         showPromptRef.current &&
//         !window.location.href.includes('vision/workflow')
//       ) {
//         // navigation disallowed for different paths other than workflow
//         // eslint-disable-next-line no-alert
//         if (window.confirm(PROCESS_NAVIGATION_WARNING_PROMPT)) {
//           if (onOK) {
//             onOK();
//           }
//         } else if (originalPath.current) {
//           // if window alerts disabled and user tries to navigate to different page user will be redirected back to page
//           navigate(-1);
//         }
//       }

//       if (
//         // if user navigates anyway after warning
//         when &&
//         !showPromptRef.current &&
//         !window.location.href.includes('vision/workflow')
//       ) {
//         if (onOK) {
//           onOK();
//         }
//       }
//     };
//   }, []);

//   return (
//     <>
//       <Prompt
//         when={showPrompt}
//         message={(loc: any, _: any) => {
//           if (when && !loc.pathname.includes('vision/workflow')) {
//             currentPath.current = loc;
//             // eslint-disable-next-line no-alert
//             if (window.confirm(PROCESS_NAVIGATION_WARNING_PROMPT)) {
//               onPressOk();
//             } else {
//               onPressCancel();
//             }
//             return false;
//           }
//           return true;
//         }}
//       />
//     </>
//   );
// };
