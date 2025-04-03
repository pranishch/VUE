<template>
  <div id="app">
    <h1>TradingView Chart Integration</h1>
    <div v-if="loading" class="loading">Loading chart...</div>
    <TradingChart 
      v-else
      symbol="AAPL" 
      interval="D"
    />
  </div>
</template>

<script>
import TradingChart from './components/TradingChart.vue'

export default {
  name: 'App',
  components: { TradingChart },
  data: () => ({ loading: true }),
  mounted() {
    setTimeout(() => this.loading = false, 500)
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}
</style>