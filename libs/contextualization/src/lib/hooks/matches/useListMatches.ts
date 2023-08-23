import { useQuery } from '@tanstack/react-query';

export const useListMatches = () => {
  return useQuery({
    queryKey: ['context', 'advancedjoins', 'matches'],
    queryFn: async () => {
      const response = await fetch(
        `https://localhost:8443/api/v1/projects/contextualization/context/advancedjoins/matches`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.json();
    },
  });
};
