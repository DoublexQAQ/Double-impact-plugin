import fs from 'node:fs';
import path from 'path';
import chalk from 'chalk';

const logger = global.logger || console;
const pluginName = 'Double-impact-plugin';
const pluginPath = process.cwd() + '/plugins/' + pluginName;

// ASCII 图案加载日志
logger.info(`
頂頂頂頂頂頂頂頂頂　頂頂頂頂頂頂頂頂頂
頂頂頂頂頂頂頂　　　　　頂頂　　　　　　
　　　頂頂　　　頂頂頂頂頂頂頂頂頂頂頂頂
　　　頂頂　　　頂頂頂頂頂頂頂頂頂頂頂
　　　頂頂　　　頂頂　　　　　　　頂頂
　　　頂頂　　　頂頂　　頂頂頂　　頂頂
　　　頂頂　　　頂頂　　頂頂頂　　頂頂
　　　頂頂　　　頂頂　　頂頂頂　　頂頂
　　　頂頂　　　頂頂　　頂頂頂　　頂頂
　　　頂頂　　　　　　　頂頂頂　　
　　　頂頂　　　　　　頂頂　頂頂　頂頂
　頂頂頂頂　　　頂頂頂頂頂　頂頂頂頂頂
　頂頂頂頂　　　頂頂頂頂　　　頂頂頂頂
`);
logger.info('开始Double插件初始化');

// 确保目录存在
const dirs = [
  `./plugins/${pluginName}/config`,
  `./plugins/${pluginName}/def_config`,
  `./plugins/${pluginName}/data/impact`,
  `./plugins/${pluginName}/app`,
  `./plugins/${pluginName}/components`
];

// 创建目录
for (let dir of dirs) {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`创建目录: ${dir}`);
    } catch (err) {
      logger.error(`创建目录失败: ${dir}`, err);
    }
  }
}

// 复制默认配置
function copyDefaultConfig() {
  const configPath = `./plugins/${pluginName}/config/impact.yaml`;
  const defaultPath = `./plugins/${pluginName}/def_config/impact.yaml`;
  
  if (!fs.existsSync(configPath) && fs.existsSync(defaultPath)) {
    try {
      fs.copyFileSync(defaultPath, configPath);
      logger.info('已复制默认配置文件');
    } catch (err) {
      logger.error('复制配置文件失败', err);
    }
  }
}

copyDefaultConfig();

let apps = {};

// 加载功能模块
try {
  const appDir = `./plugins/${pluginName}/app`;
  const files = fs.readdirSync(appDir).filter(file => file.endsWith('.js'));
  let ret = [];

  files.forEach((file) => {
    ret.push(import(`./app/${file}`));
  });

  ret = await Promise.allSettled(ret);

  for (let i in files) {
    let name = files[i].replace('.js', '');
    if (ret[i].status != 'fulfilled') {
      logger.error(`载入插件错误：${logger.red(name)}`);
      logger.error(ret[i].reason);
      continue;
    }
    apps[name] = ret[i].value[Object.keys(ret[i].value)[0]];
  }

  logger.info('Double插件初始化完成');
  logger.info(`~\t${chalk.green('Double交流群')}${'  '}${chalk.underline('563079037')}\t~`);
  logger.info(logger.red('~~~~~~~~~~~~~~~~~~~~'));

} catch (err) {
  logger.error('加载插件失败', err);
}

export { apps };
