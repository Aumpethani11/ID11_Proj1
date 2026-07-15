import React from 'react';
import { UNITS, ExerciseType } from '../constants';

function PracticeTab({ stats, onStartPractice }) {
  const allExercises = UNITS.flatMap(u => u.lessons.flatMap(l => l.exercises));
  const allSigns = [...new Set(allExercises.filter(e => e.targetSign).map(e => e.targetSign))];

  const generateAlphabetBlitz = () => {
    // Select 10 random letters from A-Z
    const shuffled = [...allSigns].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    
    const exercises = selected.map((sign, i) => ({
      id: `practice-blitz-${i}`,
      type: i % 2 === 0 ? ExerciseType.SIGN_PRACTICE : ExerciseType.MULTIPLE_CHOICE,
      question: i % 2 === 0 ? `Show me the letter '${sign}'` : `Which letter is this?`,
      targetSign: sign,
      options: [sign, allSigns[Math.floor(Math.random() * allSigns.length)], allSigns[Math.floor(Math.random() * allSigns.length)]].sort(() => 0.5 - Math.random()),
      correctOption: sign
    }));

    onStartPractice({
      id: 'practice-blitz',
      title: 'Alphabet Blitz',
      exercises
    });
  };

  const generateSpeedDrill = () => {
    // 5 rapid-fire sign practices
    const shuffled = [...allSigns].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    const exercises = selected.map((sign, i) => ({
      id: `practice-speed-${i}`,
      type: ExerciseType.SIGN_PRACTICE,
      question: `Sign '${sign}' as fast as you can!`,
      targetSign: sign
    }));

    onStartPractice({
      id: 'practice-speed',
      title: 'Speed Drill',
      exercises
    });
  };

  const generatePersonalizedReview = () => {
    // Only letters from completed units
    const completedUnitLetters = UNITS
      .filter(u => u.lessons.some(l => stats.completedLessons.includes(l.id)))
      .flatMap(u => u.lessons.flatMap(l => l.exercises.filter(e => e.targetSign).map(e => e.targetSign)));
    
    const pool = completedUnitLetters.length > 0 ? completedUnitLetters : allSigns.slice(0, 5);
    const shuffled = [...new Set(pool)].sort(() => 0.5 - Math.random()).slice(0, 8);

    const exercises = shuffled.map((sign, i) => ({
      id: `practice-review-${i}`,
      type: ExerciseType.SIGN_PRACTICE,
      question: `Let's review the letter '${sign}'`,
      targetSign: sign
    }));

    onStartPractice({
      id: 'practice-review',
      title: 'Mastery Review',
      exercises
    });
  };

  const practiceModes = [
    {
      title: "Mastery Review",
      description: "Focus on signs from your completed lessons.",
      icon: "fa-bullseye",
      color: "bg-[#58cc02]",
      borderColor: "border-[#46a302]",
      onClick: generatePersonalizedReview
    },
    {
      title: "Alphabet Blitz",
      description: "10 random letters to test your general knowledge.",
      icon: "fa-bolt",
      color: "bg-[#1cb0f6]",
      borderColor: "border-[#1899d6]",
      onClick: generateAlphabetBlitz
    },
    {
      title: "Speed Drill",
      description: "A fast-paced camera session. No multiple choice!",
      icon: "fa-fire",
      color: "bg-[#ff4b4b]",
      borderColor: "border-[#d33131]",
      onClick: generateSpeedDrill
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-black text-[#4b4b4b] uppercase tracking-tight">Practice Hub</h2>
        <p className="text-gray-500 font-bold">Refine your skills and earn extra XP!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practiceModes.map((mode, i) => (
          <button
            key={i}
            onClick={mode.onClick}
            className="group relative flex flex-col items-center p-8 bg-white border-2 border-gray-200 rounded-3xl hover:border-gray-300 transition-all hover:-translate-y-1 active:translate-y-0"
          >
            <div className={`w-20 h-20 ${mode.color} rounded-2xl flex items-center justify-center text-white text-3xl mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
              <i className={`fa-solid ${mode.icon}`}></i>
            </div>
            <h3 className="text-xl font-black text-[#4b4b4b] mb-2">{mode.title}</h3>
            <p className="text-sm font-bold text-gray-400 text-center px-2">{mode.description}</p>
            
            <div className="mt-8 flex items-center gap-2 text-[#ff9600] font-black">
              <i className="fa-solid fa-bolt"></i>
              <span>+15 XP</span>
            </div>
          </button>
        ))}
      </div>

      {/* Mastery Stats Section */}
      <div className="mt-16 bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#1cb0f6] text-2xl shadow-sm">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <h4 className="text-xl font-black text-[#4b4b4b]">Mastery Progress</h4>
              <p className="text-gray-400 font-bold">You've unlocked {stats.completedLessons.length} lessons</p>
            </div>
          </div>
          <div className="w-full sm:w-48 h-4 bg-gray-200 rounded-full overflow-hidden">
             <div 
              className="h-full bg-[#1cb0f6] transition-all duration-1000" 
              style={{ width: `${(stats.completedLessons.length / 10) * 100}%` }}
             />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PracticeTab;
