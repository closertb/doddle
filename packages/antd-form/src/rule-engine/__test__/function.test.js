
import parse from '../parse';

describe('函数混合用例测试', () => {

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
      methodType: 'importMethod',
      name: 'testVisible',
      method: () => true
    }];

  const format = ([succ, fail]) => `${succ.length}-${fail.length}`;

  test('all 满足条件， 函数返回true', async () => {

    const methodCondition = [...condition];

    const allChanges = [{
      type: 'visible',
      caseItems: [{
        logicType: 'and',
        condition: methodCondition,
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
      methods: {
        testVisible: () => true
      },
    });

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

  test('all 函数不满足条件， 返回false', async () => {

    const methodCondition = [...condition];
    methodCondition[2] = {
      methodType: 'importMethod',
      name: 'testVisible',
    };

    const allChanges = [{
      type: 'visible',
      caseItems: [{
        logicType: 'and',
        condition: methodCondition,
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
      methods: {
        testVisible: () => false
      },
    });

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
    expect(format(results)).toEqual('0-1');
  });
});
