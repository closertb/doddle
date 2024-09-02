import { isFunction, isUndefined, formatedArrStrToArr, formatName } from '../utils';
import Engine from './engine';
import { systemRuleOfEmail, systemRuleOfPhone } from './engine-default-operators';
import { AnyObject, TOperatorLogicEnum } from './interface';

const noop = (args: any) => false;

const formatArrayStrToStr = (str: string) => {
  const arr = formatedArrStrToArr(str);
  return formatName(arr);
}

const propsMap = {
  visible: 'setVisible',
  disable: 'setDisable',
  props: 'setProps',
  childProps: 'setChildProps',
  value: 'setValue',
};

const propPriorityMap = {
  'visible': 10000,
  'disable': 1000,
  'value': 100,
  'props': 10,
  'childProps': 0,
};

const logicTypeMap = {
  and: TOperatorLogicEnum.ALL,
  or: TOperatorLogicEnum.ANY,
}

export default function parse({
  fieldName,
  changes,
  context,
  methods = {},
}: {
  changes: any[];
  context: Record<string, any>;
  fieldName: string;
  methods: Record<string, any>;
}) {
  // visible | 'disable' | 'prop' | 'childProp' | 'value';
  const engines = [];
  const runContext: AnyObject = {};
  for (const changeItem of changes) {
    const { caseItems = [], type } = changeItem;
    // 不同类型 不同优先级
    let priority = propPriorityMap[type];
    if (isUndefined(priority)) {
      throw new Error(`联动类型：${type}不正确，期望为 ${Object.keys(propPriorityMap).join(',')} 中的一种`)
    }
    // 创建执行规则
    const engine = new Engine([]);
    // 添加环境变量
    engine.addFact('context', () => context?.data, {
      cache: false
    });
    // 添加动态默认值
    engine.addFact('field', function (params, almanac) {
      return runContext.callbackMethods?.getFieldsValue();
    }, {
      cache: false
    });
    for (const caseItem of caseItems) {
      const { condition, result, message, logicType } = caseItem;
      if (condition && condition.length) {
        const id = `${fieldName}-${type}-${++priority}`;
        engine.addRule({
          priority,
          id,
          name: id,
          conditions: {
            [logicTypeMap[logicType]]: condition.map(({
              name,
              methodType,
              props,
              type,
              method
            }: {
              name: string,
              methodType: 'selfDefine' | 'importMethod';
              props: AnyObject;
              type: 'JSFunction';
              method?: (props: any) => any;
            }) => {
              // 可视化自定义条件
              if (methodType === 'selfDefine') {
                const { condition, key, value } = props;
                const path: string = key?.value || '';
                const isFormCtx = path.startsWith('context.data');
                return {
                  conditionType: 'logic',
                  fact: isFormCtx ? 'context' : 'field',
                  operator: condition?.value,
                  value: value?.value,
                  path: isFormCtx ? path.replace('context.data.', '') : formatArrayStrToStr(path),
                };
              }
              // 自定义函数
              if (methodType === 'importMethod') {
                const func = method || methods[name];
                if (!func || !isFunction(func)) {
                  throw new Error(`导入的函数: ${name} 为 undefined，请检查`)
                }
                return {
                  conditionType: 'method',
                  methodName: name,
                  withResult: priority < 1000,
                  method: func,
                };
              }

              return {

              };
            })
          },
          event: {  // define the event to fire when the conditions evaluate truthy
            type,
            result,
            params: {
              result,
              message: 'condition is statisfied!'
            }
          },
          // 添加规则处理结果回调, 与 waform 联动;
          onSuccess: (result) => {
            // console.log('tttt: result', result, callbackMethods, context);
            const callbackKey = propsMap[type];
            if (runContext.callbackMethods && runContext.callbackMethods[callbackKey]) {
              runContext.callbackMethods[callbackKey](result?.result);
              return;
            }
            
            // console.log('this result type is: ', result.type, 'and the result message is ', result.params.message);
            // return 'yes';
          },
          onFailure: (result) => {
            // console.log('test failed');
            // return 'no';
            const callbackKey = propsMap[type];
            if (['visible', 'disable'].includes(type) && runContext.callbackMethods && runContext.callbackMethods[callbackKey]) {
              runContext.callbackMethods[callbackKey](!result?.result);
              return;
            }
          }
        });        
      }
    }

    // 有 有效的规则 才添加
    if (engine.getRuleLength()) {
      engines.push(engine);
    }
  }

  return async (methods, ...args) => {
    // 运行 onChange；
    const handles = [[], []];
    runContext.callbackMethods = methods;
    for (const engine of engines) {
      engine.setContext(methods, ...args);
      const { results = [], failureResults = [] } = await engine.run({}, args);
      // console.log('res:', results[0], failureResults[0]);
      handles[0].push(...results);
      handles[1].push(...failureResults); 
    }
    // console.log('kkkk', handles, format(handles));
    return handles;
  };
}

