<template>
  <div class="trading-view-container">
    <!-- Pattern Controls -->
    <div class="pattern-controls">
      <button
        @click="togglePattern('supportResistance')"
        :class="{ 'active': patternStates.supportResistance }"
        class="pattern-btn"
      >
        Support/Resistance
      </button>

      <div class="pattern-dropdown">
        <button @click="isOpen = !isOpen" class="dropdown-btn">
          Patterns
          <span class="dropdown-arrow" :class="{ open: isOpen }">▼</span>
        </button>
        
        <div v-if="isOpen" class="dropdown-menu">
          <button
            v-for="(config, pattern) in patternConfigs"
            :key="pattern"
            @click="togglePattern(pattern)"
            :class="{ 
              'active': patternStates[pattern],
              [config.activeClass]: true 
            }"
            class="dropdown-item"
          >
            {{ config.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { initTradingView } from '@/lib/tradingview'
import { UDFCompatibleDatafeed } from '@/lib/datafeed'
import { ChartPatternManager } from '@/lib/tvChartFunctions'

export default {
  props: {
    symbol: { type: String, default: 'AAPL' },
    interval: { type: String, default: 'D' },
    libraryPath: { type: String, default: '/charting_library/' }
  },

  setup(props) {
    const chartContainer = ref(null)
    const tvWidget = ref(null)
    const isOpen = ref(false)
    const currentSymbol = ref(props.symbol)
    const patternManager = ref(null)

    const patternConfigs = {
      supportResistance: {
        label: "Support/Resistance",
        activeClass: "aqua"
      },
      symmetricTriangle: {
        label: "Symmetric Triangle",
        activeClass: "blue"
      },
      headAndShoulders: {
        label: "Head & Shoulders",
        activeClass: "purple"
      },
      doubleTop: {
        label: "Double Top",
        activeClass: "red"
      },
      doubleBottom: {
        label: "Double Bottom",
        activeClass: "green"
      }
    }

    const patternStates = ref(
      Object.keys(patternConfigs).reduce((acc, key) => {
        acc[key] = false
        return acc
      }, {})
    )

    const togglePattern = async (patternName) => {
      if (!patternManager.value) return
      
      patternStates.value[patternName] = !patternStates.value[patternName]
      
      try {
        await patternManager.value.togglePattern(
          patternName,
          currentSymbol.value,
          patternStates.value[patternName]
        )
        
        if (patternName !== "supportResistance") {
          isOpen.value = false
        }
      } catch (error) {
        console.error(`Error toggling pattern ${patternName}:`, error)
        patternStates.value[patternName] = !patternStates.value[patternName]
      }
    }

    onMounted(async () => {
      try {
        tvWidget.value = await initTradingView({
          container: chartContainer.value,
          symbol: props.symbol,
          interval: props.interval,
          datafeed: new UDFCompatibleDatafeed('/datafeed'),
          libraryPath: props.libraryPath
        })

        patternManager.value = new ChartPatternManager(tvWidget.value, patternConfigs)

        tvWidget.value.activeChart().onSymbolChanged().subscribe(null, (newSymbol) => {
          currentSymbol.value = newSymbol.full_name
          Object.entries(patternStates.value).forEach(([pattern, isActive]) => {
            if (isActive) {
              patternManager.value.togglePattern(pattern, currentSymbol.value, true)
            }
          })
        })

      } catch (error) {
        console.error('Chart initialization error:', error)
      }
    })

    onUnmounted(() => {
      if (patternManager.value) patternManager.value.cleanup()
      if (tvWidget.value) tvWidget.value.remove()
    })

    watch(
      () => props.symbol,
      (newSymbol) => {
        if (tvWidget.value) {
          tvWidget.value.activeChart().setSymbol(newSymbol, props.interval)
          currentSymbol.value = newSymbol
        }
      }
    )

    return {
      chartContainer,
      isOpen,
      patternStates,
      patternConfigs,
      togglePattern
    }
  }
}
</script>

<style scoped>
.trading-view-container {
  display: flex;
  flex-direction: column;
  height: 90vh;
  width: 100%;
}

.pattern-controls {
  padding: 10px;
  display: flex;
  gap: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.chart-container {
  flex: 1;
  min-height: 0;
}

.pattern-btn, .dropdown-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.pattern-btn.active, .dropdown-item.active {
  background: #4d90fe;
  color: white;
}

.dropdown-btn {
  position: relative;
  padding-right: 30px;
}

.dropdown-arrow {
  position: absolute;
  right: 10px;
  transition: transform 0.2s;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
  z-index: 100;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.dropdown-item:last-child {
  border-bottom: none;
}

/* Pattern-specific colors */
.aqua { background-color: #00bcd4 !important; }
.blue { background-color: #2196f3 !important; }
.green { background-color: #4caf50 !important; }
.red { background-color: #f44336 !important; }
.purple { background-color: #9c27b0 !important; }
</style>