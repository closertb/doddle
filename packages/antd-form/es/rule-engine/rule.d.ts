declare const Emitter: any;
import { TEvent, TRuleOption } from './interface';
declare class Rule extends Emitter {
    /**
     * returns a new Rule instance
     * @param {object,string} options, or json string that can be parsed into options
     * @param {integer} options.priority (>1) - higher runs sooner.
     * @param {Object} options.event - event to fire when rule evaluates as successful
     * @param {string} options.event.type - name of event to emit
     * @param {string} options.event.params - parameters to pass to the event listener
     * @param {Object} options.conditions - conditions to evaluate when processing this rule
     * @param {any} options.name - identifier for a particular rule, particularly valuable in RuleResult output
     * @param {any} options.id - identifier for a particular rule, particularly valuable in RuleResult output
     * @return {Rule} instance
     */
    priority: number;
    id: string;
    name: string;
    conditions: any;
    ruleEvent: TEvent;
    engine: any;
    constructor(options: TRuleOption);
    /**
     * Sets the priority of the rule
     * @param {integer} priority (>=1) - increasing the priority causes the rule to be run prior to other rules
     */
    setPriority(priority: any): this;
    /**
     * Sets the unique id of the rule
     * @param {any} id - any truthy input
     */
    setId(id: any): this;
    /**
     * Sets the name of the rule
     * @param {any} name - any truthy input and zero is allowed
     */
    setName(name: any): this;
    /**
     * Sets the conditions to run when evaluating the rule.
     * @param {object} conditions - conditions, root element must be a boolean operator
     */
    setConditions(conditions: any): this;
    /**
     * Sets the event to emit when the conditions evaluate truthy
     * @param {object} event - event to emit
     * @param {string} event.type - event name to emit on
     * @param {string} event.params - parameters to emit as the argument of the event emission
     */
    setEvent(event: any): this;
    /**
     * returns the event object
     * @returns {Object} event
     */
    getEvent(): TEvent;
    /**
     * returns the priority
     * @returns {Number} priority
     */
    getPriority(): number;
    /**
     * returns the event object
     * @returns {Object} event
     */
    getConditions(): any;
    /**
     * returns the engine object
     * @returns {Object} engine
     */
    getEngine(): any;
    /**
     * Sets the engine to run the rules under
     * @param {object} engine
     * @returns {Rule}
     */
    setEngine(engine: any): this;
    toJSON(stringify?: boolean): string | {
        conditions: any;
        priority: number;
        event: TEvent;
        name: string;
    };
    /**
     * Priorizes an array of conditions based on "priority"
     *   When no explicit priority is provided on the condition itself, the condition's priority is determine by its fact
     * @param  {Condition[]} conditions
     * @return {Condition[][]} prioritized two-dimensional array of conditions
     *    Each outer array element represents a single priority(integer).  Inner array is
     *    all conditions with that priority.
     */
    prioritizeConditions(conditions: any): any[];
    /**
     * Evaluates the rule, starting with the root boolean operator and recursing down
     * All evaluation is done within the context of an almanac
     * @return {Promise(RuleResult)} rule evaluation result
     */
    evaluate(almanac: any): Promise<any>;
}
export default Rule;
