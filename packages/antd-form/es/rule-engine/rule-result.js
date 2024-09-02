'use strict';
export default class RuleResult {
    constructor(conditions, event, priority, name) {
        this.conditions = conditions;
        this.event = event;
        this.priority = priority;
        this.name = name;
        this.result = null;
    }
    setResult(result) {
        this.result = result;
    }
    setCalResult(calResult) {
        this.calResult = calResult;
    }
    toJSON(stringify = true) {
        const props = {
            conditions: this.conditions.toJSON(false),
            event: this.event,
            priority: this.priority,
            name: this.name,
            result: this.result
        };
        if (stringify) {
            return JSON.stringify(props);
        }
        return props;
    }
}
