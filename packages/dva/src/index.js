import plugin from './plugin';
import { reduceToObject as reduce } from './util';

const defaultPlugins = [
  plugin.put,
  plugin.select,
  plugin.update,
  plugin.listen,
  plugin.loading,
];

const dvaHooks = [
  'onError',
  'onStateChange',
  'onAction',
  'onHmr',
  'onReducer',
  'onEffect',
  'extraReducers',
  'extraEnhancers',
  '_handleActions',
];

const singularize = key => {
  return key.endsWith('s') ? key.slice(0, -1) : key;
};

const noop = value => value;

const norNoop = fn => {
  return fn || noop;
};

export default function({ app, plugins: customPlugins }) {
  let plugins = defaultPlugins;
  if (customPlugins) {
    plugins = customPlugins;
  }

  const _use = app.use;
  const _model = app.model;

  app.use = plugin => {
    if (!plugins.includes(plugin)) {
      plugins.push(plugin);
    }
    // 过滤掉dvahooks之外的属性，以避免app.use时报错
    _use(reduce(dvaHooks, key => plugin[key]));
  };

  app.model = model => {
    _model(
      reduce(model, (origin, key) => {
        return plugins.reduce(
          (prev, plugin) => norNoop(plugin[singularize(key)])(prev),
          origin
        );
      })
    );
  };

  plugins.forEach(app.use);

  return app;
}

export { plugin };
