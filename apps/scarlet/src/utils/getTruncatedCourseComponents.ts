import {
  EquipmentComponent,
  EquipmentComponentType,
  EquipmentConfig,
  EquipmentType,
} from 'types';
import { getCourseComponents } from 'transformations';

export const getTruncatedCourseComponents = ({
  componentType,
  equipmentType,
  prevComponents,
  newComponents,
  config,
}: {
  componentType: EquipmentComponentType;
  equipmentType: EquipmentType;
  prevComponents: EquipmentComponent[];
  newComponents: EquipmentComponent[];
  config: EquipmentConfig;
}) => {
  let resComponents = newComponents;
  const prevNumbOfCourses =
    parseInt(
      prevComponents
        .find((comp) => comp.type === componentType)
        ?.componentElements.find((elem) => elem.key === 'no_of_courses')
        ?.detections[0]?.value ?? '',
      10
    ) || 0;

  const newNumbOfCourses =
    parseInt(
      newComponents
        .find((comp) => comp.type === componentType)
        ?.componentElements.find((elem) => elem.key === 'no_of_courses')
        ?.detections[0]?.value ?? '',
      10
    ) || 0;

  if (newNumbOfCourses === 0 && newComponents.length > 1) {
    resComponents = resComponents.filter(
      (comp) =>
        !(
          comp.type === EquipmentComponentType.COURSE &&
          comp.id.startsWith(componentType)
        )
    );
  } else if (newNumbOfCourses && newNumbOfCourses < prevNumbOfCourses) {
    const allComps = newComponents.filter(
      (comp) =>
        !(
          comp.type === EquipmentComponentType.COURSE &&
          comp.id.startsWith(componentType)
        )
    );
    const courseComps = newComponents.filter(
      (comp) =>
        comp.type === EquipmentComponentType.COURSE &&
        comp.id.startsWith(componentType)
    );
    resComponents = [...allComps, ...courseComps.slice(0, newNumbOfCourses)];
  } else if (newNumbOfCourses > prevNumbOfCourses) {
    const courseComponents = getCourseComponents({
      idPrexis: componentType,
      numbOfCourses: newNumbOfCourses - prevNumbOfCourses,
      equipmentType,
      config,
      startIndex: prevNumbOfCourses,
    });
    resComponents = [...newComponents, ...courseComponents];
  }

  return resComponents;
};
