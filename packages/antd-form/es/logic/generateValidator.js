import { isArray } from '../utils';
export default function generateValidator(rules, values) {
    const _rules = (isArray(rules) ? rules : [rules]);
    for (const rule of _rules) {
        const originValidator = rule === null || rule === void 0 ? void 0 : rule.validator;
        if (!originValidator) {
            return;
        }
        if (originValidator) {
            rule.validator = function (...ruleArgs) {
                const [_, ...rest] = ruleArgs;
                const _next = Object.assign(Object.assign({}, _), (values || {}));
                return originValidator.apply(this, [_next, ...rest]);
            };
        }
    }
}
