import Fact from './fact'
import Rule from './rule'
import Operator from './operator'
import Almanac from './almanac'
import defaultOperators from './engine-default-operators'
import debug from './debug'
import { AnyObject, TOperator, TRuleOption, TStatus, TcallbackMethods } from './interface'
import { isUndefined } from '../utils'
const Emitter = require('eventemitter2')

class Engine extends Emitter {
  rules: any[];
  allowUndefinedFacts: boolean;
  pathResolver: () => string;
  operators: Map<string, Operator>;
  facts: Map<string, any>;
  status: TStatus;
  prioritizedRules: null | any[];
  context: AnyObject = {};
  // 默认命中规则就结束
  finishOnFirstRuleHit = true;
  /**
   * Returns a new Engine instance
   * @param  {Rule[]} rules - array of rules to initialize with
   */
  constructor (rules: TRuleOption[] = [], options: AnyObject = {}) {
    super();
    this.rules = [];
    this.allowUndefinedFacts = options.allowUndefinedFacts || false
    this.pathResolver = options.pathResolver
    this.operators = new Map()
    this.facts = new Map();
    this.finishOnFirstRuleHit = isUndefined(options.finishOnFirstRuleHit) ? true : options.finishOnFirstRuleHit;
    this.status = TStatus.READY;
    rules.map(r => this.addRule(r));
    defaultOperators.map(o => this.addOperator(o));
  }

  /**
   * Add a rule definition to the engine
   * @param {object|Rule} properties - rule definition.  can be JSON representation, or instance of Rule
   * @param {integer} properties.priority (>1) - higher runs sooner.
   * @param {Object} properties.event - event to fire when rule evaluates as successful
   * @param {string} properties.event.type - name of event to emit
   * @param {string} properties.event.params - parameters to pass to the event listener
   * @param {Object} properties.conditions - conditions to evaluate when processing this rule
   */
  addRule (properties) {
    if (!properties) throw new Error('Engine: addRule() requires options')

    let rule
    if (properties instanceof Rule) {
      rule = properties
    } else {
      if (!Object.prototype.hasOwnProperty.call(properties, 'event')) throw new Error('Engine: addRule() argument requires "event" property')
      if (!Object.prototype.hasOwnProperty.call(properties, 'conditions')) throw new Error('Engine: addRule() argument requires "conditions" property')
      // console.log(properties.conditions);
      rule = new Rule(properties)
    }
    rule.setEngine(this)
    this.rules.push(rule)
    this.prioritizedRules = null
    return this
  }

  /**
   * update a rule in the engine
   * @param {object|Rule} rule - rule definition. Must be a instance of Rule
   */
  updateRule (rule) {
    const ruleIndex = this.rules.findIndex(ruleInEngine => (ruleInEngine.id === rule.id) && rule.id)
    if (ruleIndex > -1) {
      this.rules.splice(ruleIndex, 1)
      this.addRule(rule)
      this.prioritizedRules = null
    } else {
      throw new Error('Engine: updateRule() rule not found')
    }
  }
  
  /**
   * return rule length
   */
  getRuleLength () {
    return this.rules.length;
  }

  /**
   * Remove a rule from the engine
   * @param {object|Rule|string} rule - rule definition. Must be a instance of Rule
   */
  removeRule (rule) {
    if (!(rule instanceof Rule)) {
      this.rules = this.rules.filter(ruleInEngine => ruleInEngine.id !== rule)
      this.prioritizedRules = null
      return Boolean(this.rules.length)
    } else {
      if (!rule) return false
      const index = this.rules.indexOf(rule)
      if (index === -1) return false
      this.prioritizedRules = null
      return Boolean(this.rules.splice(index, 1).length)
    }
  }

  /**
   * Add a custom operator definition
   * @param {string}   operatorOrName - operator identifier within the condition; i.e. instead of 'equals', 'greaterThan', etc
   * @param {function(factValue, jsonValue)} callback - the method to execute when the operator is encountered.
   */
  addOperator (operatorOrName: string | Operator, cb?: TOperator) {
    let operator
    if (operatorOrName instanceof Operator) {
      operator = operatorOrName
    } else {
      operator = new Operator(operatorOrName, cb)
    }
    // debug(`engine::addOperator name:${operator.name}`)
    this.operators.set(operator.name, operator)
  }

  /**
   * Remove a custom operator definition
   * @param {string}   operatorOrName - operator identifier within the condition; i.e. instead of 'equals', 'greaterThan', etc
   * @param {function(factValue, jsonValue)} callback - the method to execute when the operator is encountered.
   */
  removeOperator (operatorOrName) {
    let operatorName
    if (operatorOrName instanceof Operator) {
      operatorName = operatorOrName.name
    } else {
      operatorName = operatorOrName
    }

    return this.operators.delete(operatorName)
  }

  /**
   * Add a fact definition to the engine.  Facts are called by rules as they are evaluated.
   * @param {object|Fact} id - fact identifier or instance of Fact
   * @param {function} definitionFunc - function to be called when computing the fact value for a given rule
   * @param {Object} options - options to initialize the fact with. used when "id" is not a Fact instance
   */
  addFact (id, valueOrMethod, options?: AnyObject) {
    let factId = id
    let fact
    if (id instanceof Fact) {
      factId = id.id
      fact = id
    } else {
      fact = new Fact(id, valueOrMethod, options)
    }
    // debug(`engine::addFact id:${factId}`)
    this.facts.set(factId, fact)
    return this
  }

