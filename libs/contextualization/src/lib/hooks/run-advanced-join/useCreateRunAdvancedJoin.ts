import { useMutation } from '@tanstack/react-query';

export const useCreateRunAdvancedJoin = () => {
  return useMutation(async (advancedJoinExternalId: string) => {
    const response = await fetch(
      `https://localhost:8443/api/v1/projects/contextualization/context/advancedjoins/run`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          advancedJoinExternalId: advancedJoinExternalId,
        }),
      }
    );
    return response.json();
  });
};
