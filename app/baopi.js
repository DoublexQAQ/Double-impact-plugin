import plugin from '../../../lib/plugins/plugin.js';
import ImpactCore from './impact.js';
import fs from 'fs';

export class Baopi extends plugin {
  constructor() {
    super({
      name: "割包皮功能",
      event: "message",
      rule: [
        { reg: "^#?割包皮$", fnc: "handleBaopi" }
      ]
    });
    this.impact = new ImpactCore();
  }

  async handleBaopi(e) {
    if (!e.group_id) return e.reply('该功能只能在群聊中使用哦~');

    try {
      // 读取群数据文件
      const filePath = `${process.cwd()}/plugins/Double-impact-plugin/data/impact/${e.group_id}.json`;
      let data = JSON.parse(fs.readFileSync(filePath));

      // 检查群是否开启淫趴
      if (data.cond == '0') {
        return e.reply('本群没有开启淫趴，请管理员发送【#开启淫趴】');
      }

      // 获取用户数据，如果是新用户会自动创建
      const userData = await this.impact.getUserData(e.user_id);

      // 检查是否被贞操锁锁住
      if (userData.chastityLock) {
        return e.reply('你的牛子被贞操锁锁住了，无法割包皮！');
      }

      // 检查CD时间
      if (userData.cd_baopi && userData.cd_baopi > Date.now()) {
        const remainTime = Math.ceil((userData.cd_baopi - Date.now()) / 1000);
        const remainMinutes = Math.floor(remainTime / 60);
        const remainSeconds = remainTime % 60;
        return e.reply(`你刚割过包皮，伤口还没愈合，请等待${remainMinutes}分${remainSeconds}秒后再试`);
      }

      // 设置CD
      userData.cd_baopi = Date.now() + (yaml.baopi_cd * 1000);

      // 随机结果判定
      const chance = Math.random();  // 生成0-1之间的随机数
      let resultMsg;

      // 5%概率大成功
      if (chance < yaml.baopi_big_chance) {
        const growth = yaml.baopi_big_min + Math.random() * (yaml.baopi_big_max - yaml.baopi_big_min);
        userData.long += growth;
        resultMsg = [
          `手术大成功！割完包皮后牛子异常敏感，猛地增长了${growth.toFixed(2)}cm！`,
          `现在的长度是${userData.long.toFixed(2)}cm`,
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`)
        ];
      }
      // 接下来50%概率普通成功
      else if (chance < yaml.baopi_success_chance) {
        const growth = yaml.baopi_normal_min + Math.random() * (yaml.baopi_normal_max - yaml.baopi_normal_min);
        userData.long += growth;
        resultMsg = [
          `手术成功！割完包皮后牛子舒服多了，增长了${growth.toFixed(2)}cm~`,
          `现在的长度是${userData.long.toFixed(2)}cm`,
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`)
        ];
      }
      // 剩下45%概率失败
      else {
        const loss = yaml.baopi_fail_min + Math.random() * (yaml.baopi_fail_max - yaml.baopi_fail_min);
        userData.long -= loss;
        resultMsg = [
          `手术失败！医生手抖了，不小心多割了一点，牛子缩短了${loss.toFixed(2)}cm...`,
          `现在的长度是${userData.long.toFixed(2)}cm`,
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`)
        ];
      }

      // 更新割包皮次数统计
      userData.baopicount = (userData.baopicount || 0) + 1;

      // 数据保护：防止数据异常
      if (typeof userData.long !== 'number') {
        userData.long = yaml.long;  // 如果长度不是数字，重置为初始值
      }
      if (userData.long < 0) {
        userData.long = 0;  // 防止长度变成负数
      }
      userData.baopicount = parseInt(userData.baopicount || 0);  // 确保计数是整数

      // 保存更新后的数据
      fs.writeFileSync(filePath, JSON.stringify(data));

      return e.reply(resultMsg);

    } catch (err) {
      return e.reply('本群还没有淫趴文件，请发送【#淫趴初始化】');
    }
  }
} 