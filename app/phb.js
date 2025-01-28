import plugin from '../../../lib/plugins/plugin.js';
import ImpactCore from './impact.js';
import fs from 'fs';
import path from 'path';

export class Phb extends plugin {
  constructor() {
    super({
      name: "排行榜功能",
      event: "message",
      rule: [
        { reg: "^#?牛子排行榜$", fnc: "handleNiuNiuRank" },
        { reg: "^#?打胶排行榜$", fnc: "handleDajiaoRank" }
      ]
    });
    this.impact = new ImpactCore();
  }

  async handleNiuNiuRank(e) {
    if (!e.group_id) return e.reply('该功能只能在群聊中使用哦~');

    try {
      const filePath = path.join(
        process.cwd(), 
        'plugins/Double-impact-plugin', 
        'data', 
        'groups', 
        `${e.group_id}.json`
      );
      let data = JSON.parse(fs.readFileSync(filePath));

      if (data.cond == '0') {
        return e.reply('本群没有开启淫趴，请管理员发送【#开启淫趴】');
      }

      // 获取所有用户数据并排序
      const rankings = Object.entries(data.data)
        .map(([qq, userData]) => ({
          qq,
          long: userData.long || 0
        }))
        .sort((a, b) => b.long - a.long)
        .slice(0, 10); // 只取前10名

      if (rankings.length === 0) {
        return e.reply('还没有人有牛子，快来【#创建牛牛】吧！');
      }

      // 构建排行榜消息
      let msg = '『牛子排行榜』\n';
      msg += '———————\n';
      for (let i = 0; i < rankings.length; i++) {
        const rank = rankings[i];
        const rankIcon = i === 0 ? '👑' : `${i + 1}.`;
        msg += `${rankIcon} ${rank.qq}\n`;
        msg += `┗━ ${rank.long.toFixed(2)}cm\n`;
      }
      msg += '———————\n';
      msg += `共统计${Object.keys(data.data).length}个牛子`;

      return e.reply([
        msg,
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${rankings[0].qq}`) // 展示榜首头像
      ]);

    } catch (err) {
      return e.reply('本群还没有淫趴文件，请发送【#淫趴初始化】');
    }
  }

  async handleDajiaoRank(e) {
    if (!e.group_id) return e.reply('该功能只能在群聊中使用哦~');

    try {
      const filePath = path.join(
        process.cwd(), 
        'plugins/Double-impact-plugin', 
        'data', 
        'groups', 
        `${e.group_id}.json`
      );
      let data = JSON.parse(fs.readFileSync(filePath));

      if (data.cond == '0') {
        return e.reply('本群没有开启淫趴，请管理员发送【#开启淫趴】');
      }

      // 获取所有用户数据并排序
      const rankings = Object.entries(data.data)
        .map(([qq, userData]) => ({
          qq,
          count: userData.dajiaocount || 0,
          inject: userData.inject || 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // 只取前10名

      if (rankings.length === 0) {
        return e.reply('还没有人打过胶，快来试试吧！');
      }

      // 构建排行榜消息
      let msg = '『打胶排行榜』\n';
      msg += '———————\n';
      for (let i = 0; i < rankings.length; i++) {
        const rank = rankings[i];
        const rankIcon = i === 0 ? '👑' : `${i + 1}.`;
        msg += `${rankIcon} ${rank.qq}\n`;
        msg += `┗━ ${rank.count}次 | ${rank.inject.toFixed(2)}ml\n`;
      }
      msg += '———————\n';
      msg += `共统计${Object.keys(data.data).length}个牛子`;

      return e.reply([
        msg,
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${rankings[0].qq}`) // 展示榜首头像
      ]);

    } catch (err) {
      return e.reply('本群还没有淫趴文件，请发送【#淫趴初始化】');
    }
  }
} 