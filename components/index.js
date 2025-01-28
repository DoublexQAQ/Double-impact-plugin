import fs from 'fs'
import YAML from 'yaml'
import path from 'path'

export class Data {
  static async importCfg(name) {
    let path = `./plugins/Double-impact-plugin/config/${name}.yaml`
    let defPath = `./plugins/Double-impact-plugin/def_config/${name}.yaml`
    
    let cfg = {}
    if (fs.existsSync(path)) {
      try {
        cfg = YAML.parse(fs.readFileSync(path, 'utf8'))
      } catch (e) {
        console.error(`[Double插件] 配置文件 ${name}.yaml 格式错误`)
      }
    }
    
    let defCfg = {}
    if (fs.existsSync(defPath)) {
      try {
        defCfg = YAML.parse(fs.readFileSync(defPath, 'utf8'))
      } catch (e) {
        console.error(`[Double插件] 默认配置文件 ${name}.yaml 格式错误`)
      }
    }

    return { diyCfg: cfg, sysCfg: defCfg }
  }

  static async getConfig() {
    const configPath = path.join(process.cwd(), 'plugins/Double-impact-plugin/config/impact.yaml');
    return YAML.parse(fs.readFileSync(configPath, 'utf-8'));
  }
}

export class Common {
  static async render(path, params, cfg) {
    // 简单返回 true，实际渲染逻辑可以后续添加
    return true
  }
} 