export const systemMethods = {
  // 邮箱格式校验
  tel: systemRuleOfPhone,
  // 手机号校验
  email: systemRuleOfEmail,
}

export function parseRules({
  form,
  required,
  fieldName,
  rules = {},
  context,
  methods = {},
  requiredMessage = '不能为空',
}: {
  form: AnyObject;
  required: boolean;
  requiredMessage?: string;
  rules: { caseItems?: any[] };
  context: Record<string, any>;
  fieldName: string;
  methods: Record<string, any>;
}) {
  // visible | 'disable' | 'prop' | 'childProp' | 'value';
  // 创建执行规则
  const engine = new Engine([]);

  let priority = 999;
  // 添加环境变量
  engine.addFact('context', () => context?.data || {}, {
    cache: false
  });
  engine.addFact('field', function (params, almanac) {
    return form?.getFieldsValue();
  }, {
    cache: false
  });
  const { caseItems = [] } = rules;
  for (const rule of caseItems) {
    const { condition, result, logicType } = rule;
    if (condition?.length) {
      const id = `${fieldName}-${--priority}`;
      engine.addRule({
        priority,
        id,
        name: id,
        conditions: {
          [logicTypeMap[logicType]]: condition.map((conditionDesc: {
            name: string,
            methodType: 'selfDefine' | 'importMethod' | 'system';
            props: AnyObject;
            method: (value: any) => Function;
            type: 'JSFunction';
          }) => {
            const {
              name,
              methodType,
              props,
              type,
              method
            } = conditionDesc;
            // 可视化自定义条件
            if (methodType === 'selfDefine') {
              const { condition, key, value } = props;
              const path: string = key?.value || '';
              const isFormCtx = path.startsWith('context.data');
              return {
                conditionType: 'logic',
                fact: isFormCtx ? 'context' : 'field',
                operator: condition?.value,
                value: value?.value,
                path: isFormCtx ? path.replace('context.data.', '') : formatArrayStrToStr(path),
              };
            }
            // 自定义函数if (methodType === 'importMethod' && (method || methods[name])) {
            if (methodType === 'importMethod' && (method || methods[name])) {
              const func = method || methods[name];
              if (!func || !isFunction(func)) {
                throw new Error(`导入的函数: ${name} 为 undefined，请检查`)
              }
              return {
                conditionType: 'method',
                methodName: name,
                withResult: true,
                // 注入context;
                method: func,
              };
            }

            // 自定义函数if (methodType === 'importMethod' && (method || methods[name])) {
            if (methodType === 'system' && systemMethods[name]) {
              const func = systemMethods[name];
              if (!isFunction(func)) {
                throw new Error(`系统函数: ${name} 为 undefined，请检查`)
              }
              return {
                conditionType: 'method',
                methodName: name,
                withResult: true,
                method: func,
              };
            }
  
            throw new Error(`校验配置错误: ${JSON.stringify(conditionDesc)}`)
          })
        },
        event: {  // define the event to fire when the conditions evaluate truthy
          type: 'trigger message show',
          result: result || '校验出错',
          params: {
            message: '校验出错',
          }
        },
        // 触发校验报错;
        onSuccess: (result, context) => {
          // return Promise.reject(new Error(result.params.message || '校验出错'));
        },
        // doNothing
        onFailure: (result, context) => {
          // return Promise.resolve(false);
        }
      });
    }
  }


  let validators = [];
  if (required) {
    validators.push({ required: true, message: requiredMessage });
  }

  // console.log('kkkk length:', engine.getRuleLength());
  
  if (engine.getRuleLength()) {
    validators.push({
      validator: async (...args) => {
        engine.setContext(...args, form);
        // @ts-ignore;
        const { results = [], failureResults = [] } = await engine.run({});
        // console.log('results', results, failureResults);
        if (results.length) {
          const message = results[0].event?.result || '校验出错';
          return Promise.reject(message);
        }
        return Promise.resolve(false);
      }
    });
  }

  return validators;
}