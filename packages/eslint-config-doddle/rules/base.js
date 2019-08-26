module.exports = {
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true,
    },
  },

  rules: {
    // 强制使用一致的缩进
    // http://eslint.cn/docs/rules/indent
    indent: [1, 2, { SwitchCase: 1 }],

    // 不强制使用一致的换行符风格
    // http://eslint.cn/docs/rules/linebreak-style
    'linebreak-style': 0,

    // https://eslint.org/docs/rules/operator-linebreak
    // The default configuration is "after", { "overrides": { "?": "before", ":": "before" } }
    'operator-linebreak': ['error', 'after'],

    // 强制行的最大长度
    // http://eslint.cn/docs/rules/max-len
    'max-len': [2, 120],

    // 箭头函数允许三元表达式不使用大括号
    // http://eslint.cn/docs/rules/no-confusing-arrow
    'no-confusing-arrow': 0,

    // 不强制使用'==='
    // http://eslint.cn/docs/rules/eqeqeq
    // 'eqeqeq': 0,

    // 禁止未使用过的表达式
    // http://eslint.cn/docs/rules/no-unused-expressions
    'no-unused-expressions': [2, { allowShortCircuit: true }],

    // 允许在返回语句中赋值
    // http://eslint.cn/docs/rules/no-return-assign
    'no-return-assign': 0,

    // 允许使用局部require
    //http://eslint.cn/docs/rules/global-require
    'global-require': 0,

    // 当最后一个元素或属性与闭括号 ] 或 } 在 不同的行时，允许（但不要求）使用拖尾逗号；当在 同一行时，禁止使用拖尾逗号
    // http://eslint.cn/docs/rules/comma-dangle
    'comma-dangle': [2, 'only-multiline'],

    // 箭头函数体只有一个参数时，可以省略圆括号
    // http://eslint.cn/docs/rules/arrow-parens
    'arrow-parens': [2, 'as-needed', { requireForBlockBody: true }],

    // 允许变量声明覆盖外层作用域的变量
    // http://eslint.cn/docs/rules/no-shadow
    'no-shadow': 0,

    // 允许对参数的任何属性的修改
    // http://eslint.cn/docs/rules/no-param-reassign
    'no-param-reassign': [2, { props: false }],

    // 允许所有的 key 和 value 在同一行
    // http://eslint.cn/docs/rules/object-property-newline
    'object-property-newline': [2, { allowMultiplePropertiesPerLine: true }],

    // 允许标识符中有悬空下划线
    // http://eslint.cn/docs/rules/no-underscore-dangle
    'no-underscore-dangle': 0,

    // 允许payload参数通过lint，开启 ignoreRestSiblings
    // http://eslint.cn/docs/rules/no-unused-vars
    'no-unused-vars': [
      2,
      { argsIgnorePattern: '^payload', ignoreRestSiblings: true },
    ],

    // 不强制对象换行
    // https://eslint.org/docs/rules/object-curly-newline
    'object-curly-newline': 0,
  },
};
