import Operator from './operator';
import { AnyObject, TOperator, TRuleOption, TStatus, TcallbackMethods } from './interface';
declare const Emitter: any;
declare class Engine extends Emitter {
    rules: any[];
    allowUndefinedFacts: boolean;
    pathResolver: () => string;
    operators: Map<string, Operator>;
    facts: Map<string, any>;
    status: TStatus;
    prioritizedRules: null | any[];
    context: AnyObject;
    finishOnFirstRuleHit: boolean;
    /**
     * Returns a new Engine instance
     * @param  {Rule[]} rules - array of rules to initialize with
     */
    constructor(rules?: TRuleOption[], options?: AnyObject);
    /**
     * Add a rule definition to the engine
     * @param {object|Rule} properties - rule definition.  can be JSON representation, or instance of Rule
     * @param {integer} properties.priority (>1) - higher runs sooner.
     * @param {Object} properties.event - event to fire when rule evaluates as successful
     * @param {string} properties.event.type - name of event to emit
     * @param {string} properties.event.params - parameters to pass to the event listener
     * @param {Object} properties.conditions - conditions to evaluate when processing this rule
     */
    addRule(properties: any): this;
    /**
     * update a rule in the engine
     * @param {object|Rule} rule - rule definition. Must be a instance of Rule
     */
    updateRule(rule: any): void;
    /**
     * return rule length
     */
    getRuleLength(): number;
    /**
     * Remove a rule from the engine
     * @param {object|Rule|string} rule - rule definition. Must be a instance of Rule
     */
    removeRule(rule: any): boolean;
    /**
     * Add a custom operator definition
     * @param {string}   operatorOrName - operator identifier within the condition; i.e. instead of 'equals', 'greaterThan', etc
     * @param {function(factValue, jsonValue)} callback - the method to execute when the operator is encountered.
     */
    addOperator(operatorOrName: string | Operator, cb?: TOperator): void;
    /**
     * Remove a custom operator definition
     * @param {string}   operatorOrName - operator identifier within the condition; i.e. instead of 'equals', 'greaterThan', etc
     * @param {function(factValue, jsonValue)} callback - the method to execute when the operator is encountered.
     */
    removeOperator(operatorOrName: any): boolean;
    /**
     * Add a fact definition to the engine.  Facts are called by rules as they are evaluated.
     * @param {object|Fact} id - fact identifier or instance of Fact
     * @param {function} definitionFunc - function to be called when computing the fact value for a given rule
     * @param {Object} options - options to initialize the fact with. used when "id" is not a Fact instance
     */
    addFact(id: any, valueOrMethod: any, options?: AnyObject): this;
    /**
     * Remove a fact definition to the engine.  Facts are called by rules as they are evaluated.
     * @param {object|Fact} id - fact identifier or instance of Fact
     */
    removeFact(factOrId: any): boolean;
    /**
     * Iterates over the engine rules, organizing them by highest -> lowest priority
     * 因为有优先级一样的规则，所以这里做了一次聚合，将Rule[] 转换成了Rule[][]
     * @return {Rule[][]} two dimensional array of Rules.
     *    Each outer array element represents a single priority(integer).  Inner array is
     *    all rules with that priority.
     */
    prioritizeRules(): any[];
    /**
     * Stops the rules engine from running the next priority set of Rules.  All remaining rules will be resolved as undefined,
     * and no further events emitted.  Since rules of the same priority are evaluated in parallel(not series), other rules of
     * the same priority may still emit events, even though the engine is in a "finished" state.
     * @return {Engine}
     */
    stop(): this;
    /**
     * Returns a fact by fact-id
     * @param  {string} factId - fact identifier
     * @return {Fact} fact instance, or undefined if no such fact exists
     */
    getFact(factId: any): any;
    /**
     * setContext
    */
    setContext(...context: AnyObject[]): void;
    /**
     * getContext
    */
    getContext(): AnyObject;
    /**
     * Runs an array of rules
     * @param  {Rule[]} array of rules to be evaluated
     * @return {Promise} resolves when all rules in the array have been evaluated
     */
    evaluateRules(ruleArray: any, almanac: any): Promise<any[]>;
    /**
     * Runs the rules engine
     * @param  {Object} runtimeFacts - fact values known at runtime
     * @param  {Object} runOptions - run options
     * @return {Promise} resolves when the engine has completed running
     */
    run(runtimeFacts?: {}, callbackMethods?: TcallbackMethods): Promise<unknown>;
}
export default Engine;
