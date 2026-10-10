import DefaultTheme from 'vitepress/theme'
import RustRunner from '../../components/RustRunner.vue'
import OwnershipVisualizer from '../../components/OwnershipVisualizer.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('RustRunner', RustRunner)
    app.component('OwnershipVisualizer', OwnershipVisualizer)
  }
}
