import React, { useState } from 'react';
import { ExerciseType } from '../constants';

const ALPHABET_DATA = [
  { letter: "A", desc: "Fist with thumb on the side." },
  { letter: "B", desc: "Flat hand, thumb tucked across palm." },
  { letter: "C", desc: "Curved hand like the letter C." },
  { letter: "D", desc: "Index up, others circle with thumb." },
  { letter: "E", desc: "Fingers curled, thumb tucked under." },
  { letter: "F", desc: "Index and thumb touch (OK sign)." },
  { letter: "G", desc: "Index and thumb pointing sideways." },
  { letter: "H", desc: "Index and middle pointing sideways." },
  { letter: "I", desc: "Pinky finger straight up." },
  { letter: "J", desc: "Pinky traces a J in the air." },
  { letter: "K", desc: "Index up, middle out, thumb on middle." },
  { letter: "L", desc: "Index up and thumb out (L shape)." },
  { letter: "M", desc: "Three fingers over the thumb." },
  { letter: "N", desc: "Two fingers over the thumb." },
  { letter: "O", desc: "All fingers touch thumb in an O." },
  { letter: "P", desc: "Downward pointing K shape." },
  { letter: "Q", desc: "Downward pointing G shape." },
  { letter: "R", desc: "Index and middle fingers crossed." },
  { letter: "S", desc: "Tight fist, thumb across front." },
  { letter: "T", desc: "Thumb tucked under index finger." },
  { letter: "U", desc: "Index and middle up and touching." },
  { letter: "V", desc: "Index and middle up and spread." },
  { letter: "W", desc: "Three middle fingers spread up." },
  { letter: "X", desc: "Hooked index finger." },
  { letter: "Y", desc: "Pinky and thumb out." },
  { letter: "Z", desc: "Index draws a Z in the air." }
];

function SignsTab({ onStartPractice }) {
  const [search, setSearch] = useState("");
  const [activeVideo, setActiveVideo] = useState(null);
  
  const filteredAlphabet = ALPHABET_DATA.filter(item => 
    item.letter.toLowerCase().includes(search.toLowerCase())
  );

  const handleLetterClick = (item) => {
    const quickLesson = {
      id: `quick-${item.letter}`,
      title: `Practice: ${item.letter}`,
      exercises: [
        {
          id: `ex-quick-${item.letter}`,
          type: ExerciseType.SIGN_PRACTICE,
          question: `Show me the letter '${item.letter}'`,
          targetSign: item.letter,
        }
      ]
    };
    onStartPractice(quickLesson);
  };

  const handlePracticeAll = () => {
    const shuffled = [...ALPHABET_DATA].sort(() => 0.5 - Math.random());
    const exercises = shuffled.map((item, idx) => ({
      id: `all-practice-${item.letter}-${idx}`,
      type: ExerciseType.SIGN_PRACTICE,
      question: `Sign the letter '${item.letter}'`,
      targetSign: item.letter,
    }));

    const fullLesson = {
      id: 'full-alphabet-practice',
      title: 'Full Alphabet Marathon',
      exercises
    };

    onStartPractice(fullLesson);
  };

  const openVideo = (e, letter) => {
    e.stopPropagation();
    setActiveVideo(letter);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-32">
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-black text-[#4b4b4b] uppercase tracking-tight">ASL Dictionary</h2>
          <p className="text-gray-500 font-bold">Watch demonstrations or tap to start live practice.</p>
        </div>
        
        <button 
          onClick={handlePracticeAll}
          className="bg-[#58cc02] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_4px_0_0_#46a302] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <i className="fa-solid fa-layer-group"></i>
          Practice All Signs
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-10 relative max-w-md mx-auto lg:mx-0">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input 
          type="text" 
          placeholder="Search for a letter..."
          className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-2xl font-bold text-[#4b4b4b] focus:outline-none focus:border-[#1cb0f6] transition-colors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAlphabet.map((item) => (
          <div 
            key={item.letter}
            onClick={() => handleLetterClick(item)}
            className="group relative bg-white border-2 border-gray-200 rounded-3xl p-5 flex items-center gap-5 transition-all hover:border-[#1cb0f6] hover:-translate-y-1 hover:shadow-xl active:translate-y-0 cursor-pointer"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl flex flex-shrink-0 items-center justify-center group-hover:bg-[#ddf4ff] transition-colors">
              <div className="relative">
                <i className="fa-solid fa-hand-asl-interpreting text-3xl sm:text-4xl text-gray-200 group-hover:text-[#1cb0f6] transition-colors"></i>
                <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-black text-[#4b4b4b]">
                  {item.letter}
                </span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-black text-[#4b4b4b] leading-none mb-1">{item.letter}</h3>
                <button 
                  onClick={(e) => openVideo(e, item.letter)}
                  className="w-8 h-8 rounded-full bg-[#1cb0f61a] text-[#1cb0f6] flex items-center justify-center hover:bg-[#1cb0f633] transition-colors"
                  title="Watch Demonstration"
                >
                  <i className="fa-solid fa-play text-xs"></i>
                </button>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-tight">
                {item.desc}
              </p>
              <div className="mt-2 text-[10px] font-black uppercase text-[#1cb0f6] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Practice now <i className="fa-solid fa-camera"></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Demonstration Modal */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-6 backdrop-blur-sm" onClick={() => setActiveVideo(null)}>
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            
            <div className="w-48 h-48 bg-[#ddf4ff] rounded-[2rem] flex items-center justify-center overflow-hidden border-4 border-[#1cb0f6]/20 mb-6">
              <img 
                src={`https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/${activeVideo.toLowerCase()}.gif`}
                alt={`ASL for ${activeVideo}`}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            
            <h2 className="text-3xl font-black text-[#4b4b4b] mb-1">Letter {activeVideo}</h2>
            <p className="text-gray-500 font-bold mb-8">
              {ALPHABET_DATA.find(a => a.letter === activeVideo)?.desc}
            </p>
            
            <button
              onClick={() => {
                const item = ALPHABET_DATA.find(a => a.letter === activeVideo);
                if (item) handleLetterClick(item);
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

      {filteredAlphabet.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <i className="fa-solid fa-face-frown text-6xl text-gray-200 mb-4"></i>
          <h3 className="text-xl font-black text-gray-400 uppercase">No letter found</h3>
          <p className="text-gray-500 font-bold">Try searching for something else!</p>
        </div>
      )}

      {/* Pro Tip Section */}
      <div className="mt-16 bg-[#ddf4ff] border-2 border-[#1cb0f6] rounded-[2rem] p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#1cb0f6] text-3xl shadow-sm flex-shrink-0">
          <i className="fa-solid fa-lightbulb"></i>
        </div>
        <div>
          <h4 className="text-xl font-black text-[#1cb0f6] uppercase tracking-tight">Pro Learning Tip</h4>
          <p className="text-[#1899d6] font-bold">
            Most ASL signs use your dominant hand. Try practicing in front of a mirror to see if your hand shapes match the dictionary exactly
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignsTab;
