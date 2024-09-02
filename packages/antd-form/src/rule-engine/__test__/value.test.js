
import parse from '../parse';

describe('setValue 自定义条件用例测试', () => {
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

  const numberChanges = [{
    type: 'value',
    caseItems: [{
      logicType: 'and',
      condition,
      result: 0,
    }],
  }];

  const onChange = parse({
    fieldName: 'name',
    changes: numberChanges,
    context: {
      data: {
        personalFoulCount: 6,
        gameDuration: 40
      },
    },
  });

  const format = (results, ok = 0) => results[ok].reduce((pre, cur) => {
    return Object.assign(pre, { result: cur.event.params.result });
  }, {}).result;

  test('满足条件', async () => {
    const results = await onChange({
      setValue: (visible) => { console.log('setValue result:', visible); },
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
    
    expect(format(results, 0)).toEqual(0);
  });

  test('满足条件 设置字符串', async () => {
    const changes = [{
      type: 'value',
      caseItems: [{
        logicType: 'and',
        condition,
        result: 'test',
      }],
    }];
  
    const onChange = parse({
      fieldName: 'name',
      changes: changes,
      context: {
        data: {
          personalFoulCount: 6,
          gameDuration: 40
        }
      },
    });
    const results = await onChange({
      setValue: (visible) => { console.log('setValue result:', visible); },
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
    
    expect(format(results, 0)).toEqual('test');
  });

  test('满足条件 设置对象', async () => {
    const changes = [{
      type: 'value',
      caseItems: [{
        logicType: 'and',
        condition,
        result: { disable: true },
      }],
    }];
  
    const onChange = parse({
      fieldName: 'name',
      changes: changes,
      context: {
        data: {
          personalFoulCount: 6,
          gameDuration: 40
        }
      },
    });
    const results = await onChange({
      setValue: (visible) => { console.log('setValue result:', visible); },
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
    
    expect(format(results, 0)).toEqual({ disable: true });
  });

  test('不满足条件', async () => {
    const results = await onChange({
      setValue: (visible) => { console.log('setValue result:', visible); },
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

describe('setValue 函数联动用例测试', () => {

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
    return Object.assign(pre, { result: cur.calResult });
  }, {}).result;

  const allChanges = [{
    type: 'value',
    caseItems: [{
      logicType: 'and',
      condition: methodCondition,
    }],
  }];

  const testMethodProps = (args) => { 
    const { age } = args.getFieldsValue();

    if (age <= 1) {
      return 9;
    }

    if (age <= 3) {
      return 0;
    }

    if (age <= 5) {
      return '';
    }

    if (age <= 7) {
      return 'test';
    }

    if (age <= 9) {
      return false;
    }

    if (age <= 12) {
      return true;
    }

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
      },
    },
    methods: {
      testMethodProps,
    },
  });

  test('props 单case测试, 有返回值 9', async () => {
    const results = await onChange({
      isDeps: false,
      setValue: (visible) => { console.log('setValue result:', visible); },
      getFieldsValue: () => {
        return {
          age: 1,  // 满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });

    // console.log('kkkk', results[0]);
    
    expect(format(results, 0)).toEqual(9);
  });

  test('props 单case测试, 有返回值 0', async () => {
    const results = await onChange({
      isDeps: false,
      setValue: (visible) => { console.log('setValue result:', visible); },
      getFieldsValue: () => {
        return {
          age: 3,  // 满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });
    
    expect(format(results, 0)).toEqual(0);
  });

  test('props 单case测试, 有返回值 ""', async () => {
    const results = await onChange({
      isDeps: false,
      setValue: (visible) => { console.log('setValue result:', visible); },
      getFieldsValue: () => {
        return {
          age: 4,  // 满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });
    
    expect(format(results, 0)).toEqual('');
  });


  test('props 单case测试, 有返回值 test', async () => {
    const results = await onChange({
      isDeps: false,
      setValue: (visible) => { console.log('setValue result:', visible); },
      getFieldsValue: () => {
        return {
          age: 7,  // 满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });
    
    expect(format(results, 0)).toEqual('test');
  });

  test('props 单case测试, 有返回值 false', async () => {
    const results = await onChange({
      isDeps: false,
      setValue: (visible) => { console.log('setValue result:', visible); },
      getFieldsValue: () => {
        return {
          age: 8,  // 满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });
    
    expect(format(results, 0)).toEqual(false);
  });

  test('props 单case测试, 有返回值 true', async () => {
    const results = await onChange({
      isDeps: false,
      setValue: (visible) => { console.log('setValue result:', visible); },
      getFieldsValue: () => {
        return {
          age: 11,  // 满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });
    
    expect(format(results, 0)).toEqual(true);
  });

  test('props 单case测试, 有返回值 disable: true', async () => {
    const results = await onChange({
      isDeps: false,
      setValue: (visible) => { console.log('setValue result:', visible); },
      getFieldsValue: () => {
        return {
          age: 17,  // 满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });
    
    expect(format(results, 0)).toEqual({ disable: true });
  });

  test('props 单case测试, 有返回值 disable: false', async () => {
    const results = await onChange({
      isDeps: false,
      setValue: (visible) => { console.log('setValue result:', visible); },
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
    
    expect(format(results, 1)).toEqual();
  });
});