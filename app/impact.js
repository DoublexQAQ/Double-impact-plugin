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
        { reg: "^#?(淫趴|银趴)状态$", fnc: "groupStatus" },
        { reg: "^#?创建牛牛$", fnc: "createNiuNiu" },
        { reg: "^#?我的牛牛$", fnc: "checkNiuNiu" }
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

  // 创建牛牛功能
  async createNiuNiu(e) {
    if (!this.validateEvent(e)) return;

    try {
      const groupFile = this.getGroupFilePath(e.group_id);
      if (!fs.existsSync(groupFile)) {
        return e.reply('本群尚未初始化，请管理员先发送【#淫趴初始化】');
      }

      const userFile = this.getUserFilePath(e.user_id);
      if (fs.existsSync(userFile)) {
        return e.reply('你已经拥有牛牛了，不要太贪心哦~');
      }

      // 初始化用户数据
      const userData = {
        userId: e.user_id,
        length: this.config.base_length || 12,
        inject: 0,
        be_inject: 0,
        cd: {
          daoguan: 0,
          juedou: 0
        },
        chastityLock: false,
        created_at: Date.now()
      };

      fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));
      await e.reply([
        `恭喜！你获得了一根${userData.length}cm的牛牛！`,
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`)
      ]);
    } catch (err) {
      logger.error('[创建牛牛] 失败', err);
      await e.reply('牛牛生成失败，请联系管理员');
    }
    return true;
  }

  // 查询牛牛状态
  async checkNiuNiu(e) {
    if (!this.validateEvent(e)) return;

    try {
      const userFile = this.getUserFilePath(e.user_id);
      if (!fs.existsSync(userFile)) {
        return e.reply('你还没有牛牛，发送【#创建牛牛】来获取吧~');
      }

      const userData = JSON.parse(fs.readFileSync(userFile));
      const status = [
        `🐮 牛牛状态 🐮`,
        `长度：${userData.length.toFixed(2)}cm`,
        `注射量：${userData.inject}ml`,
        `被注射量：${userData.be_inject}ml`,
        `贞操锁：${userData.chastityLock ? '已上锁' : '未上锁'}`
      ].join('\n');

      await e.reply([status, segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`)]);
    } catch (err) {
      logger.error('[查询牛牛] 失败', err);
      await e.reply('查询失败，请稍后再试');
    }
    return true;
  }

  // 在原有验证方法中增加初始化检查
  validateGroupInitialized(groupId) {
    const groupFile = this.getGroupFilePath(groupId);
    if (!fs.existsSync(groupFile)) {
      return { valid: false, message: '本群尚未初始化，请管理员先发送【#淫趴初始化】' };
    }
    return { valid: true };
  }
}

export { ImpactCore as Double_impact };