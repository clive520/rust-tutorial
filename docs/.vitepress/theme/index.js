import DefaultTheme from 'vitepress/theme'
import RustRunner from '../../components/RustRunner.vue'
import OwnershipVisualizer from '../../components/OwnershipVisualizer.vue'
import TechDecisionCard from '../../components/TechDecisionCard.vue'
import GuessingTerminal from '../../components/GuessingTerminal.vue'
import TrafficSimulator from '../../components/TrafficSimulator.vue'
import BorrowVisualizer from '../../components/BorrowVisualizer.vue'
import DataModelLab from '../../components/DataModelLab.vue'
import TraitPowerLab from '../../components/TraitPowerLab.vue'
import MiniGrepSimulator from '../../components/MiniGrepSimulator.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('RustRunner', RustRunner)
    app.component('OwnershipVisualizer', OwnershipVisualizer)
    app.component('TechDecisionCard', TechDecisionCard)
    app.component('GuessingTerminal', GuessingTerminal)
    app.component('TrafficSimulator', TrafficSimulator)
    app.component('BorrowVisualizer', BorrowVisualizer)
    app.component('DataModelLab', DataModelLab)
    app.component('TraitPowerLab', TraitPowerLab)
    app.component('MiniGrepSimulator', MiniGrepSimulator)
  }
}
