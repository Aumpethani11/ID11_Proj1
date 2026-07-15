import React, { useMemo, useState } from 'react';
import {
  Difficulty,
  DIFFICULTY_LABELS,
  ExerciseType,
  SIGN_LIBRARY,
  sortNumbersFirst,
  formatSignTitle,
  formatSignPromptLabel,
} from './constants';
import { SIGN_IMAGES, getSignImage } from '../../constants/signImages';

function SignsTab({ onStartPractice }) {
  const [search, setSearch] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all'); // all | letter | number
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // all | EASY | ...

  const filteredSigns = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SIGN_LIBRARY.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (difficultyFilter !== 'all' && item.difficulty !== difficultyFilter) return false;
      if (!query) return true;
      return (
        item.sign.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        DIFFICULTY_LABELS[item.difficulty].toLowerCase().includes(query)
      );
    });
  }, [search, categoryFilter, difficultyFilter]);

  const groupedByDifficulty = useMemo(() => {
    const groups = {
      [Difficulty.EASY]: [],
      [Difficulty.INTERMEDIATE]: [],
      [Difficulty.HARD]: [],
    };
    filteredSigns.forEach((item) => {
      groups[item.difficulty].push(item);
    });
    // Numbers → words → letters within each level
    Object.keys(groups).forEach((key) => {
      groups[key] = sortNumbersFirst(groups[key]);
    });
    return groups;
  }, [filteredSigns]);

  const handleSignClick = (item) => {
    const quickLesson = {
      id: `quick-${item.sign}`,
      title: `Practice: ${formatSignTitle(item)}`,
      exercises: [
        {
          id: `ex-quick-${item.sign}`,
          type: ExerciseType.SIGN_PRACTICE,
          question: `Show me the ${formatSignPromptLabel(item.sign)}`,
          targetSign: item.sign,
        },
      ],
    };
    onStartPractice(quickLesson);
  };

  const handlePracticeAll = () => {
    const pool = filteredSigns.length > 0 ? filteredSigns : SIGN_LIBRARY;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const exercises = shuffled.map((item, idx) => ({
      id: `all-practice-${item.sign}-${idx}`,
      type: ExerciseType.SIGN_PRACTICE,
      question: `Sign the ${formatSignPromptLabel(item.sign)}`,
      targetSign: item.sign,
    }));

    onStartPractice({
      id: 'full-signs-practice',
      title: 'Sign Marathon',
      exercises,
    });
  };

  const openVideo = (e, sign) => {
    e.stopPropagation();
    setActiveVideo(sign);
  };

  const activeItem = SIGN_LIBRARY.find((item) => item.sign === activeVideo);

  const difficultyBadgeClass = (difficulty) => {
    if (difficulty === Difficulty.EASY) return 'bg-[#d7ffb8] text-[#46a302]';
    if (difficulty === Difficulty.INTERMEDIATE) return 'bg-[#ddf4ff] text-[#1cb0f6]';
    return 'bg-[#ffdfe0] text-[#ff4b4b]';
  };

  const renderSignCard = (item) => (
    <div
      key={item.sign}
      onClick={() => handleSignClick(item)}
      className="group relative bg-white border-2 border-gray-200 rounded-3xl p-5 flex items-center gap-5 transition-all hover:border-[#1cb0f6] hover:-translate-y-1 hover:shadow-xl active:translate-y-0 cursor-pointer"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl flex flex-shrink-0 items-center justify-center group-hover:bg-[#ddf4ff] transition-colors">
        <div className="relative">
          <i className="fa-solid fa-hand-asl-interpreting text-3xl sm:text-4xl text-gray-200 group-hover:text-[#1cb0f6] transition-colors"></i>
          <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-black text-[#4b4b4b]">
            {item.sign}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-black text-[#4b4b4b] leading-none mb-1">
              {formatSignTitle(item)}
            </h3>
            <span
              className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${difficultyBadgeClass(item.difficulty)}`}
            >
              {DIFFICULTY_LABELS[item.difficulty]}
            </span>
          </div>
          <button
            onClick={(e) => openVideo(e, item.sign)}
            className="w-8 h-8 rounded-full bg-[#1cb0f61a] text-[#1cb0f6] flex items-center justify-center hover:bg-[#1cb0f633] transition-colors flex-shrink-0"
            title="Watch Demonstration"
          >
            <i className="fa-solid fa-play text-xs"></i>
          </button>
        </div>
        <p className="text-xs font-bold text-gray-400 leading-tight mt-2">{item.desc}</p>
        <div className="mt-2 text-[10px] font-black uppercase text-[#1cb0f6] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Practice now <i className="fa-solid fa-camera"></i>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-32">
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-black text-[#4b4b4b] uppercase tracking-tight">ASL Dictionary</h2>
          <p className="text-gray-500 font-bold">
            All model signs: numbers, words, and letters A–Y — by difficulty.
          </p>
        </div>

        <button
          onClick={handlePracticeAll}
          className="bg-[#58cc02] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_4px_0_0_#46a302] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <i className="fa-solid fa-layer-group"></i>
          Practice Filtered Signs
        </button>
      </div>

      <div className="mb-6 relative max-w-md mx-auto lg:mx-0">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-x-1/2 text-gray-400"></i>
        <input
          type="text"
          placeholder="Search numbers, words, or letters..."
          className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-2xl font-bold text-[#4b4b4b] focus:outline-none focus:border-[#1cb0f6] transition-colors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mb-10 flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All' },
            { id: 'number', label: 'Numbers' },
            { id: 'word', label: 'Words' },
            { id: 'letter', label: 'Letters' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setCategoryFilter(opt.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                categoryFilter === opt.id
                  ? 'bg-[#1cb0f6] text-white border-[#1cb0f6]'
                  : 'bg-white text-gray-400 border-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All levels' },
            ...Object.values(Difficulty).map((d) => ({
              id: d,
              label: DIFFICULTY_LABELS[d],
            })),
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setDifficultyFilter(opt.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                difficultyFilter === opt.id
                  ? 'bg-[#ff9600] text-white border-[#ff9600]'
                  : 'bg-white text-gray-400 border-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {Object.values(Difficulty).map((diff) => {
        const items = groupedByDifficulty[diff];
        if (!items.length) return null;
        return (
          <section key={diff} className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-xl font-black text-[#4b4b4b] uppercase tracking-tight">
                {DIFFICULTY_LABELS[diff]}
              </h3>
              <span className="text-xs font-bold text-gray-400">
                {items.length} sign{items.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {items.map(renderSignCard)}
            </div>
          </section>
        );
      })}

      {activeVideo && activeItem && (
        <div
          className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-6 backdrop-blur-sm"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-white rounded-[2.5rem] p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>

            <div className="w-64 h-64 sm:w-80 sm:h-80 bg-[#ddf4ff] rounded-[2rem] flex items-center justify-center overflow-hidden border-4 border-[#1cb0f6]/20 mb-6">
              <img
                src={getSignImage(activeVideo)}
                alt={`ASL for ${activeVideo}`}
                className="w-full h-full object-contain mix-blend-multiply"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = SIGN_IMAGES.default;
                }}
              />
            </div>

            <h2 className="text-3xl font-black text-[#4b4b4b] mb-1">
              {formatSignTitle(activeItem)}
            </h2>
            <span
              className={`mb-3 inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${difficultyBadgeClass(activeItem.difficulty)}`}
            >
              {DIFFICULTY_LABELS[activeItem.difficulty]}
            </span>
            <p className="text-gray-500 font-bold mb-8">{activeItem.desc}</p>

            <button
              onClick={() => {
                handleSignClick(activeItem);
                setActiveVideo(null);
              }}
              className="w-full bg-[#1cb0f6] text-white py-4 rounded-2xl font-black uppercase tracking-wider shadow-[0_4px_0_0_#1899d6] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-camera"></i>
              Try Practicing
            </button>
          </div>
        </div>
      )}

      {filteredSigns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <i className="fa-solid fa-face-frown text-6xl text-gray-200 mb-4"></i>
          <h3 className="text-xl font-black text-gray-400 uppercase">No signs found</h3>
          <p className="text-gray-500 font-bold">Try a different filter or search.</p>
        </div>
      )}
    </div>
  );
}

export default SignsTab;
