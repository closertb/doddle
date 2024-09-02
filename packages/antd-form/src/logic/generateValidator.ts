import { ValidatorRule } from 'rc-field-form/lib/interface';
import { isArray } from '../utils';

export default function generateValidator(rules: ValidatorRule[], values?: Record<string, any>) {
  const _rules = (isArray(rules) ? rules : [rules]) as ValidatorRule[];

  for (const rule of _rules) {
    const originValidator = rule?.validator;

    if (!originValidator) {
      return;
    }

    if (originValidator) {
      rule.validator = function (...ruleArgs) {
        const [_, ...rest] = ruleArgs;

        const _next = {
          ..._,
          ...(values || {}),
        };

        return originValidator.apply(this, [_next, ...rest]);
      };
    }
  }
}
