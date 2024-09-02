
import parse from '../parse';

describe('setProps 自定义条件用例测试', () => {
  const condition = [{
    methodType: 'selfDefine',
    props: {
      condition: { key: 'select', value: 'greaterThanInclusive' },
      key: { key: 'select', value: 'context.data.gameDuration' },
      value: { key: 'input', value: 40 },
    }
    }, {
      methodType: 'selfDefine',
      props: {
        condition: { key: 'select', value: 'greaterThanInclusive' },
        key: { key: 'select', value: 'context.data.personalFoulCount' },
        value: { key: 'input', value: 5 },
      }
    }, {
      methodType: 'selfDefine',
      props: {
        condition: { key: 'select', value: 'greaterThanInclusive' },
        key: { key: 'select', value: 'age' },
        value: { key: 'input', value: 18 },
    }
  }];

  const allChanges = [{
    type: 'props',
    caseItems: [{
      logicType: 'and',
      condition,
      result: { disable: true },
    }],
  }];

  const onChange = parse({
    fieldName: 'name',
    changes: allChanges,
    context: {
      data: {
        personalFoulCount: 6,
        gameDuration: 40
      },
    },
  });

  test('满足条件', async () => {
    const results = await onChange({
      setProps: (visible) => { console.log('setProps result:', visible); },
      getFieldsValue: () => {
        return {
          age: 36,  // 满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });

    const format = (results, ok = 0) => results[ok].reduce((pre, cur) => {
      return Object.assign(pre, cur.event.params.result || {});
    }, {});
    
    expect(format(results, 0)).toEqual({ disable: true });
  });

  test('不满足条件', async () => {
    const results = await onChange({
      setProps: (visible) => { console.log('setProps result:', visible); },
      getFieldsValue: () => {
        return {
          age: 15,  // 不满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });

    const format = (results, ok = 0) => results[ok].reduce((pre, cur) => {
      return Object.assign(pre, cur.result || {});
    }, {});
    expect(format(results, 1)).toEqual({});
  });
});

describe('props 联动用例测试', () => {

  // test('环境测试：', () => {
  //   // 先做环境变量替换；
  //   // const text = replaceContent(str, reg, context)
  //   const text = 'demo'
  //   expect(text).toEqual(`demo`);
  // });
  const methodCondition = [{
    methodType: 'importMethod',
    name: 'testMethodProps',
  }];

  const format = (results, ok = 0) => results[ok].reduce((pre, cur) => {
    return Object.assign(pre, cur.calResult || {});
  }, {});

  const allChanges = [{
    type: 'props',
    caseItems: [{
      logicType: 'and',
      condition: methodCondition,
    }],
  }];

  const testMethodProps = (args) => { 
    const { age } = args.getFieldsValue();
    if (age <= 18) {
      return { disable: true };
    }
    
    if (age > 18 & age < 36) {
      return { disable: false };
    }

    return;
  };

  const onChange = parse({
    fieldName: 'name',
    changes: allChanges,
    context: {
      data: {
        personalFoulCount: 6,
        gameDuration: 40
      }
    },
    methods: {
      testMethodProps,
    },
  });

  test('props 单case测试, 有有返回值 true', async () => {
    const results = await onChange({
      isDeps: false,
      setProps: (visible) => { console.log('setProps result:', visible); },
      getFieldsValue: () => {
        return {
          age: 15,  // 满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });
    
    expect(format(results, 0)).toEqual({ disable: true });
  });

  test('props 单case测试, 有返回值 false', async () => {
    const results = await onChange({
      isDeps: false,
      setProps: (visible) => { console.log('setProps result:', visible); },
      getFieldsValue: () => {
        return {
          age: 32,  // 满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });
    
    expect(format(results, 0)).toEqual({ disable: false });
  });

  test('props 单case测试, 无返回值', async () => {

    const results = await onChange({
      isDeps: false,
      setProps: (visible) => { console.log('setProps result:', visible); },
      getFieldsValue: () => {
        return {
          age: 66,  // 满足
        };
      },
      name: 'what',
    });
    
    expect(format(results, 1)).toEqual({});
  });
});