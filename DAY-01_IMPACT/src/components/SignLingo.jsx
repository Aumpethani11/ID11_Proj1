import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import LessonPath from './LessonPath';
import PracticeTab from './PracticeTab';
import SignsTab from './SignsTab';
import ExerciseScreen from './ExerciseScreen';
import { UNITS, Difficulty } from '../constants';

function SignLingo() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeLesson, setActiveLesson] = useState(null);
  const [difficulty, setDifficulty] = useState(Difficulty.INTERMEDIATE);

  const [stats, setStats] = useState({
    xp: 0,
    streak: 3,
    hearts: 5,
    gems: 420,
    completedLessons: []
  });

  const handleStartLesson = (lessonId) => {
    const lesson = UNITS.flatMap(u => u.lessons).find(l => l.id === lessonId);
    if (lesson) {
      setActiveLesson(lesson);
    }
  };

  const handleStartPractice = (lesson) => {
    setActiveLesson(lesson);
  };

  const handleFinishLesson = (xpGained) => {
    if (activeLesson) {
      const isRealLesson = UNITS.flatMap(u => u.lessons).some(l => l.id === activeLesson.id);
      
      setStats(prev => ({
        ...prev,
        xp: prev.xp + xpGained,
        completedLessons: isRealLesson 
          ? [...new Set([...prev.completedLessons, activeLesson.id])]
          : prev.completedLessons
      }));
      setActiveLesson(null);
    }
  };

  const handleQuitLesson = () => {
    setActiveLesson(null);
  };

  const renderContent = () => {
    if (activeLesson) {
      return (
        <ExerciseScreen
          lesson={activeLesson}
          onFinish={handleFinishLesson}
          onQuit={handleQuitLesson}
          difficulty={difficulty}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <LessonPath
            units={UNITS}
            completedLessons={stats.completedLessons}
            onStartLesson={handleStartLesson}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        );
      case 'practice':
        return (
          <PracticeTab
            stats={stats}
            onStartPractice={handleStartPractice}
          />
        );
      case 'signs':
        return (
          <SignsTab
            onStartPractice={handleStartPractice}
          />
        );
      default:
        return (
          <LessonPath
            units={UNITS}
            completedLessons={stats.completedLessons}
            onStartLesson={handleStartLesson}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header stats={stats} />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default SignLingo;
