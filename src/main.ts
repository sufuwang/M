import { createSSRApp } from "vue";
import App from "./App.vue";
import uviewPlus from 'uview-plus';

export function createApp() {
  const app = createSSRApp(App);

  app.use(uviewPlus, () => {
		return {
			options: {
				// 修改config对象的属性
				config: {
					// 只加载一次字体图标
					loadFontOnce: true
				}
			}
		}
	})

  return {
    app,
  };
}
