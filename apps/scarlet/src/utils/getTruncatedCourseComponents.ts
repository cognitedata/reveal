import {
  EquipmentComponent,
  EquipmentComponentType,
  EquipmentConfig,
  EquipmentType,
} from 'types';
import { getCourseComponents } from 'transformations';

export const getTruncatedCourseComponents = ({
  equipmentType,
  prevComponents,
  newComponents,
  config,
}: {
  equipmentType: EquipmentType;
  prevComponents: EquipmentComponent[];
  newComponents: EquipmentComponent[];
  config: EquipmentConfig;
}) => {
  let resComponents = newComponents;
  const prevNumbOfCourses =
    parseInt(
      prevComponents
        .find((comp) => comp.type === EquipmentComponentType.SHELL)
        ?.componentElements.find((elem) => elem.key === 'no_of_courses')
        ?.detections[0]?.value ?? '',
      10
    ) || 0;

  const newNumbOfCourses =
    parseInt(
      newComponents
        .find((comp) => comp.type === EquipmentComponentType.SHELL)
        ?.componentElements.find((elem) => elem.key === 'no_of_courses')
        ?.detections[0]?.value ?? '',
      10
    ) || 0;

  if (newNumbOfCourses === 0 && newComponents.length > 1) {
    resComponents = resComponents.filter(
      (comp) => comp.type !== EquipmentComponentType.COURSE
    );
  } else if (newNumbOfCourses && newNumbOfCourses < prevNumbOfCourses) {
    const allComps = newComponents.filter(
      (comp) => comp.type !== EquipmentComponentType.COURSE
    );
    const courseComps = newComponents.filter(
      (comp) => comp.type === EquipmentComponentType.COURSE
    );
    resComponents = [...allComps, ...courseComps.slice(0, newNumbOfCourses)];
  } else if (newNumbOfCourses > prevNumbOfCourses) {
    const courseComponents = getCourseComponents({
      numbOfCourses: newNumbOfCourses - prevNumbOfCourses,
      equipmentType,
      config,
      startIndex: prevNumbOfCourses,
    });
    resComponents = [...newComponents, ...courseComponents];
  }

  return resComponents;
};