  /**
   * Remove a fact definition to the engine.  Facts are called by rules as they are evaluated.
   * @param {object|Fact} id - fact identifier or instance of Fact
   */
  removeFact (factOrId) {
    let factId
    if (!(factOrId instanceof Fact)) {
      factId = factOrId
    } else {
      factId = factOrId.id
    }

    return this.facts.delete(factId)
  }

  /**
   * Iterates over the engine rules, organizing them by highest -> lowest priority
   * 因为有优先级一样的规则，所以这里做了一次聚合，将Rule[] 转换成了Rule[][]
   * @return {Rule[][]} two dimensional array of Rules.
   *    Each outer array element represents a single priority(integer).  Inner array is
   *    all rules with that priority.
   */
  prioritizeRules () {
    if (!this.prioritizedRules) {
      const ruleSets = this.rules.reduce((sets, rule) => {
        const priority = rule.priority
        if (!sets[priority]) sets[priority] = []
        sets[priority].push(rule)
        return sets
      }, {})
      this.prioritizedRules = Object.keys(ruleSets).sort((a, b) => {
        return Number(a) > Number(b) ? -1 : 1 // order highest priority -> lowest
      }).map((priority) => ruleSets[priority])
    }
    return this.prioritizedRules;
  }

  /**
   * Stops the rules engine from running the next priority set of Rules.  All remaining rules will be resolved as undefined,
   * and no further events emitted.  Since rules of the same priority are evaluated in parallel(not series), other rules of
   * the same priority may still emit events, even though the engine is in a "finished" state.
   * @return {Engine}
   */
  stop () {
    this.status = TStatus.FINISHED;
    return this
  }

  /**
   * Returns a fact by fact-id
   * @param  {string} factId - fact identifier
   * @return {Fact} fact instance, or undefined if no such fact exists
   */
  getFact (factId) {
    return this.facts.get(factId)
  }

  /**
   * setContext
  */
  setContext (...context: AnyObject[]) {
    this.context = context;
  }

  /**
   * getContext
  */
  getContext () {
    return this.context;
  }

  /**
   * Runs an array of rules
   * @param  {Rule[]} array of rules to be evaluated
   * @return {Promise} resolves when all rules in the array have been evaluated
   */
  evaluateRules (ruleArray, almanac) {
    const run = (rule) => {
      if (this.status !== TStatus.RUNNING) {
        // debug(`engine::run status:${this.status}; skipping remaining rules`)
        return
      }
      return rule.evaluate(almanac).then((ruleResult) => {
        // debug(`engine::run ruleResult:${ruleResult}`)
        almanac.addResult(ruleResult)
        if (ruleResult.result) {
          almanac.addEvent(ruleResult.event, 'success');
          this.emitAsync('success', Object.assign(ruleResult.event, isUndefined(ruleResult.calResult) ? {} : { result: ruleResult.calResult }), almanac, ruleResult)
            .then(() => this.emitAsync(ruleResult.event.type, ruleResult.event.params, almanac, ruleResult))
          return true;
        } else {
          almanac.addEvent(ruleResult.event, 'failure')
          this.emitAsync('failure', ruleResult.event, almanac, ruleResult);
          return false;
        }
      });
    };

    return Promise.all(ruleArray.map(run));
  }

  /**
   * Runs the rules engine
   * @param  {Object} runtimeFacts - fact values known at runtime
   * @param  {Object} runOptions - run options
   * @return {Promise} resolves when the engine has completed running
   */
  run (runtimeFacts = {}, callbackMethods?: TcallbackMethods) {
    // debug('engine::run started')
    this.status = TStatus.RUNNING
    const almanacOptions = {
      allowUndefinedFacts: this.allowUndefinedFacts,
      pathResolver: this.pathResolver,
      callbackMethods,
    }
    const almanac = new Almanac(this.facts, runtimeFacts, almanacOptions)
    const orderedSets = this.prioritizeRules();

    let hit = false;
    // console.log('kkk set', orderedSets);
    
    let cursor: Promise<void|any[]> = Promise.resolve([]);
    // for each rule set, evaluate in parallel,
    // before proceeding to the next priority set.
    return new Promise((resolve, reject) => {
      orderedSets.map((set) => {
        cursor = cursor.then((res = []) => {
          // 命中条件后，直接退出
          if (this.finishOnFirstRuleHit && res[0]) return Promise.resolve([true]);

          return this.evaluateRules(set, almanac)
        }).catch(reject)
        return cursor
      })
      cursor.then(() => {
        this.status = TStatus.FINISHED
        // debug('engine::run completed');
        const ruleResults = almanac.getResults()
        const { results, failureResults } = ruleResults.reduce((hash, ruleResult) => {
          const group = ruleResult.result ? 'results' : 'failureResults'
          hash[group].push(ruleResult)
          return hash;
        }, { results: [], failureResults: [] });

        resolve({
          almanac,
          results, // 满足条件的
          failureResults, // 不满足条件的
          events: almanac.getEvents('success'),
          failureEvents: almanac.getEvents('failure')
        })
      }).catch(reject)
    })
  }
}

export default Engine
