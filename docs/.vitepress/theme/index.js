import DefaultTheme from 'vitepress/theme'
import RustRunner from '../../components/RustRunner.vue'
import OwnershipVisualizer from '../../components/OwnershipVisualizer.vue'
import TechDecisionCard from '../../components/TechDecisionCard.vue'
import GuessingTerminal from '../../components/GuessingTerminal.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('RustRunner', RustRunner)
    app.component('OwnershipVisualizer', OwnershipVisualizer)
    app.component('TechDecisionCard', TechDecisionCard)
    app.component('GuessingTerminal', GuessingTerminal)
  }
}
