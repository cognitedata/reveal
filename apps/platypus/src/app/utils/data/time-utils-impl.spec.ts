import { TimeUtilsImpl } from './time-utils-impl';

describe('TimeUtilsTest', () => {
  it('should get hour from time string', () => {
    const timeUtils = new TimeUtilsImpl();
    expect(timeUtils.getHourFromTimeString('11:36')).toEqual('11');
  });

  it('should get minutes from time string', () => {
    const timeUtils = new TimeUtilsImpl();
    expect(timeUtils.getMinuteFromTimeString('11:36')).toEqual('36');
  });

  it('should convert hours and minutes as 12h time string', () => {
    const timeUtils = new TimeUtilsImpl();
    expect(timeUtils.getTwelveHourTimeString(11, 36)).toEqual('11:36 AM');
    expect(timeUtils.getTwelveHourTimeString(13, 36)).toEqual('01:36 PM');
    expect(timeUtils.getTwelveHourTimeString(26, 36)).toEqual('02:36 AM');
  });

  it('should convert hours and minutes as 24h time string', () => {
    const timeUtils = new TimeUtilsImpl();
    expect(timeUtils.getMilitaryTimeString(11, 36)).toEqual('11:36');
    expect(timeUtils.getMilitaryTimeString(13, 36)).toEqual('13:36');
  });

  it('should check If End Time Is After Start Times', () => {
    const timeUtils = new TimeUtilsImpl();
    expect(timeUtils.checkIfEndTimeIsAfterStartTime('11:36', '13:30')).toEqual(
      true
    );
    expect(timeUtils.checkIfEndTimeIsAfterStartTime('13:36', '11:30')).toEqual(
      false
    );
  });

  it('should validate 12h format', () => {
    const timeUtils = new TimeUtilsImpl();
    expect(timeUtils.isTwelveHourTimeFormat('1:30 AM')).toEqual(true);
    expect(timeUtils.isTwelveHourTimeFormat('12:00')).toEqual(false);
  });

  it('should validate military format', () => {
    const timeUtils = new TimeUtilsImpl();
    expect(timeUtils.isMilitaryTimeFormat('1:30 AM')).toEqual(false);
    expect(timeUtils.isMilitaryTimeFormat('12:00')).toEqual(true);
    expect(timeUtils.isMilitaryTimeFormat('25:00')).toEqual(false);
    expect(timeUtils.isMilitaryTimeFormat('26:40')).toEqual(false);
    expect(timeUtils.isMilitaryTimeFormat('01:40')).toEqual(true);
  });
});
