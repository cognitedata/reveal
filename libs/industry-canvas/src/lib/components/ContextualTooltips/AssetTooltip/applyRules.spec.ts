import applyRules from './applyRules';
import { Condition } from './types';
describe('applyRules', () => {
  describe('single rules', () => {
    describe(Condition.EQUALS, () => {
      it('should return the then value if the value equals the comparison value', () => {
        expect(
          applyRules(0.5, [
            {
              id: '1',
              condition: Condition.EQUALS,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return the then value if the value equals the comparison value as a string', () => {
        expect(
          applyRules(0.5, [
            {
              id: '1',
              condition: Condition.EQUALS,
              comparisonValue: '0.5',
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return undefined if the value does not equal the comparison value', () => {
        expect(
          applyRules(0.1, [
            {
              id: '1',
              condition: Condition.EQUALS,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual(undefined);
      });

      it('should return undefined if the comparison value is not a number string', () => {
        expect(
          applyRules(0.1, [
            {
              id: '1',
              condition: Condition.EQUALS,
              comparisonValue: 'not a number',
              then: 'green',
            },
          ])
        ).toEqual(undefined);
      });
    });

    describe(Condition.NOT_EQUALS, () => {
      it('should return the then value if the value does not equal the comparison value', () => {
        expect(
          applyRules(0.1, [
            {
              id: '1',
              condition: Condition.NOT_EQUALS,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return the then value if the value does not equal the comparison value as a string', () => {
        expect(
          applyRules(0.1, [
            {
              id: '1',
              condition: Condition.NOT_EQUALS,
              comparisonValue: '0.5',
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return undefined if the value equals the comparison value', () => {
        expect(
          applyRules(0.5, [
            {
              id: '1',
              condition: Condition.NOT_EQUALS,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual(undefined);
      });

      it('should return undefined if the comparison value is not a number string', () => {
        expect(
          applyRules(0.1, [
            {
              id: '1',
              condition: Condition.NOT_EQUALS,
              comparisonValue: 'not a number',
              then: 'green',
            },
          ])
        ).toEqual(undefined);
      });
    });

    describe(Condition.GREATER_THAN, () => {
      it('should return the then value if the value is greater than the comparison value', () => {
        expect(
          applyRules(0.6, [
            {
              id: '1',
              condition: Condition.GREATER_THAN,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return the then value if the value is greater than the comparison value as a string', () => {
        expect(
          applyRules(0.6, [
            {
              id: '1',
              condition: Condition.GREATER_THAN,
              comparisonValue: '0.5',
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return undefined if the value is not greater than the comparison value', () => {
        expect(
          applyRules(0.4, [
            {
              id: '1',
              condition: Condition.GREATER_THAN,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual(undefined);
      });

      it('should return undefined if the comparison value is not a number string', () => {
        expect(
          applyRules(0.4, [
            {
              id: '1',
              condition: Condition.GREATER_THAN,
              comparisonValue: 'not a number',
              then: 'green',
            },
          ])
        ).toEqual(undefined);
      });
    });

    describe(Condition.GREATER_THAN_OR_EQUAL, () => {
      it('should return the then value if the value is greater than the comparison value', () => {
        expect(
          applyRules(0.6, [
            {
              id: '1',
              condition: Condition.GREATER_THAN_OR_EQUAL,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return the then value if the value is greater than the comparison value as a string', () => {
        expect(
          applyRules(0.6, [
            {
              id: '1',
              condition: Condition.GREATER_THAN_OR_EQUAL,
              comparisonValue: '0.5',
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return the then value if the value is equal to the comparison value', () => {
        expect(
          applyRules(0.5, [
            {
              id: '1',
              condition: Condition.GREATER_THAN_OR_EQUAL,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return undefined if the value is not greater than or equal to the comparison value', () => {
        expect(
          applyRules(0.4, [
            {
              id: '1',
              condition: Condition.GREATER_THAN_OR_EQUAL,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual(undefined);
      });

      it('should return undefined if the comparison value is not a number string', () => {
        expect(
          applyRules(0.4, [
            {
              id: '1',
              condition: Condition.GREATER_THAN_OR_EQUAL,
              comparisonValue: 'not a number',
              then: 'green',
            },
          ])
        ).toEqual(undefined);
      });
    });

    describe(Condition.LESS_THAN, () => {
      it('should return the then value if the value is less than the comparison value', () => {
        expect(
          applyRules(0.4, [
            {
              id: '1',
              condition: Condition.LESS_THAN,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return the then value if the value is less than the comparison value as a string', () => {
        expect(
          applyRules(0.4, [
            {
              id: '1',
              condition: Condition.LESS_THAN,
              comparisonValue: '0.5',
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return undefined if the value is not less than the comparison value', () => {
        expect(
          applyRules(0.6, [
            {
              id: '1',
              condition: Condition.LESS_THAN,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual(undefined);
      });

      it('should return undefined if the value is not a number string', () => {
        expect(
          applyRules(0.6, [
            {
              id: '1',
              condition: Condition.LESS_THAN,
              comparisonValue: 'not a number',
              then: 'green',
            },
          ])
        ).toEqual(undefined);
      });
    });

    describe(Condition.LESS_THAN_OR_EQUAL, () => {
      it('should return the then value if the value is less than the comparison value', () => {
        expect(
          applyRules(0.4, [
            {
              id: '1',
              condition: Condition.LESS_THAN_OR_EQUAL,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return the then value if the value is less than the comparison value as a string', () => {
        expect(
          applyRules(0.4, [
            {
              id: '1',
              condition: Condition.LESS_THAN_OR_EQUAL,
              comparisonValue: '0.5',
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return the then value if the value is equal to the comparison value', () => {
        expect(
          applyRules(0.5, [
            {
              id: '1',
              condition: Condition.LESS_THAN_OR_EQUAL,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual('green');
      });

      it('should return undefined if the value is not less than or equal to the comparison value', () => {
        expect(
          applyRules(0.6, [
            {
              id: '1',
              condition: Condition.LESS_THAN_OR_EQUAL,
              comparisonValue: 0.5,
              then: 'green',
            },
          ])
        ).toEqual(undefined);
      });

      it('should return undefined if the comparison value is not a number string', () => {
        expect(
          applyRules(0.6, [
            {
              id: '1',
              condition: Condition.LESS_THAN_OR_EQUAL,
              comparisonValue: 'not a number',
              then: 'green',
            },
          ])
        ).toEqual(undefined);
      });
    });
  });

  describe('multiple rules', () => {
    it('should return the then value of the last matching rule when multiple rules match', () => {
      expect(
        applyRules(0.5, [
          {
            id: '1',
            condition: Condition.EQUALS,
            comparisonValue: 0.5,
            then: 'green',
          },
          {
            id: '2',
            condition: Condition.EQUALS,
            comparisonValue: 0.5,
            then: 'red',
          },
        ])
      ).toEqual('red');
    });

    it('should correctly handle multiple rules when its not the last rule that matches', () => {
      expect(
        applyRules(0.5, [
          {
            id: '1',
            condition: Condition.EQUALS,
            comparisonValue: 0.5,
            then: 'green',
          },
          {
            id: '2',
            condition: Condition.GREATER_THAN,
            comparisonValue: 0.6,
            then: 'red',
          },
        ])
      ).toEqual('green');
    });
  });
});
