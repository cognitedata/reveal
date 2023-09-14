import {
  useCapabilities,
  CapabilityWithExperimentAcl,
} from './useCapabilities';

export const useExperimentalCapabilitiesCheck = (
  capabilitiesToCheck: string[]
) => {
  // rather than ignoring ts in multiple places, casting at on place because experimentalAcl is not presend in sdk type
  // @ts-ignore
  const { data: capabilities } = useCapabilities() as {
    data: CapabilityWithExperimentAcl[];
  };
  const experimentCapabilities = capabilities?.filter((capability) =>
    Boolean(capability.experimentAcl)
  );
  return capabilitiesToCheck
    .reduce<Boolean[]>((acc, checkName) => {
      const foundCapability = experimentCapabilities?.find(
        (capability) =>
          capability.experimentAcl.scope?.experimentscope?.experiments?.includes(
            checkName
          ) && capability.experimentAcl.actions.includes('USE')
      );

      acc.push(Boolean(foundCapability));

      return acc;
    }, [])
    .every(Boolean);
};

// For later use, when capability switches from experimental to main
// export const useReadWriteCapabilitiesCheck = (
//   capabilitiesToCheck: keyof SingleCogniteCapability
// ) => {
//   const { data: capabilities } = useCapabilities();
//   return capabilities
//     ?.reduce<Boolean[]>((acc, capability) => {
//       capabilitiesToCheck.forEach((check) => {
//         if (capability[check]) {
//           const { actions } = capability[check];
//           acc.push(actions.includes('READ') && actions.includes('WRITE'));
//         }
//       });
//       return acc;
//     }, [])
//     .every(Boolean);
// };
