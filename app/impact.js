import plugin from '../../../lib/plugins/plugin.js';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';

const logger = global.logger || console;

export class ImpactCore extends plugin {
  constructor() {
    super({
      name: "Double-QQ淫趴",
      dsc: "Double-QQ群淫趴小游戏",
      event: "message",
      priority: 1,
      rule: [
        { reg: "^#?淫趴初始化$", fnc: "initGroup" },
        { reg: "^#?(开启|关闭)淫趴$", fnc: "toggleGroup" },
        { reg: "^#?(淫趴|银趴)状态$", fnc: "groupStatus" }
      ]
    });

    this.pluginPath = path.join(process.cwd(), 'plugins/Double-impact-plugin');
    this.config = this.loadConfig();
    this.ensureDirs();
  }

  // 初始化必要目录
  ensureDirs() {
    const requiredDirs = [
      'config',
      'def_config', 
      'data/groups',
      'data/users'
    ];

    requiredDirs.forEach(dir => {
      const fullPath = path.join(this.pluginPath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  // 加载配置文件
  loadConfig() {
    try {
      const configPath = path.join(this.pluginPath, 'config/impact.yaml');
      const defaultPath = path.join(this.pluginPath, 'def_config/impact.yaml');
      
      if (!fs.existsSync(configPath) && fs.existsSync(defaultPath)) {
        fs.copyFileSync(defaultPath, configPath);
      }
      
      return YAML.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (err) {
      logger.error('[Double插件] 配置文件加载失败', err);
      return {};
    }
  }

  // 初始化群组
  async initGroup(e) {
    if (!this.validateEvent(e)) return;

    const groupFile = this.getGroupFilePath(e.group_id);
    
    try {
      if (fs.existsSync(groupFile)) {
        await e.reply('本群已初始化过淫趴');
        return true;
      }

      const initialData = {
        group_id: e.group_id,
        enabled: false,
        created_at: Date.now(),
        users: {}
      };

      fs.writeFileSync(groupFile, JSON.stringify(initialData, null, 2));
      await e.reply(`群 ${e.group_id} 淫趴初始化成功！`);
    } catch (err) {
      logger.error('[Double插件] 群初始化失败', err);
      await e.reply('初始化失败，请检查日志');
    }
    return true;
  }

  // 切换群组状态
  async toggleGroup(e) {
    if (!this.validateEvent(e)) return;

    const groupFile = this.getGroupFilePath(e.group_id);
    
    try {
      const groupData = JSON.parse(fs.readFileSync(groupFile));
      const isEnable = e.msg.includes('开启');
      
      groupData.enabled = isEnable;
      fs.writeFileSync(groupFile, JSON.stringify(groupData, null, 2));
      
      await e.reply(isEnable ? '🎉 淫趴已开启' : '🛑 淫趴已关闭');
    } catch (err) {
      logger.error('[Double插件] 状态切换失败', err);
      await e.reply('操作失败，请检查群是否已初始化');
    }
    return true;
  }

  // 获取群组文件路径
  getGroupFilePath(groupId) {
    return path.join(this.pluginPath, `data/groups/${groupId}.json`);
  }

  // 获取用户文件路径
  getUserFilePath(userId) {
    return path.join(this.pluginPath, `data/users/${userId}.json`);
  }

  // 验证事件对象
  validateEvent(e) {
    if (!e?.isGroup) {
      e?.reply?.('该功能只能在群聊中使用');
      return false;
    }
    return true;
  }
}

export { ImpactCore as Double_impact };