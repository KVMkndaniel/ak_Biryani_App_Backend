// utils/performanceMonitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      registrations: [],
      averageTime: 0,
      totalRegistrations: 0
    };
  }

  startTimer() {
    return Date.now();
  }

  endTimer(startTime, operation = 'unknown') {
    const duration = Date.now() - startTime;
    
    if (operation === 'registration') {
      this.metrics.registrations.push(duration);
      this.metrics.totalRegistrations++;
      
      // Calculate running average
      const total = this.metrics.registrations.reduce((sum, time) => sum + time, 0);
      this.metrics.averageTime = total / this.metrics.registrations.length;
      
      // Keep only last 100 registrations for memory efficiency
      if (this.metrics.registrations.length > 100) {
        this.metrics.registrations.shift();
      }
    }
    
    return duration;
  }

  getMetrics() {
    return {
      ...this.metrics,
      recentRegistrations: this.metrics.registrations.slice(-10), // Last 10 registrations
      slowRegistrations: this.metrics.registrations.filter(time => time > 5000) // Registrations taking >5s
    };
  }

  logPerformance(operation, duration, details = {}) {
    const status = duration < 1000 ? '✅' : duration < 3000 ? '⚠️' : '❌';
    console.log(`${status} ${operation}: ${duration}ms`, details);
  }
}

module.exports = new PerformanceMonitor(); 