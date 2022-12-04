import Config from '@gem-mine/webpack-chain';
import Webpack from 'webpack';
import chalk from 'chalk';
import { genConfig } from './config';
import { formatWebpackMessages } from './const/utils';
import { EnvsParams, FastConfig, ModeEnum } from './const/interface';
import { startServer } from './server/start';
interface Props {
	envs: EnvsParams;
	cwd: string
}

export class Bundler {
	props: Props;
	configs: any;
	timeRecord = {
		start: 0,
		setStart() {
			this.start = Date.now();
		},
		getTime() {
			return ((Date.now() - this.start) / 1000).toFixed(2) + 's';
		},
	};

	constructor(props: Props) {
		this.props = props;
	}

	// 初始化通用配置
	async init(configOpts: any = {}) {
		const {
			/* 这是一个内部流转标识，后面考虑换个位置 */
			_typeIsMicroApp,
			/* 下面的配置是构建器层的 */
			chainConfig,
			serverConfig = {},
			/* 下面的配置是应用层的 */
			page,
			pages,
			appType,
			webpack = {},
			...others
		} = configOpts;
		
		const { devServer = {} } = webpack as FastConfig['webpack'];

		// 对devserver 做一个快合;
		(webpack as FastConfig['webpack']).devServer = Object.assign(serverConfig, devServer);
		const initConfig = {
			// isLocal: true,
			env: process.env.NODE_ENV as ModeEnum,
			envs: this.props.envs,
			config: {
				...others,
				// 对老的微应用配置进行兼容
				pages: pages || page,
				appType,
				isMicroApp: _typeIsMicroApp,
				...webpack,
			},
		};
		
		let chain = await genConfig(initConfig); 

		// 构建器层
		if (chainConfig && typeof chainConfig === 'function') {
			chain = await chainConfig(chain, initConfig);
		}

		// 应用层，个别应用自定义配置复制会有用到
		const appChainConfig = initConfig.config.configApi;
		if (appChainConfig) {
			chain = await appChainConfig(chain, initConfig);
		}
		
		return {
			chain,
			initConfig,
		};
	}

	/**
	 * 作用：一个纯函数，根据入参，生成一份wepack config配置
	 * @param configOpts 
	 * @returns config Map
	 */
	async getConfig(config) {
		// preset 传入的
		const { chain, initConfig } = await this.init(config);

		let finalConfig = chain.toConfig();

		const projectDefineConfig = initConfig.config.config;
		if (projectDefineConfig) {
			finalConfig = await projectDefineConfig(finalConfig)
		}

    this.configs = finalConfig;
  }

	// 正式环境，开启构建;
	// 正式环境，开启构建;
	build() {
		const compiler = this.createCompiler(this.configs);
		const runProcess = new Promise((resolve, reject) => {
			compiler.run((err, stats) => {
				let messages;
				if (err) {
					if (!err.message) {
						return reject(err);
					}
					messages = formatWebpackMessages({
						errors: [err.message],
						warnings: [],
					});
				} else {
					messages = formatWebpackMessages(
						stats.toJson({ all: false, warnings: true, errors: false })
					);
				}
				if (messages.errors.length) {
					if (messages.errors.length > 1) {
						messages.errors.length = 1;
					}
					return reject(new Error(messages.errors.join('\n\n')));
				}
	
				return resolve({
					stats,
					// previousFileSizes,
					warnings: messages.warnings,
				});
			});
		});

		runProcess.then(({ warnings }: any) => {
			if (warnings.length) {
				console.log(chalk.yellow('Compiled with warnings.\n'));
				console.log(warnings.join('\n\n'));
				console.log(
					'\nSearch for the ' +
						chalk.underline(chalk.yellow('keywords')) +
						' to learn more about each warning.'
				);
				console.log();
			} else {
				console.log(chalk.green('Compiled successfully.\n'));
			}
		})
		.catch(err => {
			if (err && err.message) {
				console.log(err.message);
				console.log('----------可参考文档，对问题进行排查：');
				console.log('https://yuque.antfin-inc.com/alsc-sfe/tz2aqe/eoem1y');
			}
			process.exit(1);
		});
	}

	// 开发环境，开启构建并启动服务器;
	async start(serverConfig?: any) {
		const compiler = this.createCompiler(this.configs);
		// 默认取第一个：
		const _serverConfig = serverConfig || this.configs.devServer;
		const projectHost = _serverConfig?.host || 'localhost';
		const server = startServer(this.configs, compiler, projectHost);
		server.start();
	}

	// 创建编译器
	createCompiler(configList) {
		let _configs = configList;
		if (!Array.isArray(configList)) {
			_configs = [configList];
		}
		let compiler;
		this.timeRecord.setStart();
		try {		
			compiler = Webpack(_configs);
		} catch (err) {
			console.error(err);
			console.log();

			console.log(chalk.red('Failed to compile.'));
			console.log();
			process.exit(1);
		}
		
		compiler.hooks.invalid.tap('invalid', () => {
			this.timeRecord.setStart();
			console.log('Compiling...');
		});
	
		compiler.hooks.done.tap('done', async stats => {
			// process.send({ type: 'TIME_RECORD', payload: {
			// 	code: 'build_done',
			// 	lastCode: 'build_start',
			// 	title: 'this build compiled in: '
			// }});
			const statsData = stats.toJson({
				all: false,
				warnings: true,
				errors: true,
			});
	
			const messages = formatWebpackMessages(statsData);
	
			if (messages.errors.length) {
				if (messages.errors.length > 1) {
					messages.errors.length = 1;
				}
				console.log(chalk.red('Failed to compile.\n'));
				console.log(messages.errors.join('\n\n'));
				return;
			}
	
			if (messages.warnings.length) {
				console.log(chalk.yellow('Compiled with warnings.\n'));
				console.log(messages.warnings.join('\n\n'));
	
				// Teach some ESLint tricks.
				console.log(
					'\nSearch for the ' +
						chalk.underline(chalk.yellow('keywords')) +
						' to learn more about each warning.'
				);
			}
		});
		return compiler;
	}
}