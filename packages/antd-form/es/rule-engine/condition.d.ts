import { AnyObject, TCondition, TMethodCondition, TRuleOption } from './interface';
export default class Condition {
    priority: number;
    operator: string;
    result: AnyObject;
    value: any;
    fact: string;
    params: AnyObject;
    factResult: AnyObject;
    isMethod: boolean;
    withResult: boolean;
    method: TMethodCondition['method'];
    path: string;
    methodName: string;
    constructor(properties: TRuleOption['conditions'] | TCondition);
    /**
     * Converts the condition into a json-friendly structure
     * @param   {Boolean} stringify - whether to return as a json string
     * @returns {string,object} json string or json-friendly object
     */
    toJSON(stringify?: boolean): string | AnyObject;
    /**
     * Interprets .value as either a primitive, or if a fact, retrieves the fact value
     */
    _getValue(almanac: any): any;
    /**
     * Takes the fact result and compares it to the condition 'value', using the operator
     *   LHS                      OPER       RHS
     * <fact + params + path>  <operator>  <value>
     *
     * @param   {Almanac} almanac
     * @param   {Map} operatorMap - map of available operators, keyed by operator name
     * @returns {Boolean} - evaluation result
     */
    evaluate(almanac: any, operatorMap: any, context: any[]): any;
    /**
     * Returns the boolean operator for the condition
     * If the condition is not a boolean condition, the result will be 'undefined'
     * @return {string 'all' or 'any'}
     */
    static booleanOperator(condition: any): "all" | "any";
    /**
     * Returns the condition's boolean operator
     * Instance version of Condition.isBooleanOperator
     * @returns {string,undefined} - 'any', 'all', or undefined (if not a boolean condition)
     */
    booleanOperator(): "all" | "any";
    /**
     * Whether the operator is boolean ('all', 'any')
     * @returns {Boolean}
     */
    isBooleanOperator(): boolean;
}
