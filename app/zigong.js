import ImpactCore from './impact.js';
import fs from 'fs';

export class Zigong extends plugin {
  constructor() {
    super({
      name: "自宫功能",
      event: "message",
      rule: [
        { reg: "^#?(自宫|砍掉牛牛|不要牛子)$", fnc: "zigong" },
        { reg: "^#?删除淫趴数据\\s*\\d*$", fnc: "deleteData" },
        { reg: "^#?修改牛子\\s*<@!*(\\d+)>\\s*(\\d+)$", fnc: "modifyData" }
      ]
    });
    this.impact = new ImpactCore();
  }

  async zigong(e) {
    if (!e.group_id) return e.reply('该功能只能在群聊中使用哦~');

    try {
      const filePath = `${process.cwd()}/plugins/Double-impact-plugin/data/impact/${e.group_id}.json`;
      let data = JSON.parse(fs.readFileSync(filePath));

      if (data.cond == '0') {
        return e.reply('本群没有开启淫趴，请管理员发送【#开启淫趴】');
      }

      // 检查用户是否有数据
      if (!data.data[e.user_id]) {
        return e.reply('你连牛牛都没有，发送【#创建牛牛】先~');
      }

      // 删除用户数据
      delete data.data[e.user_id];
      fs.writeFileSync(filePath, JSON.stringify(data));

      const msgs = [
        "你的牛牛已经被砍掉了，你再也不能涩涩了……",
        "从今天起，你就是无欲无求的修炼之人了！",
        "嘶——这下风都不会撩你了，感受到了吗？",
        "你失去了牛子，但获得了精神上的升华，恭喜！"
      ];
      return e.reply(msgs[Math.floor(Math.random() * msgs.length)]);

    } catch (err) {
      return e.reply('本群还没有淫趴文件，请发送【#淫趴初始化】');
    }
  }

  async deleteData(e) {
    if (!e.isMaster) {
      return e.reply('只有主人才能删除数据！');
    }

    try {
      // 提取群号
      const groupId = e.msg.replace(/^#?删除淫趴数据\s*/, '').trim();
      if (!groupId) {
        return e.reply('请指定要删除数据的群号！');
      }

      const filePath = `${process.cwd()}/plugins/Double-impact-plugin/data/impact/${groupId}.json`;
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return e.reply(`已成功删除群${groupId}的淫趴数据！`);
      } else {
        return e.reply(`群${groupId}的淫趴数据不存在！`);
      }

    } catch (err) {
      console.error(err);
      return e.reply('删除数据时发生错误，请稍后重试');
    }
  }

  async modifyData(e) {
    if (!e.isMaster) {
      return e.reply('只有主人才能修改数据！');
    }

    try {
      if (!e.group_id) return e.reply('请在群聊中使用该命令');

      const filePath = `${process.cwd()}/plugins/Double-impact-plugin/data/impact/${e.group_id}.json`;
      let data = JSON.parse(fs.readFileSync(filePath));

      // 提取目标用户ID和新的长度值
      const matches = e.msg.match(/^#?修改牛子\s*<@!*(\d+)>\s*(\d+)$/);
      if (!matches) {
        return e.reply('格式错误！请使用：#修改牛子@用户 长度');
      }

      const [_, targetId, newLength] = matches;
      const length = parseInt(newLength);

      if (isNaN(length) || length < 0 || length > 999) {
        return e.reply('长度必须是0-999之间的数字！');
      }

      // 初始化或更新用户数据
      if (!data.data[targetId]) {
        data.data[targetId] = {
          long: length,
          inject: 0,
          be_inject: 0,
          dajiaocount: 0,
          baopicount: 0,
          cd_daoguan: 0,
          cd_juedou: 0,
          cd_riqunyou: 0,
          cd_chastity: 0,
          cd_baopi: 0,
          chastityLock: false
        };
      } else {
        data.data[targetId].long = length;
      }

      fs.writeFileSync(filePath, JSON.stringify(data));
      return e.reply([
        `已将${targetId}的牛子长度修改为${length}cm`,
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${targetId}`)
      ]);

    } catch (err) {
      console.error(err);
      return e.reply('修改数据时发生错误，请稍后重试');
    }
  }
} 