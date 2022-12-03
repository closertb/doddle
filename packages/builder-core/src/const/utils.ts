import chalk from 'chalk';
/* eslint-disable guard-for-in */
const ENV_SHOULD_PASS = ['NODE_ENV', 'PUBLISH_ENV'];

export function genProcessEnvs(opts: { define: any }) {
  const env = {};
  Object.keys(process.env).forEach((key) => {
    if (ENV_SHOULD_PASS.includes(key)) {
      env[key] = process.env[key];
    }
  });

  for (const key in env) {
    env[key] = JSON.stringify(env[key]);
  }

  if (opts.define) {
    for (const key in opts.define) {
      env[key] = JSON.stringify(opts.define[key]);
    }
  }

  return {
    'process.env': env,
  };
}

const friendlySyntaxErrorLabel = 'Syntax error:';

function isLikelyASyntaxError(message) {
  return message.indexOf(friendlySyntaxErrorLabel) !== -1;
}

function formatMessage({ message = '' }) {
  let lines = message.split('\n');

  lines = lines.filter(line => !/Module [A-z ]+\(from/.test(line));

  lines = lines.map(line => {
    const parsingError = /Line (\d+):(?:(\d+):)?\s*Parsing error: (.+)$/.exec(
      line
    );
    if (!parsingError) {
      return line;
    }
    const [, errorLine, errorColumn, errorMessage] = parsingError;
    return `${friendlySyntaxErrorLabel} ${errorMessage} (${errorLine}:${errorColumn})`;
  });

  message = lines.join('\n');
  message = message.replace(
    /SyntaxError\s+\((\d+):(\d+)\)\s*(.+?)\n/g,
    `${friendlySyntaxErrorLabel} $3 ($1:$2)\n`
  );

  message = message.replace(/Line (\d+):\d+:/g, 'Line $1:');
  message = message.replace(
    /^.*export '(.+?)' was not found in '(.+?)'.*$/gm,
    "Attempted import error: '$1' is not exported from '$2'."
  );
  message = message.replace(
    /^.*export 'default' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
    "Attempted import error: '$2' does not contain a default export (imported as '$1')."
  );
  message = message.replace(
    /^.*export '(.+?)' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
    "Attempted import error: '$1' is not exported from '$3' (imported as '$2')."
  );
  lines = message.split('\n');

  if (lines.length > 2 && lines[1].trim() === '') {
    lines.splice(1, 1);
  }
  lines[0] = lines[0].replace(/^(.*) \d+:\d+-\d+$/, '$1');

  if (lines[1] && lines[1].indexOf('Module not found: ') === 0) {
    lines = [
      lines[0],
      lines[1]
        .replace('Error: ', '')
        .replace('Module not found: Cannot find file:', 'Cannot find file:'),
    ];
  }

  if (lines[1] && lines[1].match(/Cannot find module.+node-sass/)) {
    lines[1] = 'To import Sass files, you first need to install node-sass.\n';
    lines[1] +=
      'Run `npm install node-sass` or `yarn add node-sass` inside your workspace.';
  }

  lines[0] = chalk.inverse(lines[0]);

  message = lines.join('\n');
  message = message.replace(
    /^\s*at\s((?!webpack:).)*:\d+:\d+[\s)]*(\n|$)/gm,
    ''
  ); // at ... ...:x:y
  message = message.replace(/^\s*at\s<anonymous>(\n|$)/gm, ''); // at <anonymous>
  lines = message.split('\n');

  lines = lines.filter(
    (line, index, arr) =>
      index === 0 || line.trim() !== '' || line.trim() !== arr[index - 1].trim()
  );

  message = lines.join('\n');
  return message.trim();
}

export function formatWebpackMessages(json) {  
  const formattedErrors = (json.errors || []).map(function(message) {
    return formatMessage(message);
  });
  const formattedWarnings = (json.warnings || []).map(function(message) {
    return formatMessage(message);
  });
  const result = { errors: formattedErrors, warnings: formattedWarnings };
  if (result.errors.some(isLikelyASyntaxError)) {
    // If there are any syntax errors, show just them.
    result.errors = result.errors.filter(isLikelyASyntaxError);
  }
  return result;
}