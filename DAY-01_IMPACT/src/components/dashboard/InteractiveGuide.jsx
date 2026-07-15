import React, { useState, useEffect } from 'react';
import './InteractiveGuide.css';

const InteractiveGuide = ({ signDataList, topSigns }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userLevel, setUserLevel] = useState('beginner');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);

  // Determine user level based on their data
  useEffect(() => {
    if (signDataList.length > 0) {
      const totalSessions = signDataList.length;
      const totalTime = signDataList.reduce((acc, session) => acc + session.secondsSpent, 0);
      
      if (totalSessions >= 20 && totalTime >= 3600) {
        setUserLevel('advanced');
      } else if (totalSessions >= 10 && totalTime >= 1800) {
        setUserLevel('intermediate');
      } else {
        setUserLevel('beginner');
      }
    }
  }, [signDataList]);

  const guideSteps = {
    beginner: [
      {
        id: 1,
        title: 'Welcome to Sign Language Recognition!',
        content: 'Learn the basics of using our SLR system effectively.',
        tasks: [
          'Position your hands clearly in front of the camera',
          'Ensure good lighting for better recognition',
          'Start with simple gestures like "YES" and "NO"'
        ],
        tips: 'Make sure your hands are fully visible and well-lit for the best recognition results.'
      },
      {
        id: 2,
        title: 'Basic Hand Positioning',
        content: 'Master the fundamental hand positions for accurate recognition.',
        tasks: [
          'Keep your hands at chest level',
          'Maintain a comfortable distance from the camera',
          'Avoid overlapping fingers'
        ],
        tips: 'Practice in front of a mirror to check your hand positioning.'
      },
      {
        id: 3,
        title: 'Essential Signs to Start With',
        content: 'Begin with these fundamental signs for better recognition.',
        tasks: [
          'Practice the "HELLO" gesture',
          'Learn the "THANK YOU" sign',
          'Master the "YES" and "NO" gestures'
        ],
        tips: 'Start slowly and focus on accuracy rather than speed.'
      }
    ],
    intermediate: [
      {
        id: 1,
        title: 'Improving Recognition Accuracy',
        content: 'Advanced techniques to enhance your signing recognition.',
        tasks: [
          'Practice consistent hand shapes',
          'Work on smooth transitions between signs',
          'Use facial expressions to support gestures'
        ],
        tips: 'Record yourself practicing to identify areas for improvement.'
      },
      {
        id: 2,
        title: 'Building Sign Vocabulary',
        content: 'Expand your sign language vocabulary systematically.',
        tasks: [
          'Learn 5 new signs each week',
          'Practice signs in different contexts',
          'Combine signs to form simple sentences'
        ],
        tips: 'Focus on signs that are most relevant to your daily communication needs.'
      },
      {
        id: 3,
        title: 'Sentence Formation',
        content: 'Learn to combine signs into meaningful sentences.',
        tasks: [
          'Practice basic sentence structures',
          'Use proper sign order',
          'Include facial expressions and body language'
        ],
        tips: 'Start with simple sentences and gradually increase complexity.'
      }
    ],
    advanced: [
      {
        id: 1,
        title: 'Advanced Signing Techniques',
        content: 'Master complex signing patterns and improve fluency.',
        tasks: [
          'Practice rapid sign sequences',
          'Work on regional sign variations',
          'Develop your own signing style'
        ],
        tips: 'Join signing communities to practice with others and learn regional variations.'
      },
      {
        id: 2,
        title: 'Teaching Others',
        content: 'Share your knowledge and help others learn sign language.',
        tasks: [
          'Mentor beginner signers',
          'Create educational content',
          'Participate in community events'
        ],
        tips: 'Teaching others is one of the best ways to reinforce your own learning.'
      },
      {
        id: 3,
        title: 'Professional Applications',
        content: 'Apply your signing skills in professional settings.',
        tasks: [
          'Practice workplace-specific signs',
          'Learn industry terminology',
          'Develop interpreting skills'
        ],
        tips: 'Consider pursuing formal certification in sign language interpretation.'
      }
    ]
  };

  const currentSteps = guideSteps[userLevel];
  const currentStepData = currentSteps[currentStep];

  const nextStep = () => {
    if (currentStep < currentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeStep = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const getProgressPercentage = () => {
    return Math.round(((currentStep + 1) / currentSteps.length) * 100);
  };

  const getPersonalizedRecommendations = () => {
    const recommendations = [];
    
    if (topSigns.length > 0) {
      const mostPracticed = topSigns[0];
      recommendations.push(`Focus on improving your "${mostPracticed.SignDetected}" sign - it's your most practiced gesture.`);
    }
    
    if (signDataList.length < 5) {
      recommendations.push('Try to practice more frequently to build consistency in your signing.');
    }
    
    if (userLevel === 'beginner') {
      recommendations.push('Start with basic signs and gradually work your way up to more complex gestures.');
    }
    
    return recommendations;
  };

  const recommendations = getPersonalizedRecommendations();

  return (
    <div className="interactive-guide">
      <div className="guide-header">
        <h2>🎓 Interactive Learning Guide</h2>
        <p>Personalized guidance based on your current skill level: <span className="user-level">{userLevel.toUpperCase()}</span></p>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Step {currentStep + 1} of {currentSteps.length} ({getProgressPercentage()}%)
        </div>
      </div>

      {/* Current Step Content */}
      <div className="step-content">
        <div className="step-header">
          <h3>{currentStepData.title}</h3>
          <p>{currentStepData.content}</p>
        </div>

        <div className="step-tasks">
          <h4>📋 Tasks to Complete:</h4>
          <ul>
            {currentStepData.tasks.map((task, index) => (
              <li key={index}>
                <input 
                  type="checkbox" 
                  id={`task-${currentStepData.id}-${index}`}
                  onChange={() => completeStep(`${currentStepData.id}-${index}`)}
                />
                <label htmlFor={`task-${currentStepData.id}-${index}`}>{task}</label>
              </li>
            ))}
          </ul>
        </div>

        <div className="step-tips">
          <h4>💡 Pro Tip:</h4>
          <p>{currentStepData.tips}</p>
        </div>

        <div className="step-actions">
          <button 
            onClick={prevStep} 
            disabled={currentStep === 0}
            className="nav-button prev"
          >
            ← Previous
          </button>
          
          <button 
            onClick={() => completeStep(currentStepData.id)}
            className="complete-button"
          >
            ✓ Mark Complete
          </button>
          
          <button 
            onClick={nextStep} 
            disabled={currentStep === currentSteps.length - 1}
            className="nav-button next"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="recommendations-section">
        <h3>🎯 Personalized Recommendations</h3>
        <div className="recommendations-list">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="recommendation-item">
              <span className="recommendation-icon">💡</span>
              <span className="recommendation-text">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Challenges */}
      <div className="challenges-section">
        <h3>🏆 Practice Challenges</h3>
        <div className="challenges-grid">
          <div className="challenge-card">
            <h4>🎯 Daily Practice</h4>
            <p>Practice for 15 minutes every day</p>
            <div className="challenge-progress">
              <div className="progress-bar-small">
                <div className="progress-fill-small" style={{ width: '60%' }}></div>
              </div>
              <span>3/5 days this week</span>
            </div>
          </div>
          
          <div className="challenge-card">
            <h4>📚 Learn New Signs</h4>
            <p>Master 5 new signs this week</p>
            <div className="challenge-progress">
              <div className="progress-bar-small">
                <div className="progress-fill-small" style={{ width: '40%' }}></div>
              </div>
              <span>2/5 signs learned</span>
            </div>
          </div>
          
          <div className="challenge-card">
            <h4>🎬 Record Yourself</h4>
            <p>Record 3 practice sessions</p>
            <div className="challenge-progress">
              <div className="progress-bar-small">
                <div className="progress-fill-small" style={{ width: '100%' }}></div>
              </div>
              <span>3/3 sessions recorded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Quiz */}
      <div className="quiz-section">
        <h3>🧠 Quick Knowledge Check</h3>
        <button 
          onClick={() => setShowQuiz(!showQuiz)}
          className="quiz-toggle"
        >
          {showQuiz ? 'Hide Quiz' : 'Take Quick Quiz'}
        </button>
        
        {showQuiz && (
          <div className="quiz-content">
            <div className="quiz-question">
              <h4>What is the most important factor for accurate sign recognition?</h4>
              <div className="quiz-options">
                <label>
                  <input type="radio" name="quiz1" value="speed" />
                  Signing speed
                </label>
                <label>
                  <input type="radio" name="quiz1" value="lighting" />
                  Good lighting and hand visibility
                </label>
                <label>
                  <input type="radio" name="quiz1" value="complexity" />
                  Complex hand movements
                </label>
              </div>
            </div>
            
            <div className="quiz-question">
              <h4>How often should you practice to improve your signing skills?</h4>
              <div className="quiz-options">
                <label>
                  <input type="radio" name="quiz2" value="weekly" />
                  Once a week
                </label>
                <label>
                  <input type="radio" name="quiz2" value="daily" />
                  Daily for best results
                </label>
                <label>
                  <input type="radio" name="quiz2" value="monthly" />
                  Once a month
                </label>
              </div>
            </div>
            
            <button className="submit-quiz">Submit Answers</button>
          </div>
        )}
      </div>

      {/* Resources and Next Steps */}
      <div className="next-steps-section">
        <h3>🚀 Next Steps</h3>
        <div className="next-steps-grid">
          <div className="next-step-card">
            <h4>📖 Continue Learning</h4>
            <p>Move to the next level of your learning journey</p>
            <button className="action-button">Start Next Level</button>
          </div>
          
          <div className="next-step-card">
            <h4>🎯 Set Goals</h4>
            <p>Define specific learning objectives for yourself</p>
            <button className="action-button">Set Goals</button>
          </div>
          
          <div className="next-step-card">
            <h4>👥 Join Community</h4>
            <p>Connect with other learners and practice together</p>
            <button className="action-button">Join Community</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveGuide;