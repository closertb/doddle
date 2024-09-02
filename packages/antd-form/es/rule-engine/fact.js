import hash from 'hash-it';
import { TFactType } from './interface';
export default class Fact {
    constructor(id, valueOrMethod, options) {
        this.id = id;
        const defaultOptions = { cache: true };
        if (typeof options === 'undefined') {
            options = defaultOptions;
        }
        if (typeof valueOrMethod !== 'function') {
            this.value = valueOrMethod;
            this.type = TFactType.CONSTANT;
        }
        else {
            this.calculationMethod = valueOrMethod;
            this.type = TFactType.DYNAMIC;
        }
        if (!this.id)
            throw new Error('factId required');
        this.priority = parseInt(options.priority || 1, 10);
        this.options = Object.assign({}, defaultOptions, options);
        this.cacheKeyMethod = this.defaultCacheKeys;
        return this;
    }
    isConstant() {
        return this.type === TFactType.CONSTANT;
    }
    isDynamic() {
        return this.type === TFactType.DYNAMIC;
    }
    /**
     * Return the fact value, based on provided parameters
     * @param  {object} params
     * @param  {Almanac} almanac
     * @return {any} calculation method results
     */
    calculate(params, almanac) {
        // if constant fact w/set value, return immediately
        if (Object.prototype.hasOwnProperty.call(this, 'value')) {
            return this.value;
        }
        return this.calculationMethod(params, almanac);
    }
    /**
     * Return a cache key (MD5 string) based on parameters
     * @param  {object} obj - properties to generate a hash key from
     * @return {string} MD5 string based on the hash'd object
     */
    static hashFromObject(obj) {
        return hash(obj);
    }
    /**
     * Default properties to use when caching a fact
     * Assumes every fact is a pure function, whose computed value will only
     * change when input params are modified
     * @param  {string} id - fact unique identifer
     * @param  {object} params - parameters passed to fact calcution method
     * @return {object} id + params
     */
    defaultCacheKeys(id, params) {
        return { params, id };
    }
    /**
     * Generates the fact's cache key(MD5 string)
     * Returns nothing if the fact's caching has been disabled
     * @param  {object} params - parameters that would be passed to the computation method
     * @return {string} cache key
     */
    getCacheKey(params) {
        if (this.options.cache === true) {
            const cacheProperties = this.cacheKeyMethod(this.id, params);
            const hash = Fact.hashFromObject(cacheProperties);
            return hash;
        }
    }
}
