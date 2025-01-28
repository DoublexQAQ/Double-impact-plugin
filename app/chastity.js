import plugin from '../../../lib/plugins/plugin.js';
import ImpactCore from './impact.js';
import fs from 'fs';

export class Chastity extends plugin {
  constructor() {
    super({
      name: "贞操锁功能",
      event: "message",
      rule: [
        { reg: "^#?使用贞操锁$", fnc: "useLock" },
        { reg: "^#?解除贞操锁$", fnc: "removeLock" },
        { reg: "^#?强制解锁\\s*<@!*(\\d+)>$", fnc: "forceUnlock" }
      ]
    });
    this.impact = new ImpactCore();
  }

  async useLock(e) {
    if (!e.group_id) return e.reply('该功能只能在群聊中使用哦~');

    try {
      const filePath = `${process.cwd()}/plugins/Double-impact-plugin/data/impact/${e.group_id}.json`;
      let data = JSON.parse(fs.readFileSync(filePath));

      if (data.cond == '0') {
        return e.reply('本群没有开启淫趴，请管理员发送【#开启淫趴】');
      }

      // 获取/初始化用户数据
      const userData = await this.initUserData(e.group_id, e.user_id);

      // 检查是否已经上锁
      if (userData.chastityLock) {
        return e.reply('你已经戴着贞操锁了，想要解除的话请发送【#解除贞操锁】');
      }

      // 检查CD
      if (userData.cd_chastity && userData.cd_chastity > Date.now()) {
        const remainTime = Math.ceil((userData.cd_chastity - Date.now()) / 1000);
        return e.reply(`你刚刚试图上锁失败，请等待${remainTime}秒后再试`);
      }

      // 上锁概率判定 (60%成功率)
      const lockChance = Math.random();
      if (lockChance > 0.6) {
        // 设置CD (5分钟)
        userData.cd_chastity = Date.now() + 300000;
        fs.writeFileSync(filePath, JSON.stringify(data));

        const failMsgs = [
          "贞操锁好像卡住了，没能戴上...",
          "不太顺利，贞操锁戴不上去",
          "失败了，这个尺寸好像不太合适"
        ];
        return e.reply(failMsgs[Math.floor(Math.random() * failMsgs.length)]);
      }

      // 上锁成功
      userData.chastityLock = true;
      userData.cd_chastity = 0; // 重置CD
      fs.writeFileSync(filePath, JSON.stringify(data));

      const successMsgs = [
        "咔嚓！贞操锁已经牢牢锁住了你的牛子~",
        "已经给你戴上了贞操锁，现在你只能看着别人快活了~",
        "贞操锁已上锁，你的牛子已经不是你的了！"
      ];
      return e.reply(successMsgs[Math.floor(Math.random() * successMsgs.length)]);

    } catch (err) {
      return e.reply('本群还没有淫趴文件，请发送【#淫趴初始化】');
    }
  }

  async removeLock(e) {
    if (!e.group_id) return e.reply('该功能只能在群聊中使用哦~');

    try {
      const filePath = `${process.cwd()}/plugins/Double-impact-plugin/data/impact/${e.group_id}.json`;
      let data = JSON.parse(fs.readFileSync(filePath));

      if (data.cond == '0') {
        return e.reply('本群没有开启淫趴，请管理员发送【#开启淫趴】');
      }

      // 获取用户数据
      const userData = await this.initUserData(e.group_id, e.user_id);

      // 检查是否已上锁
      if (!userData.chastityLock) {
        return e.reply('你没有戴贞操锁哦，不用解锁~');
      }

      // 直接解锁成功
      userData.chastityLock = false;
      fs.writeFileSync(filePath, JSON.stringify(data));

      const successMsgs = [
        "咔嚓！贞操锁终于解开了，你重获自由了！",
        "解锁成功！快去释放你的欲望吧~",
        "终于解开了，好好享受自由的感觉吧！"
      ];
      return e.reply(successMsgs[Math.floor(Math.random() * successMsgs.length)]);

    } catch (err) {
      return e.reply('本群还没有淫趴文件，请发送【#淫趴初始化】');
    }
  }

  async forceUnlock(e) {
    if (!e.group_id) return e.reply('该功能只能在群聊中使用哦~');
    if (!(e.isMaster || e.member.is_owner || e.member.is_admin)) {
      return e.reply('只有管理员才能强制解锁他人的贞操锁！');
    }

    try {
      const filePath = `${process.cwd()}/plugins/Double-impact-plugin/data/impact/${e.group_id}.json`;
      let data = JSON.parse(fs.readFileSync(filePath));

      if (data.cond == '0') {
        return e.reply('本群没有开启淫趴，请管理员发送【#开启淫趴】');
      }

      // 获取目标用户ID
      const targetId = e.msg.match(/\d+/)[0];
      if (!data.data[targetId]) {
        return e.reply('该用户还没有参与过淫趴，不需要解锁~');
      }

      // 检查目标是否上锁
      if (!data.data[targetId].chastityLock) {
        return e.reply('该用户没有戴贞操锁哦~');
      }

      // 强制解锁
      data.data[targetId].chastityLock = false;
      fs.writeFileSync(filePath, JSON.stringify(data));

      return e.reply([
        `已强制解除${targetId}的贞操锁！`,
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${targetId}`)
      ]);

    } catch (err) {
      return e.reply('本群还没有淫趴文件，请发送【#淫趴初始化】');
    }
  }
} 