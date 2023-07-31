import { CasingComponentInternal } from '../types';

type ComponentType = Pick<CasingComponentInternal, 'grade'>;

export const getCasingComponentsGrades = <T extends ComponentType>(
  components: T[]
) => {
  const grades = new Set<string>();

  components.forEach(({ grade }) => {
    if (grade && !grades.has(grade)) {
      grades.add(grade);
    }
  });

  return Array.from(grades);
};
