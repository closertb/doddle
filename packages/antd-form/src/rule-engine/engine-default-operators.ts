import Operator from './operator'

function numberValidator (factValue) {
  return Number.parseFloat(factValue).toString() !== 'NaN'
}

const Operators = [];
Operators.push(new Operator('equal', (a, b) => a === b));
Operators.push(new Operator('notEqual', (a, b) => a !== b));

Operators.push(new Operator('in', (a, b) => b.indexOf(a) > -1));
Operators.push(new Operator('notIn', (a, b) => b.indexOf(a) === -1));

// Operators.push(new Operator('contains', (a, b) => a.indexOf(b) > -1, Array.isArray));
// Operators.push(new Operator('doesNotContain', (a, b) => a.indexOf(b) === -1, Array.isArray));

Operators.push(new Operator('lessThan', (a, b) => a < b, numberValidator));
Operators.push(new Operator('lessThanInclusive', (a, b) => a <= b, numberValidator));
Operators.push(new Operator('greaterThan', (a, b) => a > b, numberValidator));
Operators.push(new Operator('greaterThanInclusive', (a, b) => a >= b, numberValidator));

Operators.push(new Operator('arrayIn', (a: string[], b: string) => a.includes(b), Array.isArray));
Operators.push(new Operator('arrayNotIn', (a: string[], b: string) => !Array.isArray(a) || !a.includes(b)));

export const OperatorEnums = [{
  value: 'equal',
  label: '等于',
},{
  value: 'notEqual',
  label: '不等于',
},{
  value: 'greaterThan',
  label: '大于',
},{
  value: 'greaterThanInclusive',
  label: '大于等于',
},{
  value: 'lessThan',
  label: '小于',
},{
  value: 'lessThanInclusive',
  label: '小于等于',
},{
  value: 'in',
  label: '包含',
},{
  value: 'notIn',
  label: '不包含',
},{
  value: 'arrayIn',
  label: '包含',
},{
  value: 'arrayNotIn',
  label: '不包含',
}];


export const systemRuleOfPhone = (rule: any, value) => {
  const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
  
  if (value && !reg.test(value)) {
    return '手机号格式不正确';
  }
}

export const systemRuleOfEmail = (rule: any, value) => {
  const reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;;
  if (value && !reg.test(value)) {
    return '邮箱格式不正确';
  }
}

export default Operators
