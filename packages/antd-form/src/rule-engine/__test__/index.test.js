
import { isFunction } from '../../utils';
import parse, { parseRules } from '../parse';

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
      },
    }
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
});

describe('函数条件用例测试', () => {
  const format = ([succ, fail]) => `${succ.length}-${fail.length}`;
  // 同步 逻辑显示
  const syncVisibleMethod = (args) => {
    const { age } = args.getFieldsValue();
    if (age <= 18) {
      return true;
    }
    
    return false;
  }

  // 异步 逻辑显示
  const asyncVisibleMethod = async (args) => {
    return new Promise((res) => {
      setTimeout(() => {
        res(syncVisibleMethod(args));
      }, 500);
    })
  }
  
  const genOnChange = (changes) => parse({
    fieldName: 'name',
    changes,
    context: {
      data: {
        personalFoulCount: 4,
        gameDuration: 45
      },
    },
    methods: {
      syncVisibleMethod,
      asyncVisibleMethod,
    },
  });

  test('同步函数条件: 满足', async () => {
    const condition = [{
      methodType: 'selfDefine',
      props: {
        condition: { key: 'select', value: 'greaterThanInclusive' },
        key: { key: 'select', value: 'context.data.gameDuration' },
        value: { key: 'input', value: 40 },
      }
    }, {
      methodType: 'importMethod',
      name: 'syncVisibleMethod',
    }];
  
    const anyChanges = [{
      type: 'visible',
      caseItems: [{
        logicType: 'and',
        condition,
        result: true,
      }],
    }];

    const onChange = genOnChange(anyChanges);

    const statisfyExmp = await onChange({
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

    expect(format(statisfyExmp)).toEqual('1-0');
  });

  test('同步函数条件：不满足', async () => {
    const condition = [{
      methodType: 'selfDefine',
      props: {
        condition: { key: 'select', value: 'greaterThanInclusive' },
        key: { key: 'select', value: 'context.data.gameDuration' },
        value: { key: 'input', value: 40 },
      }
    }, {
      methodType: 'importMethod',
      name: 'syncVisibleMethod',
    }];
  
    const anyChanges = [{
      type: 'visible',
      caseItems: [{
        logicType: 'and',
        condition,
        result: true,
      }],
    }];

    const onChange = genOnChange(anyChanges);

    const statisfyExmp = await onChange({
      setVisible: (visible) => { console.log('setVisible result:', visible); },
      getFieldsValue: () => {
        return {
          age: 25,  // 不满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    }, format);

    expect(format(statisfyExmp)).toEqual('0-1');
  });

  test('异步函数条件: 满足', async () => {
    const condition = [{
      methodType: 'selfDefine',
      props: {
        condition: { key: 'select', value: 'greaterThanInclusive' },
        key: { key: 'select', value: 'context.data.gameDuration' },
        value: { key: 'input', value: 40 },
      }
    }, {
      methodType: 'importMethod',
      name: 'asyncVisibleMethod',
    }];
  
    const anyChanges = [{
      type: 'visible',
      caseItems: [{
        logicType: 'and',
        condition,
        result: true,
      }],
    }];

    const onChange = genOnChange(anyChanges);

    const statisfyExmp = await onChange({
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
    
    expect(format(statisfyExmp)).toEqual('1-0');
  });

  test('异步函数条件: 不满足', async () => {
    const condition = [{
      methodType: 'selfDefine',
      props: {
        condition: { key: 'select', value: 'greaterThanInclusive' },
        key: { key: 'select', value: 'context.data.gameDuration' },
        value: { key: 'input', value: 40 },
      }
    }, {
      methodType: 'importMethod',
      name: 'asyncVisibleMethod',
    }];
  
    const anyChanges = [{
      type: 'visible',
      caseItems: [{
        logicType: 'and',
        condition,
        result: true,
      }],
    }];

    const onChange = genOnChange(anyChanges);

    const statisfyExmp = await onChange({
      setVisible: (visible) => { console.log('setVisible result:', visible); },
      getFieldsValue: () => {
        return {
          age: 25,  // 不满足
        };
      },
      // setProps,
      // setChildProps,
      // setValue,
      name: 'what',
    }, format);
    
    expect(format(statisfyExmp)).toEqual('0-1');
  });
})


describe('校验用例简单测试', () => {
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
  
  const rules = {
    caseItems: [{
      result: '自定义规则校验出错',
      condition,
      logicType: 'and',
    }]
  };
  
  
  const mockForm = {
    getFieldsValue: () => {
      return {
        age: 19,  // 满足
      };
    }
  };
  test('校验条件为空 ', async () => {
    const validator = parseRules({
      fieldName: 'name',
      required: false,
      rules: {},
      form: mockForm,
      context: {
        data: {
          personalFoulCount: 6,
          gameDuration: 40
        }
      },
    });
    
    expect(validator.length).toEqual(0);
  });

  test('校验条件 长度测试为 1, 必填校验', async () => {
    const validator = parseRules({
      fieldName: 'name',
      required: true,
      form: mockForm,
      rules: [],
      context: {
        data: {
          personalFoulCount: 6,
          gameDuration: 40
        }
      },
    });
    
    expect(validator.length).toEqual(1);
    expect(validator[0].required).toEqual(true);
  });

  test('校验条件 长度测试为 1, 函数校验', async () => {
    const validator = parseRules({
      fieldName: 'name',
      required: false,
      rules,
      form: mockForm,
      context: {
        data: {
          personalFoulCount: 6,
          gameDuration: 40
        }
      },
    });
    
    expect(validator.length).toEqual(1);
    
    expect(isFunction(validator[0].validator)).toEqual(true);
  });

  test('校验条件 长度测试为 2', async () => {
    const validator = parseRules({
      fieldName: 'name',
      required: true,
      rules,
      form: mockForm,
      context: {
        data: {
          personalFoulCount: 6,
          gameDuration: 40
        }
      },
    });
    
    expect(validator.length).toEqual(2);
  });

});

describe('校验用例简单测试', () => {
  test('实际用例测试 ', () => {
    const demo = {
      "change": [
          {
              "type": "props",
              "valueChangeType": "importMethod",
              "caseItems": [
                  {
                      "logicType": "and",
                      "condition": [
                          {
                              "methodType": "importMethod",
                              "name": "getMultiDeviceOrderingControlOptions",
                              method: () => 1,
                          }
                      ]
                  }
              ]
          },
          {
              "type": "value",
              "valueChangeType": "selfDefine",
              "caseItems": []
          },
          {
              "type": "visible",
              "caseItems": [
                  {
                      "condition": []
                  }
              ]
          },
          {
              "type": "childProps",
              "valueChangeType": "selfDefine",
              "caseItems": []
          }
      ],
      "deps": [
          "businessType"
      ],
      "changeValidate": false
    };

    const anyOnChange = parse({
      fieldName: 'name',
      changes: demo.change,
      context: {
        data: {
          personalFoulCount: 4,
          gameDuration: 35
        }
      },
    });

    expect(isFunction(anyOnChange)).toEqual(true);
  })
});

