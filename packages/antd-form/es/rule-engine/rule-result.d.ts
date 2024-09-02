import { TRuleOption } from './interface';
export default class RuleResult {
    conditions: any;
    event: TRuleOption['event'];
    priority: number;
    name: string;
    result: any;
    calResult: any;
    constructor(conditions: TRuleOption['conditions'], event: TRuleOption['event'], priority: number, name: string);
    setResult(result: any): void;
    setCalResult(calResult: any): void;
    toJSON(stringify?: boolean): string | {
        conditions: any;
        event: import("./interface").TEvent;
        priority: number;
        name: string;
        result: any;
    };
}
