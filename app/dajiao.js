import plugin from '../../../lib/plugins/plugin.js';
import ImpactCore from './impact.js';
import fs from 'fs';
import YAML from 'yaml';
import path from 'path';
import logger from '../../../lib/utils/logger.js';

export class Dajiao extends plugin {
  constructor() {
    super({
      name: "打胶功能",
      event: "message",
      rule: [
        { reg: "^#?(导管子|打胶|开导)$", fnc: "handleDajiao" }
      ]
    });
    this.impact = new ImpactCore();
  }

  async handleDajiao(e) {
    if (!e.group_id) return e.reply('该功能只能在群聊中使用哦~');

    // 初始化检查
    const valid = this.impact.validateGroupInitialized(e.group_id);
    if (!valid.valid) return e.reply(valid.message);

    // 获取群数据
    const groupData = this.impact.getGroupData(e.group_id);
    if (!groupData.enabled) {
      return e.reply('本群未开启淫趴功能');
    }

    // 获取用户数据
    const userData = this.impact.getUserData(e.user_id);

    try {
      const filePath = path.join(
        process.cwd(), 
        'plugins/Double-impact-plugin', 
        'data', 
        'groups', 
        `${e.group_id}.json`
      );
      let data = JSON.parse(fs.readFileSync(filePath));

      if (!data.enabled) {
        return e.reply('本群未开启淫趴功能');
      }

      // 初始化用户数据
      if (!data.data[e.user_id]) {
        data.data[e.user_id] = {
          long: yaml.long,
          inject: 0,
          be_inject: 0,
          cd_daoguan: 0,
          dajiaocount: 0
        };
      }

      const player = data.data[e.user_id];
      const now = Date.now();

      // 检查CD
      if (player.cd_daoguan > now) {
        const remainTime = Math.ceil((player.cd_daoguan - now) / 1000);
        return e.reply(`你已经软了，导不动了，距离你恢复还有${remainTime}秒`);
      }

      // 设置CD
      player.cd_daoguan = now + yaml.cd_daoguan * 1000;

      // 计算增长
      const growth = Math.random() * (yaml.daoguan_height - yaml.daoguan_low) + yaml.daoguan_low;
      player.long += growth;
      player.dajiaocount = (player.dajiaocount || 0) + 1;

      // 保存数据
      fs.writeFileSync(filePath, JSON.stringify(data));

      // 发送消息
      const msg = [
        `导管成功了，你的牛牛很满意~\n牛牛努力生长了${growth.toFixed(2)}cm\n你的牛牛一共有${player.long.toFixed(2)}cm了`,
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`)
      ];
      return e.reply(msg);

    } catch (err) {
      logger.error(`[打胶功能] 群${e.group_id} 用户${e.user_id} 操作异常`, err);
      await e.reply([
        '打胶过程中发生意外，请联系管理员',
        segment.image('https://xxx/error.png')
      ]);
      return true;
    }
  }
} 