import plugin from '../../../lib/plugins/plugin.js'
import lodash from 'lodash'
import { Common, Data } from '../components/index.js'
import Theme from './theme.js'
import path from 'path'
import { segment } from 'oicq'
const logger = global.logger || console;

export class Help extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '帮助功能',
      /** 功能描述 */
      dsc: 'Provides help related functionalities',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 2000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: /^#?help$/i,
          /** 执行方法 */
          fnc: 'showHelp'
        }
      ]
    });
  }

  async showHelp(e) {
    try {
      const helpContent = [
        "=== Double插件帮助 ===",
        "1. 初始化: #淫趴初始化",
        "2. 创建牛牛: #创建牛牛",
        "3. 打胶: #打胶",
        "4. 决斗: #决斗@群友",
        "5. 排行榜: #牛子排行榜",
        "6. 贞操锁: #使用贞操锁"
      ].join('\n');
      
      await e.reply([
        segment.image(`file://${path.join(this.pluginPath, 'resources/help.png')}`),
        helpContent
      ]);
    } catch (err) {
      logger.error('[帮助功能] 异常', err);
      await e.reply('帮助信息生成失败');
    }
    return true;
  }
}

// If needed elsewhere, export it correctly
export { Help as helpPlugin };

async function help(e) {
  let custom = {}
  let help = {}

  let { diyCfg, sysCfg } = await Data.importCfg('help')

  custom = help

  let helpConfig = lodash.defaults(diyCfg.helpCfg || {}, custom.helpCfg, sysCfg.helpCfg)
  let helpList = diyCfg.helpList || custom.helpList || sysCfg.helpList
  let helpGroup = []

  lodash.forEach(helpList, (group) => {
    if (group.auth && group.auth === 'master' && !e.isMaster) {
      return true
    }

    lodash.forEach(group.list, (help) => {
      let icon = help.icon * 1
      if (!icon) {
        help.css = 'display:none'
      } else {
        let x = (icon - 1) % 10
        let y = (icon - x - 1) / 10
        help.css = `background-position:-${x * 50}px -${y * 50}px`
      }
    })

    helpGroup.push(group)
  })
  let themeData = await Theme.getThemeData(diyCfg.helpCfg || {}, sysCfg.helpCfg || {})

  return await Common.render('help/index', {
    helpCfg: helpConfig,
    helpGroup,
    ...themeData,
    element: 'default'
  }, { e, scale: 1 })
}

let helpList = {
  group: [{
    group: "基础功能",
    list: [{
      icon: 1,
      title: "#淫趴初始化",
      desc: "初始化群淫趴功能"
    }, {
      icon: 2,
      title: "#开启淫趴",
      desc: "开启群淫趴功能"
    }]
  }, {
    group: "娱乐功能",
    list: [{
      icon: 3,
      title: "#打胶",
      desc: "增加牛子长度"
    }, {
      icon: 4,
      title: "#决斗@群友",
      desc: "和群友进行决斗"
    }, {
      icon: 5,
      title: "#割包皮",
      desc: "有几率增加牛子长度"
    }]
  }, {
    group: "其他功能", 
    list: [{
      icon: 6,
      title: "#牛子排行榜",
      desc: "查看群内排名"
    }, {
      icon: 7,
      title: "#使用贞操锁",
      desc: "保护自己不被他人袭击"
    }]
  }]
}