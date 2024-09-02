
import { isFunction } from '../../utils';
import { parseRules as parse } from '../parse';

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

const validatorMethod = (ctx) => (value, rule) => {
  if (ctx.data.personalFoulCount < 5) {
    // console.log('kkkk yes');
    
    return '函数校验出错';
  }
  // console.log('kkkk no');
}

const proPules = {
  caseItems: [{
    condition: [{
      methodType: "importMethod",
      name: "validatorMethod",
      type: "JSFunction"
    }],
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

const fdescribe = () => false;

describe('校验用例简单测试', () => {
  const format = (results, ok = 0) => results[ok].reduce((pre, cur) => {
    return Object.assign(pre, { result: cur.event.params.result });
  }, {}).result;

  test('校验条件 长度测试 ', async () => {
    const validator = parse({
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
    const message = '这里是必填';
    const validator = parse({
      fieldName: 'name',
      required: true,
      form: mockForm,
      rules: [],
      requiredMessage: message,
      context: {
        data: {
          personalFoulCount: 6,
          gameDuration: 40
        }
      },
    });
    
    expect(validator.length).toEqual(1);
    expect(validator[0].required).toEqual(true);
    expect(validator[0].message).toEqual(message);
  });

  test('校验条件 长度测试为 1, 函数校验', async () => {
    const validator = parse({
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
    const validator = parse({
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

describe('单例校验结果运行测试', () => {
  test('自定义条件, 校验不通过', async () => {
    const validators = parse({
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

    const { validator } = validators[0];

    const result = await validator().then((res) => {
      
      
      return '';
    }).catch((message) => message)
    
    expect(result).toEqual(rules.caseItems[0].result);
  });

  test('自定义条件, 校验通过', async () => {
    const validators = parse({
      fieldName: 'name',
      required: false,
      rules,
      form: mockForm,
      context: {
        data: {
          personalFoulCount: 6,
          gameDuration: 20
        }
      },
    });

    const { validator } = validators[0];

    const result = await validator().then((res) => {
      return '';
    }).catch((message) => message)
    
    expect(result).toEqual('');
  });

  test('函数条件, 校验不通过', async () => {
    const context = {
      data: {
        personalFoulCount: 3,
        gameDuration: 40
      }
    };
    const validators = parse({
      fieldName: 'name',
      required: false,
      rules: proPules,
      form: mockForm,
      context,
      methods: {
        validatorMethod: validatorMethod(context)
      }
    });

    const { validator } = validators[0];

    const result = await validator().then((res) => {
      
      
      return '';
    }).catch((message) => message)
    
    expect(result).toEqual('函数校验出错');
  });

  test('函数条件, 校验通过', async () => {
    const context = {
      data: {
        personalFoulCount: 7,
        gameDuration: 40
      }
    };
    const validators = parse({
      fieldName: 'name',
      required: false,
      rules: proPules,
      form: mockForm,
      context,
      methods: {
        validatorMethod: validatorMethod(context)
      }
    });

    const { validator } = validators[0];

    const result = await validator().then((res) => {
      
      return '';
    }).catch((message) => message)
    
    expect(result).toEqual('');
  });

  test('函数条件, 校验不通过', async () => {
    const context = {
      data: {
          personalFoulCount: 3,
          gameDuration: 40
        }
    }
    const validators = parse({
      fieldName: 'name',
      required: false,
      rules: proPules,
      form: mockForm,
      context: {
        data: {
          personalFoulCount: 3,
          gameDuration: 40
        }
      },
      methods: {
        validatorMethod: validatorMethod(context)
      }
    });

    const { validator } = validators[0];

    const result = await validator().then((res) => {
      
      
      return '';
    }).catch((message) => message)
    
    expect(result).toEqual('函数校验出错');
  });

  test('函数条件, 校验通过', async () => {
    const context = {
      data: {
        personalFoulCount: 7,
        gameDuration: 40
      }
    }
    const validators = parse({
      fieldName: 'name',
      required: false,
      rules: proPules,
      form: mockForm,
      context,
      methods: {
        validatorMethod: validatorMethod(context)
      }
    });

    const { validator } = validators[0];

    const result = await validator().then((res) => {
      
      return '';
    }).catch((message) => message)
    
    expect(result).toEqual('');
  });

});

describe('复合用例校验结果运行测试', () => {
  const scondition = condition.slice(0, 1);
  scondition.push({
    methodType: 'selfDefine',
    props: {
      condition: { key: 'select', value: 'greaterThanInclusive' },
      key: { key: 'select', value: 'age' },
      value: { key: 'input', value: 25 },
    }
  });
  const plusPules = {
    caseItems: [{
      result: '自定义规则校验出错',
      condition: scondition,
      logicType: 'and',
    }, {
      result: '自定义规则校验出错',
      condition,
      logicType: 'and',
    }, {
      condition: [{
        methodType: "importMethod",
        name: "validatorMethod",
        type: "JSFunction",
      }],
      result: '函数校验出错',
      logicType: 'and',
    }]
  };

  test('规则条件命中, 校验不通过', async () => {
    const context = {
      data: {
        personalFoulCount: 6,
        gameDuration: 40
      }
    };
    const validators = parse({
      fieldName: 'name',
      required: false,
      rules: plusPules,
      form: mockForm,
      context,
      methods: {
        validatorMethod: validatorMethod(context)
      }
    });

    const { validator } = validators[0];

    const result = await validator().then((res) => {
      
      
      return '';
    }).catch((message) => message)
    
    expect(result).toEqual(plusPules.caseItems[1].result);
  });

  test('函数条件命中, 校验不通过', async () => {
    const context = {
      data: {
        personalFoulCount: 3,
        gameDuration: 40
      }
    };
    const validators = parse({
      fieldName: 'name',
      required: false,
      rules: plusPules,
      form: mockForm,
      context,
      methods: {
        validatorMethod: validatorMethod(context)
      }
    });

    const { validator } = validators[0];

    const result = await validator().then((res) => {
      
      return '';
    }).catch((message) => message)
    
    expect(result).toEqual(plusPules.caseItems[2].result);
  });

  test('两个条件都命中, 但优先命中第一个，校验不通过', async () => {
    const validatorMethod = (ctx) => (value, rule) => {
      if (ctx.data.personalFoulCount < 8) {
        return '函数校验出错'
      }
    }
    const context = {
      data: {
        personalFoulCount: 7,
        gameDuration: 40
      }
    };
    const validators = parse({
      fieldName: 'name',
      required: false,
      rules: plusPules,
      form: mockForm,
      context,
      methods: {
        validatorMethod: validatorMethod(context)
      }
    });

    const { validator } = validators[0];

    const result = await validator().then((res) => {
      
      return '';
    }).catch((message) => message)
    
    expect(result).toEqual(plusPules.caseItems[1].result);
  });

  test('两个条件都通过, 校验通过', async () => {
    const context = {
      data: {
        personalFoulCount: 9,
        gameDuration: 32
      }
    };
    const validators = parse({
      fieldName: 'name',
      required: false,
      rules: proPules,
      form: mockForm,
      context: {
        data: {
          personalFoulCount: 9,
          gameDuration: 32
        }
      },
      methods: {
        validatorMethod: validatorMethod(context)
      }
    });

    const { validator } = validators[0];

    const result = await validator().then((res) => {
      return '';
    }).catch((message) => message)
    
    expect(result).toEqual('');
  });
});

describe('复合用例校验结果运行测试', () => {
  const rules = {
    caseItems: [{
      condition: [{
        methodType: "importMethod",
        name: "validatorMethod",
        type: "JSFunction",
      }],
      result: '函数校验出错',
      logicType: 'and',
    }, {
      condition: [{
        methodType: "system",
        name: "email",
        type: "JSFunction",
      }],
      result: '邮箱格式校验出错',
      logicType: 'and',
    }]
  };

  test('数量通过，邮箱校验条件不通过', async () => {
    const context = {
      data: {
        // 通过
        personalFoulCount: 9,
        gameDuration: 32
      }
    };

    const mockForm = {
      getFieldsValue: () => {
        return {
          email: 19,  // 满足
        };
      }
    };

    const validators = parse({
      fieldName: 'name',
      required: false,
      rules,
      form: mockForm,
      context,
      methods: {
        validatorMethod: validatorMethod(context)
      }
    });

    const { validator } = validators[0];

    const result = await validator({}, 'docemail').then((res) => {
      return '';
    }).catch((message) => message)
    
    expect(result).toEqual('邮箱格式不正确');
  });

  test('两个校验通过', async () => {
    const context = {
      data: {
        // 通过
        personalFoulCount: 9,
        gameDuration: 32
      }
    };

    const mockForm = {
      getFieldsValue: () => {
        return {
          email: 19,  // 满足
        };
      }
    };

    const validators = parse({
      fieldName: 'name',
      required: false,
      rules: rules,
      form: mockForm,
      context,
      methods: {
        validatorMethod: validatorMethod(context)
      }
    });

    const { validator } = validators[0];

    const result = await validator({}, 'doc@163.com').then((res) => {
      return '';
    }).catch((message) => message)
    
    expect(result).toEqual('');
  });
});
