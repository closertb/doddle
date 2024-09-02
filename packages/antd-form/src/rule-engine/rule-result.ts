'use strict'
// const deepClone = require('clone');
import { TRuleOption } from './interface';


export default class RuleResult {
  conditions: any;
  event: TRuleOption['event'];
  priority: number;
  name: string;
  result: any; 
  calResult: any;
  constructor (conditions: TRuleOption['conditions'], event: TRuleOption['event'], priority: number, name: string) {
    this.conditions = conditions;
    this.event = event;
    this.priority = priority;
    this.name = name
    this.result = null
  }

  setResult (result: any) {
    this.result = result;
  }

  setCalResult (calResult: any) {
    this.calResult = calResult;
  }

  toJSON (stringify = true) {
    const props = {
      conditions: this.conditions.toJSON(false),
      event: this.event,
      priority: this.priority,
      name: this.name,
      result: this.result
    }
    if (stringify) {
      return JSON.stringify(props)
    }
    return props
  }
}
