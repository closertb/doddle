import { TValidator } from "./interface";
export default class Operator {
    /**
     * Constructor
     * @param {string}   name - operator identifier
     * @param {function(factValue, jsonValue)} callback - operator evaluation method
     * @param {function}  [factValueValidator] - optional validator for asserting the data type of the fact
     * @returns {Operator} - instance
     */
    name: string;
    cb: (leftValue: any, rightValue: any) => void;
    factValueValidator: TValidator;
    constructor(name: any, cb: any, factValueValidator?: TValidator);
    /**
     * Takes the fact result and compares it to the condition 'value', using the callback
     * @param   {mixed} factValue - fact result
     * @param   {mixed} jsonValue - "value" property of the condition
     * @returns {Boolean} - whether the values pass the operator test
     */
    evaluate(factValue: any, jsonValue: any): void;
}
