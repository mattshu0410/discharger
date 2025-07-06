import { useMutation } from '@tanstack/react-query';
import { generateBlocks } from './queries';

export const useGenerateBlocks = () => {
  return useMutation({
    mutationFn: generateBlocks,
  });
};
