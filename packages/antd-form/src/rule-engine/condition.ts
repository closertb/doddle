import debug from './debug';
import { isObjectLike } from 'lodash';
import { AnyObject, TCondition, TLoginCondition, TMethodCondition, TRuleOption } from './interface';
import { isFunction } from '../utils';

export default class Condition {
  public priority: number;
  public operator: string;
  public result: AnyObject;
  public value: any;
  public fact: string;
  public params: AnyObject;
  public factResult: AnyObject; 
  public isMethod = false;
  public withResult = false;
  public method: TMethodCondition['method'];
  public path: string;
  public methodName: string;
  constructor (properties: TRuleOption['conditions'] | TCondition) {
    if (!properties) throw new Error('Condition: constructor options required')
    const booleanOperator = Condition.booleanOperator(properties)
    // Object.assign(this, properties)
    if (booleanOperator) {
      const subConditions = properties[booleanOperator]
      if (!(Array.isArray(subConditions))) {
        throw new Error(`"${booleanOperator}" must be an array`)
      }
      this.operator = booleanOperator
      // boolean conditions always have a priority; default 1
      this.priority = 1;
      this[booleanOperator] = subConditions.map((c) => {
        return new Condition(c);
      })
    } else {
      const _properties = properties as TCondition;
      // a non-boolean condition does not have a priority by default. this allows
      // priority to be dictated by the fact definition
      if (Object.prototype.hasOwnProperty.call(_properties, 'priority')) {
        this.priority = parseInt(String(_properties.priority), 10);
      }
        
      if (_properties.conditionType === 'method') {
        const condition = _properties as TMethodCondition;
        if (!isFunction(condition.method)) throw new Error(`Method Condition: constructor "method" property must be function, but got ${typeof condition.method}`)
        this.isMethod = true;
        this.methodName = condition.methodName;
        this.withResult = condition.withResult;
        this.method = condition.method;
        return;
      }

      const condition = _properties as TLoginCondition;
      if (!Object.prototype.hasOwnProperty.call(condition, 'fact')) throw new Error('Condition: constructor "fact" property required')
      if (!Object.prototype.hasOwnProperty.call(condition, 'operator')) throw new Error('Condition: constructor "operator" property required')
      if (!Object.prototype.hasOwnProperty.call(condition, 'value')) throw new Error('Condition: constructor "value" property required')
      Object.assign(this, condition);
    }
  }

  /**
   * Converts the condition into a json-friendly structure
   * @param   {Boolean} stringify - whether to return as a json string
   * @returns {string,object} json string or json-friendly object
   */
  toJSON (stringify = true) {
    const props: AnyObject = {}
    if (this.priority) {
      props.priority = this.priority
    }
    const oper = Condition.booleanOperator(this)
    if (oper) {
      props[oper] = this[oper].map((c) => c.toJSON(stringify))
    } else {
      props.operator = this.operator
      props.value = this.value
      props.fact = this.fact
      if (this.factResult !== undefined) {
        props.factResult = this.factResult
      }
      if (this.result !== undefined) {
        props.result = this.result
      }
      if (this.params) {
        props.params = this.params
      }
      if (this.path) {
        props.path = this.path
      }
    }
    if (stringify) {
      return JSON.stringify(props)
    }
    return props
  }

  /**
   * Interprets .value as either a primitive, or if a fact, retrieves the fact value
   */
  _getValue (almanac) {
    const value = this.value
    if (isObjectLike(value) && Object.prototype.hasOwnProperty.call(value, 'fact')) { // value: { fact: 'xyz' }
      return almanac.factValue(value.fact, value.params, value.path)
    }
    return Promise.resolve(value)
  }

  /**
   * Takes the fact result and compares it to the condition 'value', using the operator
   *   LHS                      OPER       RHS
   * <fact + params + path>  <operator>  <value>
   *
   * @param   {Almanac} almanac
   * @param   {Map} operatorMap - map of available operators, keyed by operator name
   * @returns {Boolean} - evaluation result
   */
  evaluate (almanac, operatorMap, context: any[]) {
    if (this.isMethod) {
      return Promise.resolve(this.method(...context)).then((data) => {
        // 先直接计算, 对于 条件的计算 和 props计算ok，但如果是setValue，要设置的值本就是 false， 那就需要继续修正
        let result = !!data;
        // todo: 如果setValue 就是想清空，咋整;
        if (this.withResult && typeof data !== 'undefined') {
          result = true;
        }
        // debug(`condition::evaluate ${this.methodName} cal result is <${JSON.stringify(data)}>, and condition result is (${result})`);

        return {
          result,
          leftHandSideValue: data,
        };
      });
    }
    if (!almanac) return Promise.reject(new Error('almanac required'))
    if (!operatorMap) return Promise.reject(new Error('operatorMap required'))
    if (this.isBooleanOperator()) return Promise.reject(new Error('Cannot evaluate() a boolean condition'))

    const op = operatorMap.get(this.operator)
    if (!op) return Promise.reject(new Error(`Unknown operator: ${this.operator}`))

    return this._getValue(almanac) // todo - parallelize
      .then(rightHandSideValue => {
        return almanac.factValue(this.fact, this.params, this.path)
          .then(leftHandSideValue => {
            const result = op.evaluate(leftHandSideValue, rightHandSideValue)
            // debug(`condition::evaluate <${JSON.stringify(leftHandSideValue)} ${this.operator} ${JSON.stringify(rightHandSideValue)}?> (${result})`)
            return { result, leftHandSideValue, rightHandSideValue, operator: this.operator }
          })
      })
  }

  /**
   * Returns the boolean operator for the condition
   * If the condition is not a boolean condition, the result will be 'undefined'
   * @return {string 'all' or 'any'}
   */
  static booleanOperator (condition) {
    if (Object.prototype.hasOwnProperty.call(condition, 'any')) {
      return 'any'
    } else if (Object.prototype.hasOwnProperty.call(condition, 'all')) {
      return 'all'
    }
  }

  /**
   * Returns the condition's boolean operator
   * Instance version of Condition.isBooleanOperator
   * @returns {string,undefined} - 'any', 'all', or undefined (if not a boolean condition)
   */
  booleanOperator () {
    return Condition.booleanOperator(this)
  }

  /**
   * Whether the operator is boolean ('all', 'any')
   * @returns {Boolean}
   */
  isBooleanOperator () {
    return Condition.booleanOperator(this) !== undefined
  }
}
