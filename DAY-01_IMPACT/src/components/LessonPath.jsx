import React from 'react';
import { Difficulty, DIFFICULTY_LABELS } from '../constants';

function LessonPath({ units, completedLessons, onStartLesson, difficulty, setDifficulty }) {
  const visibleUnits = units.filter((unit) => unit.difficulty === difficulty);

  return (
    <div className="flex flex-col items-center py-8 pb-32 max-w-2xl mx-auto px-4">
      {/* Difficulty Selector */}
      <div className="w-full mb-4 flex flex-col items-center gap-3">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
          Choose your level
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {Object.values(Difficulty).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all border-2 ${
                difficulty === d
                  ? d === Difficulty.EASY
                    ? 'bg-[#58cc02] text-white border-[#58cc02]'
                    : d === Difficulty.INTERMEDIATE
                      ? 'bg-[#1cb0f6] text-white border-[#1cb0f6]'
                      : 'bg-[#ff4b4b] text-white border-[#ff4b4b]'
                  : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
        <p className="text-sm font-bold text-gray-500 text-center max-w-md">
          {difficulty === Difficulty.EASY &&
            'Numbers first, then everyday words, then open letter shapes.'}
          {difficulty === Difficulty.INTERMEDIATE &&
            'Numbers 3–6, social words, then mid-alphabet letters.'}
          {difficulty === Difficulty.HARD &&
            'Numbers 7–9, advanced words, then precision letters.'}
        </p>
      </div>

      {visibleUnits.map((unit) => (
        <section key={unit.id} className="w-full mb-12">
          <div className={`${unit.color} text-white p-6 rounded-2xl mb-8 flex items-center justify-between shadow-lg`}>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide">{unit.title}</h2>
              <p className="font-bold opacity-80">{unit.description}</p>
            </div>
            <div className="hidden sm:block">
              <i className="fa-solid fa-book-open text-4xl opacity-50"></i>
            </div>
          </div>

          <div className="flex flex-col items-center gap-12 relative">
            <div className="absolute top-0 bottom-0 w-2 bg-gray-200 left-1/2 -translate-x-1/2 -z-10"></div>

            {unit.lessons.map((lesson, idx) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isAvailable = idx === 0 || completedLessons.includes(unit.lessons[idx - 1].id);
              const offset = idx % 2 === 0 ? 'translate-x-[-30px]' : 'translate-x-[30px]';

              return (
                <div key={lesson.id} className={`relative group ${offset}`}>
                  <button
                    onClick={() => isAvailable && onStartLesson(lesson.id)}
                    className={`
                      w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-transform active:scale-95 path-node
                      ${isCompleted ? 'bg-[#58cc02] text-white node-active-shadow' :
                        isAvailable ? 'bg-[#58cc02] text-white node-active-shadow' :
                        'bg-gray-200 text-gray-400 node-shadow cursor-not-allowed'}
                    `}
                  >
                    <i className={`fa-solid ${isCompleted ? 'fa-check' : 'fa-star'}`}></i>
                  </button>

                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold uppercase">
                    {lesson.title}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {visibleUnits.length === 0 && (
        <p className="text-gray-400 font-bold mt-10">No lessons for this level yet.</p>
      )}
    </div>
  );
}

export default LessonPath;
