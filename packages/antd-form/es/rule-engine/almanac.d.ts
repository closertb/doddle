import { AnyObject, TcallbackMethods } from './interface';
/**
 * Fact results lookup
 * Triggers fact computations and saves the results
 * A new almanac is used for every engine run()
 */
export default class Almanac {
    allowUndefinedFacts: boolean;
    factMap: Map<string, any>;
    factResultsCache: Map<string, any>;
    pathResolver: (value: any, path: any) => any;
    events: {
        success: any[];
        failure: any[];
    };
    ruleResults: any[];
    callbackMethods: null | TcallbackMethods;
    constructor(factMap: any, runtimeFacts?: {}, options?: AnyObject);
    /**
     * Adds a success event
     * @param {Object} event
     */
    addEvent(event: any, outcome: any): void;
    /**
     * retrieve successful events
     */
    getEvents(outcome?: string): any;
    /**
     * Adds a rule result
     * @param {Object} event
     */
    addResult(ruleResult: any): void;
    /**
     * retrieve successful events
     */
    getResults(): any[];
    /**
     * Retrieve fact by id, raising an exception if it DNE
     * @param  {String} factId
     * @return {Fact}
     */
    _getFact(factId: any): any;
    /**
     * Registers fact with the almanac
     * @param {[type]} fact [description]
     */
    _addConstantFact(fact: any): void;
    /**
     * Sets the computed value of a fact
     * @param {Fact} fact
     * @param {Object} params - values for differentiating this fact value from others, used for cache key
     * @param {Mixed} value - computed value
     */
    _setFactValue(fact: any, params: any, value: any): Promise<any>;
    /**
     * Adds a constant fact during runtime.  Can be used mid-run() to add additional information
     * @param {String} fact - fact identifier
     * @param {Mixed} value - constant value of the fact
     */
    addRuntimeFact(factId: any, value: any): void;
    /**
     * Returns the value of a fact, based on the given parameters.  Utilizes the 'almanac' maintained
     * by the engine, which cache's fact computations based on parameters provided
     * @param  {string} factId - fact identifier
     * @param  {Object} params - parameters to feed into the fact.  By default, these will also be used to compute the cache key
     * @param  {String} path - object
     * @return {Promise} a promise which will resolve with the fact computation.
     */
    factValue(factId: any, params?: {}, path?: string): any;
}
