import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import './ProgressTracker.css';

const ProgressTracker = ({ signDataList, userGoals, analytics }) => {
  const [achievements, setAchievements] = useState([]);

  // Calculate progress metrics
  const calculateProgress = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const monthlyData = signDataList.filter(session => 
      new Date(session.createdAt) >= startOfMonth
    );
    const weeklyData = signDataList.filter(session => 
      new Date(session.createdAt) >= startOfWeek
    );

    const monthlyProgress = {
      sessions: monthlyData.length,
      timeSpent: monthlyData.reduce((acc, session) => acc + session.secondsSpent, 0),
      signsPracticed: monthlyData.reduce((acc, session) => acc + session.signsPerformed.length, 0),
      goalProgress: Math.min(100, Math.round((monthlyData.length / userGoals.monthlyTarget) * 100))
    };

    const weeklyProgress = {
      sessions: weeklyData.length,
      timeSpent: weeklyData.reduce((acc, session) => acc + session.secondsSpent, 0),
      signsPracticed: weeklyData.reduce((acc, session) => acc + session.signsPerformed.length, 0),
      goalProgress: Math.min(100, Math.round((weeklyData.length / userGoals.weeklyGoals) * 100))
    };

    return { monthlyProgress, weeklyProgress };
  };

  const progress = calculateProgress();

  // Generate progress chart data
  const generateProgressData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last30Days.push(date.toISOString().split('T')[0]);
    }

    const dailyData = last30Days.map(date => {
      const daySessions = signDataList.filter(session => 
        session.createdAt.split('T')[0] === date
      );
      return {
        date,
        sessions: daySessions.length,
        timeSpent: daySessions.reduce((acc, session) => acc + session.secondsSpent, 0),
        signsPracticed: daySessions.reduce((acc, session) => acc + session.signsPerformed.length, 0)
      };
    });

    return dailyData;
  };

  const progressData = generateProgressData();

  // Chart configurations
  const sessionsChartData = {
    labels: progressData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Sessions',
      data: progressData.map(d => d.sessions),
      borderColor: 'rgb(174, 103, 250)',
      backgroundColor: 'rgba(174, 103, 250, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const timeChartData = {
    labels: progressData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Time Spent (minutes)',
      data: progressData.map(d => Math.round(d.timeSpent / 60)),
      borderColor: 'rgb(244, 152, 103)',
      backgroundColor: 'rgba(244, 152, 103, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const signsChartData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [
        progress.monthlyProgress.signsPracticed,
        Math.max(0, userGoals.monthlyTarget - progress.monthlyProgress.signsPracticed)
      ],
      backgroundColor: [
        'rgba(174, 103, 250, 0.8)',
        'rgba(255, 255, 255, 0.1)'
      ],
      borderColor: [
        'rgba(174, 103, 250, 1)',
        'rgba(255, 255, 255, 0.3)'
      ],
      borderWidth: 2
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

  // Check for achievements
  useEffect(() => {
    const newAchievements = [];
    
    if (analytics.totalSessions >= 10 && !achievements.includes('first_10')) {
      newAchievements.push({
        id: 'first_10',
        title: 'Getting Started',
        description: 'Completed 10 practice sessions',
        icon: '🎯',
        date: new Date().toISOString()
      });
    }
    
    if (analytics.totalTimeSpent >= 3600 && !achievements.includes('hour_practiced')) {
      newAchievements.push({
        id: 'hour_practiced',
        title: 'Dedicated Learner',
        description: 'Practiced for over 1 hour total',
        icon: '⏰',
        date: new Date().toISOString()
      });
    }
    
    if (analytics.uniqueSigns >= 20 && !achievements.includes('sign_master')) {
      newAchievements.push({
        id: 'sign_master',
        title: 'Sign Master',
        description: 'Learned 20 different signs',
        icon: '🏆',
        date: new Date().toISOString()
      });
    }

    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements]);
    }
  }, [analytics, achievements]);

  return (
    <div className="progress-tracker">
      <div className="tracker-header">
        <h2>🎯 Progress Tracker</h2>
        <p>Monitor your learning journey and celebrate achievements</p>
      </div>

      {/* Progress Overview Cards */}
      <div className="progress-cards">
        <div className="progress-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h3>Monthly Progress</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.monthlyProgress.goalProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {progress.monthlyProgress.sessions} / {userGoals.monthlyTarget} sessions
            </p>
            <p className="progress-percentage">{progress.monthlyProgress.goalProgress}%</p>
          </div>
        </div>

        <div className="progress-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Weekly Progress</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.weeklyProgress.goalProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {progress.weeklyProgress.sessions} / {userGoals.weeklyGoals} sessions
            </p>
            <p className="progress-percentage">{progress.weeklyProgress.goalProgress}%</p>
          </div>
        </div>

        <div className="progress-card">
          <div className="card-icon">⏱️</div>
          <div className="card-content">
            <h3>Time Invested</h3>
            <p className="time-value">{Math.round(progress.monthlyProgress.timeSpent / 60)} min</p>
            <p className="time-subtitle">This month</p>
          </div>
        </div>

        <div className="progress-card">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <h3>Signs Practiced</h3>
            <p className="signs-value">{progress.monthlyProgress.signsPracticed}</p>
            <p className="signs-subtitle">This month</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Daily Sessions (Last 30 Days)</h3>
          <div className="chart-wrapper">
            <Line data={sessionsChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3>Daily Practice Time</h3>
          <div className="chart-wrapper">
            <Line data={timeChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3>Monthly Goal Progress</h3>
          <div className="chart-wrapper">
            <Doughnut data={signsChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="achievements-section">
        <h3>🏆 Achievements</h3>
        {achievements.length > 0 ? (
          <div className="achievements-grid">
            {achievements.map(achievement => (
              <div key={achievement.id} className="achievement-card">
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  <span className="achievement-date">
                    {new Date(achievement.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-achievements">
            <p>Keep practicing to unlock achievements!</p>
            <div className="achievement-hints">
              <div className="hint-item">
                <span className="hint-icon">🎯</span>
                <span>Complete 10 sessions</span>
              </div>
              <div className="hint-item">
                <span className="hint-icon">⏰</span>
                <span>Practice for 1 hour total</span>
              </div>
              <div className="hint-item">
                <span className="hint-icon">🏆</span>
                <span>Learn 20 different signs</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h3>💡 Personalized Recommendations</h3>
        <div className="recommendations-grid">
          <div className="recommendation-card">
            <h4>🎯 Focus Areas</h4>
            <p>Based on your progress, consider:</p>
            <ul>
              <li>Increase daily practice by 5 minutes</li>
              <li>Focus on consistency over intensity</li>
              <li>Set weekly mini-goals</li>
            </ul>
          </div>

          <div className="recommendation-card">
            <h4>📈 Next Steps</h4>
            <p>To reach your goals faster:</p>
            <ul>
              <li>Practice at the same time daily</li>
              <li>Track your improvement weekly</li>
              <li>Celebrate small victories</li>
            </ul>
          </div>

          <div className="recommendation-card">
            <h4>🎓 Learning Tips</h4>
            <p>Optimize your practice:</p>
            <ul>
              <li>Use the mirror technique</li>
              <li>Record yourself practicing</li>
              <li>Join a signing community</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
