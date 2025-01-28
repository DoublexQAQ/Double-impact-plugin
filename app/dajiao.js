import { Double_impact } from './impact.js';
import fs from 'fs';
import YAML from 'yaml';

export class Dajiao extends Double_impact {
  constructor() {
    super({
      rule: [
        { reg: "^#?(导管子|打胶|开导)$", fnc: "daoguanzi" }
      ]
    });
  }

  async daoguanzi(e) {
    if (!e.group_id) return e.reply('该功能只能在群聊中使用哦~');

    try {
      const filePath = `${process.cwd()}/plugins/Double-impact-plugin/data/impact/${e.group_id}.json`;
      let data = JSON.parse(fs.readFileSync(filePath));

      if (data.cond == '0') {
        return e.reply('本群没有开启淫趴，请本群的狗管理或机器人主人发送【#开启淫趴】指令开启本群淫趴吧~');
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
      return e.reply('本群还没有淫趴文件，快发送【#淫趴初始化】来创建淫趴文件吧~');
    }
  }
} 