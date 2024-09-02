
import parse from '../parse';

describe('正式用例测试', () => {

  // test('环境测试：', () => {
  //   // 先做环境变量替换；
  //   // const text = replaceContent(str, reg, context)
  //   const text = 'demo'
  //   expect(text).toEqual(`demo`);
  // });
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
    type: 'visible',
    caseItems: [{
      logicType: 'and',
      condition,
      result: true,
    }],
  }];

  const onChange = parse({
    fieldName: 'name',
    changes: allChanges,
    context: {
      data: {
        personalFoulCount: 6,
        gameDuration: 40
      }
    },
  });

  const format = ([succ, fail]) => `${succ.length}-${fail.length}`;

  test('入门用法测试：all 满足条件', async () => {

  
    const results = await onChange({
      setVisible: (visible) => { console.log('setVisible result:', visible); },
      getFieldsValue: () => {
        return {
          age: 19,  // 满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });
    expect(format(results)).toEqual('1-0');
  });

  test('入门用法测试：all 不满足条件', async () => {
    const notStatisfyExmp = await onChange({
      setVisible: (visible) => { console.log('setVisible result:', visible); },
      getFieldsValue: () => {
        return {
          age: 15,  // 不满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    }, format);
    expect(format(notStatisfyExmp)).toEqual('0-1');
  });

  const anyChanges = [{
    type: 'visible',
    caseItems: [{
      logicType: 'or',
      condition,
      result: true,
    }],
  }];

  const anyOnChange = parse({
    fieldName: 'name',
    changes: anyChanges,
    context: {
      data: {
        personalFoulCount: 4,
        gameDuration: 35
      }
    },
  });

  test('入门用法测试：any 满足条件', async () => {
    const results = await anyOnChange({
      setVisible: (visible) => { console.log('setVisible result:', visible); },
      getFieldsValue: () => {
        return {
          age: 19,  // 满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    });
    expect(format(results)).toEqual('1-0');
  });

  test('入门用法测试：any 不满足条件', async () => {
    const notStatisfyExmp = await onChange({
      setVisible: (visible) => { console.log('setVisible result:', visible); },
      getFieldsValue: () => {
        return {
          age: 15,  // 不满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    }, format);
    expect(format(notStatisfyExmp)).toEqual('0-1');
  });

  const arrayCondition = [{
    methodType: 'selfDefine',
    props: {
      condition: { key: 'select', value: 'arrayIn' },
      key: { key: 'select', value: 'context.data.ages' },
      value: { key: 'input', value: 40 },
    }
    }, {
      methodType: 'selfDefine',
      props: {
        condition: { key: 'select', value: 'arrayNotIn' },
        key: { key: 'select', value: 'context.data.ages' },
        value: { key: 'input', value: 99 },
      }
    }, {
      methodType: 'selfDefine',
      props: {
        condition: { key: 'select', value: 'arrayIn' },
        key: { key: 'select', value: 'age' },
        value: { key: 'input', value: 15 },
      }
    }];

  const arrayChanges = [{
    type: 'visible',
    caseItems: [{
      logicType: 'and',
      condition: arrayCondition,
      result: true,
    }],
  }];

  test('数组包含测试：满足条件', async () => {
    const onChange = parse({
      fieldName: 'name',
      changes: arrayChanges,
      context: {
        data: {
          ages: [40, 52],
          gameDuration: 40
        }
      },
    });
    const statisfyExmp = await onChange({
      setVisible: (visible) => { console.log('setVisible result:', visible); },
      getFieldsValue: () => {
        return {
          age: [15],  // 不满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    }, format);
    expect(format(statisfyExmp)).toEqual('1-0');
  });

  test('数据包含测试：不满足条件', async () => {
    const onChange = parse({
      fieldName: 'name',
      changes: arrayChanges,
      context: {
        data: {
          ages: [40, 99],
          gameDuration: 40
        }
      },
    });
    const notStatisfyExmp = await onChange({
      setVisible: (visible) => { console.log('setVisible result:', visible); },
      getFieldsValue: () => {
        return {
          age: [55],  // 不满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    }, format);
    expect(format(notStatisfyExmp)).toEqual('0-1');
  });

  test('数据包含测试：数据为 undefined 满足条件', async () => {
    const arrayCondition = [{
      methodType: 'selfDefine',
      props: {
        condition: { key: 'select', value: 'arrayIn' },
        key: { key: 'select', value: 'context.data.ages' },
        value: { key: 'input', value: 40 },
      }
      }, {
        methodType: 'selfDefine',
        props: {
          condition: { key: 'select', value: 'arrayNotIn' },
          key: { key: 'select', value: 'context.data.ages' },
          value: { key: 'input', value: 99 },
        }
      }, {
        methodType: 'selfDefine',
        props: {
          condition: { key: 'select', value: 'arrayNotIn' },
          key: { key: 'select', value: 'age' },
          value: { key: 'input', value: 35 },
        }
      }];
  
    const arrayChanges = [{
      type: 'visible',
      caseItems: [{
        logicType: 'and',
        condition: arrayCondition,
        result: true,
      }],
    }];
    const onChange = parse({
      fieldName: 'name',
      changes: arrayChanges,
      context: {
        data: {
          ages: [40, 89],
          gameDuration: 40
        }
      },
    });
    const statisfyExmp = await onChange({
      setVisible: (visible) => { console.log('setVisible result:', visible); },
      getFieldsValue: () => {
        return {
          age: undefined,  // 不满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    }, format);
    expect(format(statisfyExmp)).toEqual('1-0');
  });


  test('依赖项为NamePath数据测试： 满足条件', async () => {
    const arrayCondition = [{
      methodType: 'selfDefine',
      props: {
        condition: { key: 'select', value: 'arrayIn' },
        key: { key: 'select', value: 'context.data.ages' },
        value: { key: 'input', value: 40 },
      }
      }, {
        methodType: 'selfDefine',
        props: {
          condition: { key: 'select', value: 'arrayNotIn' },
          key: { key: 'select', value: 'context.data.ages' },
          value: { key: 'input', value: 99 },
        }
      }, {
        methodType: 'selfDefine',
        props: {
          condition: { key: 'select', value: 'equal' },
          key: { key: 'select', value: "[\"wrapper\", \"age\"]" },
          value: { key: 'input', value: 35 },
        }
      }];
  
    const arrayChanges = [{
      type: 'visible',
      caseItems: [{
        logicType: 'and',
        condition: arrayCondition,
        result: true,
      }],
    }];
    const onChange = parse({
      fieldName: 'name',
      changes: arrayChanges,
      context: {
        data: {
          ages: [40, 89],
          gameDuration: 40
        }
      },
    });
    const statisfyExmp = await onChange({
      setVisible: (visible) => { console.log('setVisible result:', visible); },
      getFieldsValue: () => {
        return {
          wrapper: {
            age: 35,
          }
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    }, format);
    expect(format(statisfyExmp)).toEqual('1-0');
  });
});
