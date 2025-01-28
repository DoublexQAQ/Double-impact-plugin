import lodash from 'lodash'
import fs from 'fs'
import { Data, Common } from '../components/index.js'


let Theme = {
  async getThemeCfg(theme, exclude) {
    let dirPath = './plugins/Double-impact-plugin/resources/help/theme/';
    let ret = [];
    let names = [];
    let dirs = fs.readdirSync(dirPath);
    
    dirs.forEach((dir) => {
      if (fs.existsSync(`${dirPath}${dir}/main.png`)) {
        names.push(dir);
      }
    });

    if (lodash.isArray(theme)) {
      ret = lodash.intersection(theme, names);
    } else if (theme === 'all') {
      ret = names;
    }
    
    if (exclude && lodash.isArray(exclude)) {
      ret = lodash.difference(ret, exclude);
    }
    
    if (ret.length === 0) {
      ret = ['default'];
    }
    
    let name = lodash.sample(ret);
    let resPath = '{{_res_path}}/help/theme/';

    let mainImagePath = '';

    let mainImages = fs.readdirSync(`${dirPath}default`).filter(file => file.startsWith('main') && file.endsWith('.png'));

    let randomMainImage = lodash.sample(mainImages);
    if (randomMainImage) {
      mainImagePath = `${resPath}/default/${randomMainImage}`;
    }
    return {
      main: mainImagePath,
      bg: fs.existsSync(`${dirPath}${name}/bg.jpg`)
        ? `${resPath}${name}/bg.jpg`
        : `${resPath}default/bg.jpg`,
      style: (await Data.importModule(`resources/help/theme/${name}/config.js`)).style || {},
    };
  },
  async getThemeData(diyConfig = {}, sysConfig = {}) {
    return {
      themeConfig: {
        ...sysConfig,
        ...diyConfig
      }
    }
  }
}
export default Theme
