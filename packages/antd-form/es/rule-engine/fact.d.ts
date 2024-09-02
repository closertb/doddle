import { AnyObject, TFactType } from './interface';
export default class Fact {
    /**
     * Returns a new fact instance
     * @param  {string} id - fact unique identifer
     * @param  {object} options
     * @param  {boolean} options.cache - whether to cache the fact's value for future rules
     * @param  {primitive|function} valueOrMethod - constant primitive, or method to call when computing the fact's value
     * @return {Fact}
     */
    id: string;
    valueOrMethod: string;
    priority: number;
    type: TFactType;
    options: AnyObject;
    value: any;
    calculationMethod: any;
    cacheKeyMethod: any;
    constructor(id: any, valueOrMethod: any, options?: AnyObject);
    isConstant(): boolean;
    isDynamic(): boolean;
    /**
     * Return the fact value, based on provided parameters
     * @param  {object} params
     * @param  {Almanac} almanac
     * @return {any} calculation method results
     */
    calculate(params: any, almanac: any): any;
    /**
     * Return a cache key (MD5 string) based on parameters
     * @param  {object} obj - properties to generate a hash key from
     * @return {string} MD5 string based on the hash'd object
     */
    static hashFromObject(obj: any): number;
    /**
     * Default properties to use when caching a fact
     * Assumes every fact is a pure function, whose computed value will only
     * change when input params are modified
     * @param  {string} id - fact unique identifer
     * @param  {object} params - parameters passed to fact calcution method
     * @return {object} id + params
     */
    defaultCacheKeys(id: any, params: any): {
        params: any;
        id: any;
    };
    /**
     * Generates the fact's cache key(MD5 string)
     * Returns nothing if the fact's caching has been disabled
     * @param  {object} params - parameters that would be passed to the computation method
     * @return {string} cache key
     */
    getCacheKey(params: any): number;
}
