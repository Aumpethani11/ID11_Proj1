import React, { useState } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './AnalyticsOverview.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsOverview = ({ signDataList, analytics, topSigns }) => {
  const [timeRange, setTimeRange] = useState('week');

  // Process data for different time ranges
  const processDataForTimeRange = (range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    return signDataList.filter(session => new Date(session.createdAt) >= startDate);
  };

  const filteredData = processDataForTimeRange(timeRange);

  // Daily practice chart data
  const dailyPracticeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Practice Time (minutes)',
      data: [15, 25, 20, 30, 22, 18, 12],
      borderColor: 'rgb(174, 103, 250)',
      backgroundColor: 'rgba(174, 103, 250, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Sign accuracy chart data
  const accuracyData = {
    labels: topSigns.map(sign => sign.SignDetected),
    datasets: [{
      label: 'Accuracy %',
      data: [85, 92, 78, 88, 95],
      backgroundColor: [
        'rgba(174, 103, 250, 0.8)',
        'rgba(244, 152, 103, 0.8)',
        'rgba(81, 175, 221, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)'
      ],
      borderColor: [
        'rgba(174, 103, 250, 1)',
        'rgba(244, 152, 103, 1)',
        'rgba(81, 175, 221, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 2
    }]
  };

  // Progress over time chart
  const progressData = {
    labels: filteredData.map((_, index) => `Session ${index + 1}`),
    datasets: [{
      label: 'Signs Performed',
      data: filteredData.map(session => session.signsPerformed.length),
      borderColor: 'rgb(244, 152, 103)',
      backgroundColor: 'rgba(244, 152, 103, 0.1)',
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  return (
    <div className="analytics-overview">
      <div className="analytics-header">
        <h2>📈 Detailed Analytics</h2>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <h3>Total Practice Time</h3>
            <p className="metric-value">{Math.round(analytics.totalTimeSpent / 60)} minutes</p>
            <p className="metric-subtitle">Across {analytics.totalSessions} sessions</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <h3>Signs Mastered</h3>
            <p className="metric-value">{analytics.uniqueSigns}</p>
            <p className="metric-subtitle">Out of {analytics.totalSigns} total signs</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Average Session</h3>
            <p className="metric-value">{Math.round(analytics.averageSessionTime / 60)} min</p>
            <p className="metric-subtitle">Per practice session</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🏆</div>
          <div className="metric-content">
            <h3>Accuracy Rate</h3>
            <p className="metric-value">87%</p>
            <p className="metric-subtitle">Overall recognition accuracy</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Daily Practice Pattern</h3>
          <div className="chart-wrapper">
            <Line data={dailyPracticeData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3>Sign Accuracy Distribution</h3>
          <div className="chart-wrapper">
            <Doughnut data={accuracyData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3>Progress Over Time</h3>
          <div className="chart-wrapper">
            <Bar data={progressData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="insights-section">
        <h3>💡 Insights & Recommendations</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>🎯 Focus Areas</h4>
            <p>Practice signs with lower accuracy rates more frequently</p>
            <ul>
              <li>Spend extra time on: "HELLO", "THANK YOU"</li>
              <li>Your strongest signs: "YES", "NO", "OK"</li>
            </ul>
          </div>

          <div className="insight-card">
            <h4>⏰ Optimal Practice Times</h4>
            <p>Based on your data, you perform best during:</p>
            <ul>
              <li>Morning sessions (9-11 AM)</li>
              <li>Evening practice (7-9 PM)</li>
            </ul>
          </div>

          <div className="insight-card">
            <h4>📈 Improvement Suggestions</h4>
            <p>To enhance your signing skills:</p>
            <ul>
              <li>Increase daily practice by 10 minutes</li>
              <li>Focus on hand positioning consistency</li>
              <li>Practice in different lighting conditions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
