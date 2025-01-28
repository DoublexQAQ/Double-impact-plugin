import fs from 'node:fs';
import path from 'path';
import chalk from 'chalk';

const logger = global.logger || console;
const pluginName = 'Double-impact-plugin';
const pluginPath = path.join(process.cwd(), 'plugins/Double-impact-plugin');

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

// 修改模块加载方式
const modules = {
  'impact': 'ImpactCore',    // 核心模块
  'juedou': 'Juedou',       // 决斗功能
  'dajiao': 'Dajiao',       // 打胶功能
  'phb': 'Phb',            // 排行榜
  'zigong': 'Zigong',      // 自宫功能
  'chastity': 'Chastity',  // 贞操锁
  'baopi': 'Baopi',        // 割包皮
  'help': 'Help',          // 帮助功能
  'theme': 'Theme'         // 主题功能
};

const apps = {};
for (const [file, className] of Object.entries(modules)) {
  try {
    console.log(`正在加载: ${file}.js`);
    const module = await import(`./app/${file}.js`);
    console.log(`找到类: ${className}`, Object.keys(module));
    apps[className] = module[className] || module.default;
    logger.info(`成功加载模块：${chalk.green(className)}`);
  } catch (err) {
    console.error('加载失败详情:', err.stack);
    logger.error(`加载模块 ${file} 失败:`, err);
  }
}

logger.info('Double插件初始化完成');
logger.info(`~\t${chalk.green('Double交流群')}${'  '}${chalk.underline('563079037')}\t~`);
logger.info(chalk.red('~~~~~~~~~~~~~~~~~~~~'));

export { apps };
