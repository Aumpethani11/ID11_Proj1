import React, { useState, useEffect } from 'react';
import './PracticeScheduler.css';

const PracticeScheduler = ({ userGoals, setUserGoals, signDataList }) => {
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    time: '',
    duration: 30,
    signs: [],
    reminder: true
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Load schedules from localStorage
  useEffect(() => {
    const savedSchedules = localStorage.getItem('slrPracticeSchedules');
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }
  }, []);

  // Save schedules to localStorage
  useEffect(() => {
    if (schedules.length > 0) {
      localStorage.setItem('slrPracticeSchedules', JSON.stringify(schedules));
    }
  }, [schedules]);

  const addSchedule = () => {
    if (newSchedule.title && newSchedule.time) {
      const schedule = {
        id: Date.now(),
        ...newSchedule,
        created: new Date().toISOString(),
        completed: false
      };
      setSchedules([...schedules, schedule]);
      setNewSchedule({
        title: '',
        time: '',
        duration: 30,
        signs: [],
        reminder: true
      });
      setShowAddForm(false);
    }
  };

  const toggleSchedule = (id) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === id 
        ? { ...schedule, completed: !schedule.completed }
        : schedule
    ));
  };

  const deleteSchedule = (id) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
  };

  const getUpcomingSchedules = () => {
    const today = new Date();
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.time);
      return scheduleDate >= today && !schedule.completed;
    }).sort((a, b) => new Date(a.time) - new Date(b.time));
  };

  const getCompletedToday = () => {
    const today = new Date().toDateString();
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.time).toDateString();
      return scheduleDate === today && schedule.completed;
    });
  };

  const getWeeklyProgress = () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekSchedules = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.time);
      return scheduleDate >= weekStart && scheduleDate <= weekEnd;
    });

    const completed = weekSchedules.filter(s => s.completed).length;
    const total = weekSchedules.length;

    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const weeklyProgress = getWeeklyProgress();

  return (
    <div className="practice-scheduler">
      <div className="scheduler-header">
        <h2>📅 Practice Scheduler</h2>
        <p>Plan your sign language practice sessions and track your progress</p>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-card">
          <h3>Weekly Progress</h3>
          <div className="progress-circle">
            <div className="progress-value">{weeklyProgress.percentage}%</div>
            <div className="progress-text">
              {weeklyProgress.completed}/{weeklyProgress.total} sessions
            </div>
          </div>
        </div>

        <div className="progress-card">
          <h3>Today's Completed</h3>
          <div className="completed-count">
            <span className="count-number">{getCompletedToday().length}</span>
            <span className="count-label">sessions</span>
          </div>
        </div>

        <div className="progress-card">
          <h3>Upcoming Sessions</h3>
          <div className="upcoming-count">
            <span className="count-number">{getUpcomingSchedules().length}</span>
            <span className="count-label">scheduled</span>
          </div>
        </div>
      </div>

      {/* Goals Management */}
      <div className="goals-section">
        <h3>🎯 Practice Goals</h3>
        <div className="goals-grid">
          <div className="goal-item">
            <label>Daily Practice (minutes)</label>
            <input
              type="number"
              value={userGoals.dailyPractice}
              onChange={(e) => setUserGoals({...userGoals, dailyPractice: parseInt(e.target.value)})}
              min="5"
              max="120"
            />
          </div>
          <div className="goal-item">
            <label>Weekly Goals (signs)</label>
            <input
              type="number"
              value={userGoals.weeklyGoals}
              onChange={(e) => setUserGoals({...userGoals, weeklyGoals: parseInt(e.target.value)})}
              min="1"
              max="50"
            />
          </div>
          <div className="goal-item">
            <label>Monthly Target (signs)</label>
            <input
              type="number"
              value={userGoals.monthlyTarget}
              onChange={(e) => setUserGoals({...userGoals, monthlyTarget: parseInt(e.target.value)})}
              min="10"
              max="200"
            />
          </div>
        </div>
      </div>

      {/* Schedule Management */}
      <div className="schedule-management">
        <div className="schedule-header">
          <h3>📋 Practice Schedules</h3>
          <button 
            className="add-schedule-btn"
            onClick={() => setShowAddForm(true)}
          >
            + Add New Schedule
          </button>
        </div>

        {/* Add Schedule Form */}
        {showAddForm && (
          <div className="add-schedule-form">
            <h4>Create New Practice Session</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Session Title</label>
                <input
                  type="text"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                  placeholder="e.g., Morning Practice"
                />
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={newSchedule.duration}
                  onChange={(e) => setNewSchedule({...newSchedule, duration: parseInt(e.target.value)})}
                  min="5"
                  max="120"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newSchedule.reminder}
                    onChange={(e) => setNewSchedule({...newSchedule, reminder: e.target.checked})}
                  />
                  Set Reminder
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button onClick={addSchedule} className="save-btn">Save Schedule</button>
              <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}

        {/* Schedules List */}
        <div className="schedules-list">
          {schedules.length === 0 ? (
            <div className="no-schedules">
              <p>No practice schedules yet. Create your first schedule to get started!</p>
            </div>
          ) : (
            schedules.map(schedule => (
              <div key={schedule.id} className={`schedule-item ${schedule.completed ? 'completed' : ''}`}>
                <div className="schedule-info">
                  <h4>{schedule.title}</h4>
                  <p className="schedule-time">
                    {new Date(schedule.time).toLocaleString()}
                  </p>
                  <p className="schedule-duration">{schedule.duration} minutes</p>
                </div>
                <div className="schedule-actions">
                  <button
                    onClick={() => toggleSchedule(schedule.id)}
                    className={`toggle-btn ${schedule.completed ? 'completed' : 'pending'}`}
                  >
                    {schedule.completed ? '✓ Completed' : 'Mark Complete'}
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Practice Tips */}
      <div className="practice-tips">
        <h3>💡 Practice Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>🕐 Best Practice Times</h4>
            <ul>
              <li>Morning: 9-11 AM (high energy)</li>
              <li>Afternoon: 2-4 PM (good focus)</li>
              <li>Evening: 7-9 PM (relaxed)</li>
            </ul>
          </div>
          <div className="tip-card">
            <h4>🎯 Effective Practice</h4>
            <ul>
              <li>Start with 15-20 minute sessions</li>
              <li>Focus on accuracy over speed</li>
              <li>Practice in good lighting</li>
              <li>Use a mirror to check form</li>
            </ul>
          </div>
          <div className="tip-card">
            <h4>📈 Progress Tracking</h4>
            <ul>
              <li>Set realistic daily goals</li>
              <li>Track your improvement weekly</li>
              <li>Celebrate small victories</li>
              <li>Adjust goals as you improve</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeScheduler;
