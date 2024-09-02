
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
    type: 'disable',
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
      setDisable: (disable) => { console.log('setDisable result:', disable); },
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
      setDisable: (disable) => { console.log('setDisable result:', disable); },
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
    type: 'disable',
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
      setDisable: (disable) => { console.log('setDisable result:', disable); },
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
      setDisable: (disable) => { console.log('setDisable result:', disable); },
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
});
