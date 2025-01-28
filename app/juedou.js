import plugin from '../../../lib/plugins/plugin.js';
import ImpactCore from './impact.js';
import fs from 'fs';
import path from 'path';

export class Juedou extends plugin {
  constructor() {
    super({
      name: "决斗功能",
      event: "message",
      rule: [
        { reg: "^#?决斗\\s*<@!(\\d+)>$", fnc: "handleJuedou" }
      ]
    });
    this.impact = new ImpactCore();
  }

  async handleJuedou(e) {
    // 使用 this.impact 调用核心方法
    const valid = this.impact.validateGroupInitialized(e.group_id);
    if (!valid.valid) return e.reply(valid.message);
    
    if (!this.validateEvent(e)) return;

    try {
      const groupData = this.getGroupData(e.group_id);
      if (!groupData.enabled) {
        return e.reply('本群未开启淫趴功能');
      }

      const [_, targetId] = e.msg.match(/<@!?(\d+)>/);
      const userData = this.getUserData(e.user_id);
      const targetData = this.getUserData(targetId);

      // 获取对手ID
      if (targetId === e.user_id) {
        return e.reply('不能跟自己击剑哦~');
      }

      // 检查双方是否有牛牛
      if (!targetData.data[targetId]) {
        return e.reply('对方连牛牛都没有，是个人妖，你怎么和ta决斗？');
      }
      if (!userData.data[e.user_id]) {
        return e.reply('你都没有牛牛，搞啥呢？发送【#创建牛牛】去长一根吧');
      }

      // 检查贞操锁
      if (userData.data[e.user_id].chastityLock) {
        return e.reply('你已经被贞操锁锁住了，无法进行决斗！');
      }

      // 检查CD
      if (userData.data[e.user_id].cd_juedou > Date.now()) {
        const remainTime = Math.ceil((userData.data[e.user_id].cd_juedou - Date.now()) / 1000);
        return e.reply(`软男！你已经被榨干了，距离你恢复还有${remainTime}秒`);
      }

      // 设置CD
      userData.data[e.user_id].cd_juedou = Date.now() + this.config.cd_juedou * 1000;

      // 决斗逻辑
      const winner = Math.random() > 0.5 ? e.user_id : targetId;
      const loser = winner === e.user_id ? targetId : e.user_id;

      // 计算增减
      const growth = Math.random() * (this.config.juedou_height - this.config.juedou_low) + this.config.juedou_low;
      const loss = growth * this.config.juedou_mult;

      // 更新数据
      userData.data[winner].long += growth;
      targetData.data[loser].long -= loss;

      // 保存数据
      fs.writeFileSync(path.join(process.cwd(), 'plugins/Double-impact-plugin', 'data', 'impact', `${e.group_id}.json`), JSON.stringify(groupData));
      fs.writeFileSync(this.getUserFilePath(e.user_id), JSON.stringify(userData));
      fs.writeFileSync(this.getUserFilePath(targetId), JSON.stringify(targetData));

      // 发送结果
      if (winner === e.user_id) {
        await e.reply([
          `对决成功了哦~\n你的牛牛增长了${growth.toFixed(2)}cm，但是对方因为不堪受辱，牛牛缩小了${loss.toFixed(2)}cm\n你的牛牛现在是${userData.data[e.user_id].long.toFixed(2)}cm`,
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${targetId}`)
        ]);
      } else {
        await e.reply([
          `对决失败了，你个废材！\n你的牛牛不堪受辱缩小了${loss.toFixed(2)}cm，但是对方洋洋得意，Ta的牛牛当着你的面增长了${growth.toFixed(2)}cm。\n你的牛牛现在是${userData.data[e.user_id].long.toFixed(2)}cm`,
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${targetId}`)
        ]);
      }

    } catch (err) {
      logger.error(`[决斗功能] 群${e.group_id} 用户${e.user_id} 操作异常`, err);
      await e.reply([
        '决斗过程中发生意外，请联系管理员',
        segment.image('https://xxx/error.png')
      ]);
      return true;
    }
    return true;
  }

  getGroupData(groupId) {
    const filePath = path.join(process.cwd(), 'plugins/Double-impact-plugin', 'data', 'impact', `${groupId}.json`);
    return JSON.parse(fs.readFileSync(filePath));
  }

  getUserData(userId) {
    const filePath = this.getUserFilePath(userId);
    try {
      return JSON.parse(fs.readFileSync(filePath));
    } catch {
      return this.createUserData(userId);
    }
  }

  createUserData(userId) {
    const baseData = {
      userId,
      length: this.config.base_length || 12,
      cd: {},
      stats: {
        battles: 0,
        wins: 0
      }
    };
    fs.writeFileSync(this.getUserFilePath(userId), JSON.stringify(baseData));
    return baseData;
  }
} 