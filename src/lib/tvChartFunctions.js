export class ChartPatternManager {
    constructor(tvWidget, patternConfigs) {
      this.tvWidget = tvWidget
      this.patternConfigs = patternConfigs
      this.activePatterns = new Map()
    }
  
    async togglePattern(patternName, symbol, isActive) {
      const chart = this.tvWidget?.activeChart()
      if (!chart) return
  
      try {
        if (isActive) {
          console.log(`Drawing ${patternName} for ${symbol}`)
          // Add your specific pattern drawing logic here
          await this.drawPattern(chart, patternName)
          this.activePatterns.set(patternName, true)
        } else {
          console.log(`Removing ${patternName} for ${symbol}`) 
          this.removePattern(chart, patternName)
          this.activePatterns.delete(patternName)
        }
      } catch (error) {
        console.error(`Error toggling pattern ${patternName}:`, error)
        throw error
      }
    }
  
    async drawPattern(chart, patternName) {
      // Implement specific drawing logic for each pattern
      switch (patternName) {
        case 'supportResistance':
          return this.drawSupportResistance(chart)
        case 'headAndShoulders':
          return this.drawHeadAndShoulders(chart)
        // Add cases for all your patterns
        default:
          return chart.createStudy(patternName, false, false)
      }
    }
  
    async drawSupportResistance(chart) {
      // Example implementation:
      const srStudy = await chart.createStudy(
        'Support & Resistance',
        false,
        false,
        [{ id: 'plot_support', defval: true }, { id: 'plot_resistance', defval: true }]
      )
      return srStudy
    }
  
    removePattern(chart, patternName) {
      const studies = chart.getAllStudies()
      const study = studies.find(s => 
        s.name.toLowerCase() === patternName.toLowerCase()
      )
      if (study) chart.removeEntity(study.id)
    }
  
    cleanup() {
      this.activePatterns.clear()
    }
  }