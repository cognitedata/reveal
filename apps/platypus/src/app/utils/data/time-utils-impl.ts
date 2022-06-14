import { TimeUtils } from '@platypus/platypus-core';

export class TimeUtilsImpl implements TimeUtils {
  getHourFromTimeString(timeString: string): string {
    return timeString.split(':')[0];
  }
  getMinuteFromTimeString(timeString: string): string {
    return timeString.split(':')[1].replace(/\D/g, '');
  }
  getTwelveHourTimeString(hours?: number, minutes?: number): string {
    if (
      hours === null ||
      hours === undefined ||
      minutes === null ||
      minutes === undefined
    ) {
      return '';
    }

    const amPmOutput = hours >= 12 && hours <= 23 ? 'PM' : 'AM';
    const hourOutput = hours !== 12 ? hours % 12 : 12;
    const stringHours = this.addLeadingZeroesToMatchTemplateNumberLength(
      hourOutput,
      '00'
    );
    const stringMinutes = this.addLeadingZeroesToMatchTemplateNumberLength(
      minutes,
      '00'
    );
    return stringHours + ':' + stringMinutes + ' ' + amPmOutput;
  }
  getMilitaryTimeString(hours: number, minutes: number): string {
    if (
      hours === null ||
      hours === undefined ||
      minutes === null ||
      minutes === undefined
    ) {
      return '';
    }

    let hourOutput;
    if (hours > 23) {
      hourOutput = hours % 12;
    } else {
      hourOutput = hours;
    }

    const stringHours = this.addLeadingZeroesToMatchTemplateNumberLength(
      hourOutput,
      '00'
    );
    const stringMinutes = this.addLeadingZeroesToMatchTemplateNumberLength(
      minutes,
      '00'
    );
    return stringHours + ':' + stringMinutes;
  }
  checkIfEndTimeIsAfterStartTime(
    startTimeString: string,
    endTimeString: string
  ): boolean {
    const startHours = parseInt(
      this.getHourFromTimeString(startTimeString),
      10
    );
    const startMinutes = parseInt(
      this.getMinuteFromTimeString(startTimeString),
      10
    );
    const endHours = parseInt(this.getHourFromTimeString(endTimeString), 10);
    const endMinutes = parseInt(
      this.getMinuteFromTimeString(endTimeString),
      10
    );
    return (
      startHours < endHours ||
      (startHours === endHours && startMinutes < endMinutes)
    );
  }

  isTwelveHourTimeFormat(input: string): boolean {
    const pattern = /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/;
    return pattern.test(input);
  }
  isMilitaryTimeFormat(input: string): boolean {
    // eslint-disable-next-line no-useless-escape
    const patternExp = `^(0[0-9]|1[0-9]|2[0-24])\:([0-5][0-9])$`;
    const pattern = new RegExp(patternExp);
    return pattern.test(input);
  }

  private addLeadingZeroesToMatchTemplateNumberLength(
    targetNumber: number,
    templateNumber: string
  ): string {
    const numberOfDigits = templateNumber.toString().length;
    let targetNumberString = targetNumber.toString();
    while (targetNumberString.length < numberOfDigits) {
      targetNumberString = '0' + targetNumberString;
    }

    return targetNumberString;
  }
}
