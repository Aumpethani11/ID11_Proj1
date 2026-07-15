import React, { useState, useRef, useEffect } from 'react';
import { ExerciseType, Difficulty } from '../constants';
import { verifySign } from '../../services/signModelService';
import { SIGN_IMAGES, getSignImage } from '../../constants/signImages';

// Dictionary for descriptions in the practice screen
const SIGN_DESCRIPTIONS = {
  "A": "Fist with thumb on the side.",
  "B": "Flat hand, thumb tucked across palm.",
  "C": "Curved hand like the letter C.",
  "D": "Index up, others circle with thumb.",
  "E": "Fingers curled, thumb tucked under.",
  "F": "Index and thumb touch (OK sign).",
  "G": "Index and thumb pointing sideways.",
  "H": "Index and middle pointing sideways.",
  "I": "Pinky finger straight up.",
  "J": "Pinky traces a J in the air.",
  "K": "Index up, middle out, thumb on middle.",
  "L": "Index up and thumb out (L shape).",
  "M": "Three fingers over the thumb.",
  "N": "Two fingers over the thumb.",
  "O": "All fingers touch thumb in an O.",
  "P": "Downward pointing K shape.",
  "Q": "Downward pointing G shape.",
  "R": "Index and middle fingers crossed.",
  "S": "Tight fist, thumb across front.",
  "T": "Thumb tucked under index finger.",
  "U": "Index and middle up and touching.",
  "V": "Index and middle up and spread.",
  "W": "Three middle fingers spread up.",
  "X": "Hooked index finger.",
  "Y": "Pinky and thumb out."
};

function ExerciseScreen({ lesson, onFinish, onQuit, difficulty }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [xp, setXp] = useState(0);
  const [showHint, setShowHint] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const currentExercise = lesson.exercises[currentIndex];

  useEffect(() => {
    if (currentExercise.type === ExerciseType.SIGN_PRACTICE) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [currentIndex, currentExercise]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        return canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
      }
    }
    return null;
  };

  const handleCheck = async () => {
    setIsChecking(true);
    
    if (currentExercise.type === ExerciseType.MULTIPLE_CHOICE) {
      const isCorrect = selectedOption === currentExercise.correctOption;
      setFeedback({
        isCorrect,
        message: isCorrect ? "Excellent job!" : `Oops! The correct answer was ${currentExercise.correctOption}.`
      });
      if (isCorrect) setXp(prev => prev + 10);
    } else if (currentExercise.type === ExerciseType.SIGN_PRACTICE) {
      const frame = captureFrame();
      if (frame) {
        const result = await verifySign(frame, currentExercise.targetSign);
        setFeedback({
          isCorrect: result.correct,
          message: result.feedback
        });
        if (result.correct) setXp(prev => prev + 15);
      }
    }
    
    setIsChecking(false);
  };

  const handleNext = () => {
    setFeedback(null);
    setSelectedOption(null);
    if (currentIndex < lesson.exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      stopCamera();
      onFinish(xp);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col h-full font-nunito">
      {/* Top Bar */}
      <div className="flex items-center gap-4 p-4 sm:p-6 max-w-5xl mx-auto w-full">
        <button onClick={onQuit} className="text-[#777] text-2xl hover:text-gray-900 transition-colors">
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="flex-1 h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#58cc02] progress-bar-transition" 
            style={{ width: `${((currentIndex) / lesson.exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-5xl mx-auto w-full overflow-y-auto">
        <h2 className="text-xl sm:text-3xl font-black text-[#4b4b4b] mb-6 sm:mb-10 text-center leading-tight">
          {currentExercise.question}
        </h2>

        {currentExercise.type === ExerciseType.MULTIPLE_CHOICE && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-3xl">
            {currentExercise.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => !feedback && setSelectedOption(opt)}
                className={`
                  p-8 sm:p-12 rounded-3xl border-2 text-3xl sm:text-5xl font-black transition-all transform active:scale-95
                  ${selectedOption === opt 
                    ? 'border-[#1cb0f6] bg-[#ddf4ff] text-[#1cb0f6] shadow-[0_4px_0_0_#1899d6]' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-400 shadow-[0_4px_0_0_#e5e5e5]'}
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {currentExercise.type === ExerciseType.SIGN_PRACTICE && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full">
            {/* Camera View */}
            <div className="relative w-full max-w-md aspect-video bg-gray-100 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-100 group">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover -scale-x-100"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/20">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Live Analysis
              </div>
            </div>

            {/* Reference Guide Panel */}
            {showHint && currentExercise.targetSign && (
              <div className="w-full max-w-[360px] bg-white border-2 border-gray-200 rounded-[2rem] p-6 shadow-xl relative animate-in slide-in-from-right duration-300">
                <div className="flex flex-col items-center text-center">
                   <div className="w-44 h-44 sm:w-56 sm:h-56 bg-[#ddf4ff] rounded-2xl mb-4 flex items-center justify-center overflow-hidden border-2 border-[#1cb0f6]/20">
                      <img 
                        src={getSignImage(currentExercise.targetSign)}
                        alt={`ASL Sign for ${currentExercise.targetSign}`}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = SIGN_IMAGES.default;
                        }}
                      />
                   </div>
                   <h3 className="text-2xl font-black text-[#1cb0f6] mb-1">Letter {currentExercise.targetSign}</h3>
                   <p className="text-sm font-bold text-gray-500 leading-tight">
                     {SIGN_DESCRIPTIONS[currentExercise.targetSign] || "Form the sign as shown above."}
                   </p>
                </div>
                
                {difficulty === Difficulty.HARD && (
                   <button 
                     onClick={() => setShowHint(false)}
                     className="absolute -top-3 -right-3 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200 hover:bg-gray-200 transition-colors"
                   >
                     <i className="fa-solid fa-xmark text-xs"></i>
                   </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Action Area */}
      <footer className={`p-6 sm:p-10 border-t-2 border-gray-200 transition-colors duration-300 ${feedback ? (feedback.isCorrect ? 'bg-[#d7ffb8]' : 'bg-[#ffdfe0]') : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            {feedback && (
              <div className={`flex items-start gap-4 ${feedback.isCorrect ? 'text-[#46a302]' : 'text-[#ff4b4b]'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-md flex-shrink-0`}>
                  <i className={`fa-solid ${feedback.isCorrect ? 'fa-check' : 'fa-xmark'} text-2xl`}></i>
                </div>
                <div>
                  <h3 className="font-black text-2xl uppercase tracking-tighter leading-none mb-1">
                    {feedback.isCorrect ? 'Brilliant!' : 'Not quite...'}
                  </h3>
                  <p className="font-bold text-lg opacity-90">{feedback.message}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={feedback ? handleNext : handleCheck}
            disabled={(!selectedOption && currentExercise.type === ExerciseType.MULTIPLE_CHOICE && !feedback) || isChecking}
            className={`
              w-full sm:w-auto px-16 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 text-lg
              ${isChecking ? 'bg-gray-300 cursor-wait' : 
                feedback ? (feedback.isCorrect ? 'bg-[#58cc02] shadow-[0_4px_0_0_#46a302]' : 'bg-[#ff4b4b] shadow-[0_4px_0_0_#d33131]') : 
                (selectedOption || currentExercise.type === ExerciseType.SIGN_PRACTICE ? 'bg-[#58cc02] shadow-[0_4px_0_0_#46a302]' : 'bg-gray-200 text-gray-400')}
              text-white
            `}
          >
            {isChecking ? (
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Checking
              </div>
            ) : feedback ? 'Got it' : 'Check'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default ExerciseScreen;
