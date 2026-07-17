import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Detect.css";
import "./AIChat.css";
import { v4 as uuidv4 } from "uuid";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import * as tf from "@tensorflow/tfjs";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import Webcam from "react-webcam";
import { SignImageData } from "../../data/SignImageData";
import { useDispatch, useSelector } from "react-redux";
import { addSignData } from "../../redux/actions/signdataaction";
import ProgressBar from "./ProgressBar/ProgressBar";
import DisplayImg from "../../assets/displayGif.gif";
import TextToSign from "./TextToSign";
import { getGroqResponse } from "../../utils/groqChat";
import { testGroqConnection } from "../../utils/groqChat";
import { checkApiKeys } from "../../config/apiKeys";
import {
  findSignByName,
  formatSentenceForDisplay,
} from "../../utils/signLookup";

let startTime = "";

const SIGN_LABELS = SignImageData.map((sign) => sign.name);
const publicUrl = process.env.PUBLIC_URL || "";
const publicAssetPath = (path) => `${publicUrl}${path}`;

const flattenHandLandmarks = (landmarks) => {
  const coords = landmarks.map((landmark) => [
    landmark.x,
    landmark.y,
    landmark.z,
  ]);
  const wrist = [...coords[0]];

  for (let i = 0; i < coords.length; i++) {
    coords[i][0] -= wrist[0];
    coords[i][1] -= wrist[1];
    coords[i][2] -= wrist[2];
  }

  const scale = Math.sqrt(
    coords[9][0] ** 2 + coords[9][1] ** 2 + coords[9][2] ** 2
  );

  if (scale > 1e-6) {
    for (let i = 0; i < coords.length; i++) {
      coords[i][0] /= scale;
      coords[i][1] /= scale;
      coords[i][2] /= scale;
    }
  }

  return coords.flat();
};

/**
 * Optional props keep Detect compatible with /detect while enabling chat:
 * - onSentenceReady: fired when a completed sign sentence is saved
 * - onGestureDetected: fired on each new predicted sign label
 * - requireAuth: when false, skips the login gate (used by SignUser chat)
 * - embedded: reserved for layout wrappers (SignInput)
 */
const Detect = ({
  onSentenceReady,
  onGestureDetected,
  onSentenceBuilding,
  requireAuth = true,
  embedded = false,
}) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const handLandmarkerRef = useRef(null);
  const classifierRef = useRef(null);
  const webcamRunningRef = useRef(false);
  const lastPredictedSignRef = useRef("");
  const onSentenceReadyRef = useRef(onSentenceReady);
  const onGestureDetectedRef = useRef(onGestureDetected);
  const onSentenceBuildingRef = useRef(onSentenceBuilding);

  const [webcamRunning, setWebcamRunning] = useState(false);
  const [gestureOutput, setGestureOutput] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [detectedData, setDetectedData] = useState([]);
  const user = useSelector((state) => state.auth?.user);
  const { accessToken } = useSelector((state) => state.auth);
  const canUseDetect = !requireAuth || Boolean(accessToken);
  const dispatch = useDispatch();
  const [currentImage, setCurrentImage] = useState(null);

  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  
  // New states for sentence building
  const [currentSentence, setCurrentSentence] = useState("");
  const [sentenceHistory, setSentenceHistory] = useState([]);
  const [isBuildingSentence, setIsBuildingSentence] = useState(false);
  const gestureTimeoutRef = useRef(null);
  const currentSentenceRef = useRef("");
  const speechDraftRef = useRef("");
  const embeddedRef = useRef(embedded);

  // AI Chat states
  const [aiResponse, setAiResponse] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // ------------------- Speech-to-Text States -------------------
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [speechHistory, setSpeechHistory] = useState([]);
  const [micPermission, setMicPermission] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [textToSignPayload, setTextToSignPayload] = useState({ text: "", key: 0 });

  useEffect(() => {
    onSentenceReadyRef.current = onSentenceReady;
  }, [onSentenceReady]);

  useEffect(() => {
    onGestureDetectedRef.current = onGestureDetected;
  }, [onGestureDetected]);

  useEffect(() => {
    onSentenceBuildingRef.current = onSentenceBuilding;
  }, [onSentenceBuilding]);

  useEffect(() => {
    embeddedRef.current = embedded;
  }, [embedded]);

  useEffect(() => {
    currentSentenceRef.current = currentSentence;
    const liveSpeech = `${transcript} ${interimTranscript}`.replace(/\s+/g, " ").trim();
    speechDraftRef.current = liveSpeech;

    const forming = embedded
      ? [currentSentence, liveSpeech].filter((part) => part && part.trim()).join(" ").trim()
      : currentSentence;

    if (typeof onSentenceBuildingRef.current === "function") {
      onSentenceBuildingRef.current(forming);
    }
  }, [currentSentence, transcript, interimTranscript, embedded]);

  // API checks on mount / language change
  useEffect(() => {
    checkApiKeys();
    testGroqConnection();
  }, [selectedLanguage]);

  // Handle canvas resizing when webcam dimensions change
  useEffect(() => {
    const handleResize = () => {
      if (webcamRef.current && canvasRef.current) {
        const video = webcamRef.current.video;
        if (video && video.videoWidth && video.videoHeight) {
          const displayWidth = video.offsetWidth;
          const displayHeight = video.offsetHeight;
          
          canvasRef.current.width = displayWidth;
          canvasRef.current.height = displayHeight;
        }
      }
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [webcamRunning]);

  // Initialize Speech Recognition
  useEffect(() => {
    const initSpeechRecognition = () => {
      // Check if browser supports Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;
        
        recognition.onstart = () => {
          setIsListening(true);
          setMicPermission(true);
          setTranscript("");
          setInterimTranscript("");
        };
        
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let liveInterimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const resultText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += resultText;
            } else {
              liveInterimTranscript += resultText;
            }
          }
          
          if (finalTranscript) {
            setTranscript(prev => prev + ' ' + finalTranscript);
            setInterimTranscript("");
          } else {
            setInterimTranscript(liveInterimTranscript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setMicPermission(false);
          }
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        setSpeechRecognition(recognition);
      } else {
        console.error('Speech recognition not supported in this browser');
      }
    };

    initSpeechRecognition();
  }, [selectedLanguage]);

  // Load sentence and speech history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('signLanguageSentenceHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setSentenceHistory(parsedHistory);
      } catch (error) {
        console.error('Error parsing saved sentence history:', error);
        setSentenceHistory([]);
      }
    }

    const savedSpeechHistory = localStorage.getItem('signLanguageSpeechHistory');
    if (savedSpeechHistory) {
      try {
        const parsedSpeechHistory = JSON.parse(savedSpeechHistory);
        setSpeechHistory(parsedSpeechHistory);
      } catch (error) {
        console.error('Error parsing saved speech history:', error);
        setSpeechHistory([]);
      }
    }
  }, []);

  // Save sentence history to localStorage whenever it changes
  useEffect(() => {
    if (sentenceHistory.length > 0) {
      localStorage.setItem('signLanguageSentenceHistory', JSON.stringify(sentenceHistory));
    }
  }, [sentenceHistory]);

  // Save speech history to localStorage whenever it changes
  useEffect(() => {
    if (speechHistory.length > 0) {
      localStorage.setItem('signLanguageSpeechHistory', JSON.stringify(speechHistory));
    }
  }, [speechHistory]);

  // Function to add word to sentence with proper spacing
  const addWordToSentence = useCallback((newWord) => {
    if (!newWord || newWord.trim() === "") return;
    
    setCurrentSentence(prev => {
      if (prev === "") {
        return newWord;
      } else {
        return prev + " " + newWord;
      }
    });
  }, []);

  // Sign detection stays silent — no TTS for detected signs/sentences
  const clearSentence = useCallback(() => {
    setCurrentSentence("");
    setIsBuildingSentence(false);
  }, []);

  // Function to save sentence to history
  const saveSentenceToHistory = useCallback(() => {
    const speechPart = embeddedRef.current
      ? String(speechDraftRef.current || "").trim()
      : "";
    const base = currentSentenceRef.current.trim();
    const sentence = [base, speechPart].filter(Boolean).join(" ").trim();

    if (sentence !== "") {
      const newHistoryItem = {
        id: Date.now(),
        sentence,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setSentenceHistory(prev => {
        const updatedHistory = [...prev, newHistoryItem];
        localStorage.setItem('signLanguageSentenceHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

      if (typeof onSentenceReadyRef.current === "function") {
        onSentenceReadyRef.current(sentence);
      }

      if (embeddedRef.current) {
        setTranscript("");
        setInterimTranscript("");
        speechDraftRef.current = "";
      }
      
      clearSentence();
    }
  }, [clearSentence]);

  // Function to clear all sentence history
  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all sentence history? This action cannot be undone.')) {
      setSentenceHistory([]);
      localStorage.removeItem('signLanguageSentenceHistory');
      console.log('Cleared all sentence history');
    }
  };

  // Function to export sentence history
  const exportSentenceHistory = () => {
    if (sentenceHistory.length === 0) {
      alert('No sentence history to export.');
      return;
    }

          try {
        // Extract only the sentences without timestamps or metadata
        const sentencesOnly = sentenceHistory.map(item => item.sentence);
        
        const exportData = {
          sentences: sentencesOnly
        };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sign-language-sentences.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      console.log('Exported sentence history:', exportData.totalSentences, 'sentences');
    } catch (error) {
      console.error('Error exporting sentence history:', error);
      alert('Failed to export sentence history. Please try again.');
    }
  };

  // Auto-build sentence whenever gestureOutput changes
  useEffect(() => {
    if (gestureOutput && gestureOutput.trim() !== "" && gestureOutput !== "none") {
      // Keep detection silent — cancel any leftover browser TTS
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      addWordToSentence(gestureOutput);
      setIsBuildingSentence(true);

      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }

      // Auto-complete sentence after 5 seconds of no new gestures
      gestureTimeoutRef.current = setTimeout(() => {
        if (currentSentenceRef.current.trim() !== "") {
          setTimeout(() => {
            saveSentenceToHistory();
          }, 1000);
        }
      }, 5000);
    }

    return () => {
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
    };
  }, [gestureOutput, addWordToSentence, saveSentenceToHistory]);

  // Complete / send the shared forming sentence (signs + speech)
  const manualCompleteSentence = () => {
    const speechPart = String(speechDraftRef.current || "").trim();
    const base = String(currentSentenceRef.current || currentSentence || "").trim();
    const combined = [base, speechPart].filter(Boolean).join(" ").trim();

    if (!combined) return;

    // Keep refs in sync so saveSentenceToHistory picks up the full text
    if (base) {
      currentSentenceRef.current = base;
    }

    if (embedded) {
      saveSentenceToHistory();
      return;
    }

    // Full Detect page: short delay so the last gesture can settle
    setTimeout(() => {
      saveSentenceToHistory();
    }, 800);
  };

  // ------------------- AI Chat Functions -------------------
  
  // Handle asking AI about the current sentence
  const handleAskAI = async () => {
    console.log('AI Chat button clicked! Current sentence:', currentSentence);
    
    if (!currentSentence || currentSentence.trim() === "") {
      alert("Please sign a sentence first!");
      return;
    }
    
    setIsAiProcessing(true);
    try {
      console.log('Calling Groq AI with sentence:', currentSentence);
      const response = await getGroqResponse(currentSentence);
      console.log('Groq AI Response:', response);
      setAiResponse(response);
    } catch (error) {
      console.error("Groq AI Chat Error:", error);
      setAiResponse("Sorry, I couldn't connect to the AI server.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Handle language change for speech recognition
  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    
    // If currently listening, stop and restart with new language
    if (isListening && speechRecognition) {
      try {
        speechRecognition.stop();
        // The useEffect will automatically restart with new language
      } catch (error) {
        console.error('Error stopping speech recognition for language change:', error);
      }
    }
  };

  // ------------------- Text-to-Sign Functions -------------------

  const sendToTextToSign = (text) => {
    if (!text || !text.trim()) return;
    setTextToSignPayload({ text: text.trim(), key: Date.now() });
  };

  const handleSignGenerated = (sign) => {
    if (sign?.name) {
      const matchingImage = findSignByName(sign.name);
      if (matchingImage) {
        setCurrentImage(matchingImage);
      }
    }
  };

  // ------------------- Speech-to-Text Functions -------------------
  
  // Start listening for speech
  const startListening = () => {
    if (speechRecognition && !isListening) {
      try {
        speechRecognition.start();
        setMicPermission(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  // Stop listening for speech
  const stopListening = () => {
    if (speechRecognition && isListening) {
      try {
        speechRecognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };

  // Save speech transcript to history
  const saveSpeechToHistory = () => {
    if (transcript && transcript.trim() !== "") {
      const newSpeechItem = {
        id: Date.now(),
        text: transcript.trim(),
        timestamp: new Date().toLocaleTimeString()
      };
      
      setSpeechHistory(prev => {
        const updatedHistory = [...prev, newSpeechItem];
        localStorage.setItem('signLanguageSpeechHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });
      
      setTranscript("");
      console.log('Speech saved:', newSpeechItem.text);
    }
  };

  // Clear speech transcript
  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
  };

  // Clear all speech history
  const clearAllSpeechHistory = () => {
    if (window.confirm('Are you sure you want to clear all speech history? This action cannot be undone.')) {
      setSpeechHistory([]);
      localStorage.removeItem('signLanguageSpeechHistory');
      console.log('Cleared all speech history');
    }
  };

  // Export speech history
  const exportSpeechHistory = () => {
    if (speechHistory.length === 0) {
      alert('No speech history to export.');
      return;
    }

    try {
      // Extract only the speech text without timestamps or metadata
      const speechTextOnly = speechHistory.map(item => item.text);
      
      const exportData = {
        speech: speechTextOnly
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'speech-to-text-history.json';
      link.click();
      
      URL.revokeObjectURL(url);
      console.log('Exported speech history:', speechTextOnly.length, 'entries');
    } catch (error) {
      console.error('Error exporting speech history:', error);
      alert('Failed to export speech history. Please try again.');
    }
  };

  // Update current image when gesture detected
  useEffect(() => {
    if (gestureOutput && gestureOutput.trim() !== "") {
      const matchingImage = findSignByName(gestureOutput);
      if (matchingImage) {
        setCurrentImage(matchingImage);
      } else {
        setCurrentImage({
          name: "Unknown",
          url: "/logo192.png",
        });
      }
    }
  }, [gestureOutput]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const resetDetectionOutput = useCallback(() => {
    setGestureOutput("");
    setProgress("");
    setCurrentImage(null);
    lastPredictedSignRef.current = "";
  }, []);

  const predictWebcam = useCallback(() => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    const handLandmarker = handLandmarkerRef.current;
    const classifier = classifierRef.current;

    if (
      !video ||
      !canvas ||
      !handLandmarker ||
      !classifier ||
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      if (webcamRunningRef.current) {
        requestRef.current = requestAnimationFrame(predictWebcam);
      }
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    video.width = videoWidth;
    video.height = videoHeight;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const canvasCtx = canvas.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const results = handLandmarker.detectForVideo(video, performance.now());
    const firstHandLandmarks = results.landmarks?.[0];

    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }

    canvasCtx.restore();

    if (firstHandLandmarks?.length === 21) {
      const landmarkFeatures = flattenHandLandmarks(firstHandLandmarks);

      const { predictedIndex, confidence } = tf.tidy(() => {
        const input = tf.tensor2d([landmarkFeatures]);
        const prediction = classifier.predict(input);
        const probabilities = prediction.dataSync();
        const classIndex = prediction.argMax(-1).dataSync()[0];

        return {
          predictedIndex: classIndex,
          confidence: probabilities[classIndex] || 0,
        };
      });

      const predictedSign = SIGN_LABELS[predictedIndex] || `Class ${predictedIndex}`;
      const confidencePercent = Math.round(confidence * 100);

      setProgress(confidencePercent);

      if (
        predictedSign !== "none" &&
        predictedSign !== lastPredictedSignRef.current
      ) {
        lastPredictedSignRef.current = predictedSign;

        setDetectedData((prevData) => [
          ...prevData,
          {
            SignDetected: predictedSign,
            DetectedScore: confidence,
          },
        ]);

        setGestureOutput(predictedSign);

        if (typeof onGestureDetectedRef.current === "function") {
          onGestureDetectedRef.current(predictedSign);
        }
      }
    } else {
      resetDetectionOutput();
    }

    if (webcamRunningRef.current) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  }, [resetDetectionOutput]);

  const animate = useCallback(() => {
    requestRef.current = requestAnimationFrame(predictWebcam);
  }, [predictWebcam]);

  const enableCam = useCallback(() => {
    if (!handLandmarkerRef.current || !classifierRef.current || isLoading) {
      alert("Please wait for sign detection models to load");
      return;
    }

    if (webcamRunning === true) {
      webcamRunningRef.current = false;
      setWebcamRunning(false);
      cancelAnimationFrame(requestRef.current);
      clearCanvas();
      resetDetectionOutput();

      // Stop any TTS when detection stops — do not speak the completed sentence
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      if (isBuildingSentence && currentSentence.trim() !== "") {
        saveSentenceToHistory();
      }

      const endTime = new Date();
      const timeElapsed = (
        (endTime.getTime() - startTime.getTime()) /
        1000
      ).toFixed(2);

      const nonEmptyData = detectedData.filter(
        (data) => data.SignDetected !== "" && data.DetectedScore !== ""
      );

      const resultArray = [];

      if (nonEmptyData.length > 0) {
        let current = nonEmptyData[0];

        for (let i = 1; i < nonEmptyData.length; i++) {
          if (nonEmptyData[i].SignDetected !== current.SignDetected) {
            resultArray.push(current);
            current = nonEmptyData[i];
          }
        }

        resultArray.push(current);
      }

      const countMap = new Map();

      for (const item of resultArray) {
        const count = countMap.get(item.SignDetected) || 0;
        countMap.set(item.SignDetected, count + 1);
      }

      const sortedArray = Array.from(countMap.entries()).sort(
        (a, b) => b[1] - a[1]
      );

      const outputArray = sortedArray
        .slice(0, 5)
        .map(([sign, count]) => ({ SignDetected: sign, count }));

      const data = {
        signsPerformed: outputArray,
        id: uuidv4(),
        username: user?.name,
        userId: user?.userId,
        createdAt: String(endTime),
        secondsSpent: Number(timeElapsed),
      };

      dispatch(addSignData(data));
      setDetectedData([]);
    } else {
      webcamRunningRef.current = true;
      setWebcamRunning(true);
      startTime = new Date();
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [
    animate,
    clearCanvas,
    currentSentence,
    detectedData,
    dispatch,
    isBuildingSentence,
    isLoading,
    resetDetectionOutput,
    saveSentenceToHistory,
    user?.name,
    user?.userId,
    webcamRunning,
  ]);

  useEffect(() => {
    async function loadModels() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          publicAssetPath("/models/mediapipe/wasm")
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: publicAssetPath("/models/hand_landmarker.task"),
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numHands: 1,
          }
        );

        await tf.ready();
        classifierRef.current = await tf.loadLayersModel(
          publicAssetPath("/models/sign_classifier/model.json")
        );

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading sign detection models:", error);
        setIsLoading(false);
        alert("Failed to load sign detection models. Please refresh the page.");
      }
    }

    loadModels();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
    };
  }, []);

  const formingBannerText = embedded
    ? [currentSentence, transcript, interimTranscript]
        .filter((part) => part && String(part).trim())
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    : currentSentence;

  return (
    <>
      <div
        className={`signlang_detection-container${
          embedded ? " signlang_detection-container--embedded" : ""
        }`}
      >
        {!embedded && <div className="image-glass"></div>}
        {canUseDetect ? (
          <>
            <div
              className={`detect-main-layout${
                embedded ? " detect-main-layout--embedded detect-main-layout--chat" : ""
              }`}
            >
              {embedded && (
                <div className="incoming-banner forming-banner-shared">
                  <h4>Forming sentence</h4>
                  <p>
                    {formingBannerText
                      ? formatSentenceForDisplay(formingBannerText)
                      : "Sign or speak — your sentence appears here…"}
                  </p>
                  <div className="forming-banner-actions">
                    <button
                      type="button"
                      className="complete-sentence-btn"
                      onClick={manualCompleteSentence}
                      disabled={!formingBannerText}
                    >
                      Send Sentence
                    </button>
                    <button
                      type="button"
                      className="clear-sentence-btn"
                      onClick={() => {
                        clearSentence();
                        clearTranscript();
                        speechDraftRef.current = "";
                      }}
                      disabled={!formingBannerText}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Section 1: Live Hand Gesture Detection */}
              <div className="detect-section gesture-detection-section">
                <h2 className="section-title">
                  {embedded ? "Sign Detection" : "Live Hand Gesture Detection"}
                </h2>
                <div className="signlang_webcam">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <canvas ref={canvasRef} className="signlang_canvas" />
                </div>

                <div className="webcam-controls">
                  <button
                    onClick={enableCam}
                    disabled={isLoading}
                    className="webcam-toggle-btn"
                  >
                    {isLoading
                      ? "Loading..."
                      : webcamRunning
                        ? "Stop Detection"
                        : "Start Detection"}
                  </button>
                  <div className="gesture-display">
                    <div className="current-gesture">
                      <span className="gesture-label">Current Gesture:</span>
                      <span className="gesture_output">
                        {gestureOutput || "No gesture detected"}
                      </span>
                    </div>

                    {!embedded && (
                      <div className="forming-sentence-live">
                        <span className="forming-sentence-live__label">
                          {isBuildingSentence
                            ? "Forming sentence…"
                            : "Sentence builder"}
                        </span>
                        <p
                          className={`forming-sentence-live__text ${
                            currentSentence ? "has-text" : ""
                          }`}
                        >
                          {currentSentence
                            ? formatSentenceForDisplay(currentSentence)
                            : "Signs will appear here as you build a sentence…"}
                        </p>
                      </div>
                    )}

                    {currentImage && (
                      <div className="detected-sign-preview">
                        <img
                          src={currentImage.url}
                          alt={`Sign for ${currentImage.name}`}
                        />
                        <span>{currentImage.name}</span>
                      </div>
                    )}
                    {progress ? <ProgressBar progress={progress} /> : null}
                  </div>
                </div>
              </div>

              {/* Section 2: Speech-to-Text */}
              <div className="detect-section speech-to-text-section">
                <h3 className="section-subtitle">Speech-to-Text</h3>

                <div className="language-selector">
                  <label htmlFor="language-select">Select Language:</label>
                  <select
                    id="language-select"
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="language-dropdown"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-IN">English (India)</option>
                    <option value="hi-IN">हिन्दी (Hindi)</option>
                    <option value="gu-IN">ગુજરાતી (Gujarati)</option>
                    <option value="bn-IN">বাংলা (Bengali)</option>
                    <option value="ta-IN">தமிழ் (Tamil)</option>
                    <option value="te-IN">తెలుగు (Telugu)</option>
                    <option value="mr-IN">मराठी (Marathi)</option>
                    <option value="kn-IN">ಕನ್ನಡ (Kannada)</option>
                    <option value="ml-IN">മലയാളം (Malayalam)</option>
                    <option value="pa-IN">ਪੰਜਾਬੀ (Punjabi)</option>
                    <option value="ur-IN">اردو (Urdu)</option>
                  </select>
                </div>

                <div className="stt-controls">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`mic-button ${isListening ? "listening" : ""}`}
                    disabled={!speechRecognition}
                  >
                    {isListening ? "🛑 Stop Listening" : "🎤 Start Listening"}
                  </button>

                  {!speechRecognition && (
                    <p className="stt-error">
                      Speech recognition not supported in this browser. Please
                      use Chrome, Edge, or Safari.
                    </p>
                  )}

                  {micPermission === false && (
                    <p className="stt-error">
                      Microphone access denied. Please allow microphone
                      permission and try again.
                    </p>
                  )}
                </div>

                {!embedded && (transcript || interimTranscript) && (
                  <div className="transcript-display">
                    <h4>Live Transcript:</h4>
                    <div className="transcript-text">
                      {transcript}
                      {interimTranscript && (
                        <span className="interim-transcript">
                          {" "}
                          {interimTranscript}
                        </span>
                      )}
                    </div>
                    <div className="transcript-actions">
                      <button
                        onClick={saveSpeechToHistory}
                        className="save-transcript-btn"
                      >
                        Save to History
                      </button>
                      <button
                        onClick={() => sendToTextToSign(transcript)}
                        className="convert-to-sign-btn"
                      >
                        Convert to Signs
                      </button>
                      <button
                        onClick={clearTranscript}
                        className="clear-transcript-btn"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {!embedded && (
                  <div className="speech-history">
                    <div className="speech-history-header">
                      <h4>Speech History:</h4>
                      <div className="speech-history-buttons">
                        <button
                          onClick={clearAllSpeechHistory}
                          className="clear-speech-btn"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={exportSpeechHistory}
                          className="export-speech-btn"
                        >
                          Export
                        </button>
                      </div>
                    </div>

                    {speechHistory.length > 0 ? (
                      <div className="speech-history-list">
                        {speechHistory.map((item) => (
                          <div key={item.id} className="speech-history-item">
                            <span className="speech-timestamp">
                              {item.timestamp}
                            </span>
                            <span className="speech-text">{item.text}</span>
                            <button
                              onClick={() => sendToTextToSign(item.text)}
                              className="convert-to-sign-btn small"
                              title="Convert to signs"
                            >
                              🤟
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-speech">
                        No speech recorded yet. Start speaking to see your
                        transcripts here!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {!embedded && (
                <>
                  <div className="detect-section sentence-builder-section">
                    <h3 className="section-subtitle">Sentence Builder</h3>

                    <div className="current-sentence-display">
                      <h4>Current Sentence:</h4>
                      <div
                        className={`sentence-text ${
                          currentSentence ? "sentence-text--forming" : ""
                        }`}
                      >
                        {currentSentence
                          ? formatSentenceForDisplay(currentSentence)
                          : "Start making gestures to build your sentence..."}
                      </div>
                      <div className="sentence-actions">
                        <button
                          onClick={() => sendToTextToSign(currentSentence)}
                          disabled={
                            !currentSentence || currentSentence.trim() === ""
                          }
                          className="convert-to-sign-btn"
                        >
                          Convert to Signs
                        </button>
                        <button
                          onClick={manualCompleteSentence}
                          disabled={
                            !currentSentence || currentSentence.trim() === ""
                          }
                          className="complete-sentence-btn"
                        >
                          Complete Sentence
                        </button>
                        <button
                          onClick={clearSentence}
                          disabled={
                            !currentSentence || currentSentence.trim() === ""
                          }
                          className="clear-sentence-btn"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="ai-chat-section">
                      <h4 className="ai-chat-title">🤖 AI Assistant</h4>
                      <button
                        className="ask-ai-btn"
                        onClick={handleAskAI}
                        disabled={
                          isAiProcessing ||
                          !currentSentence ||
                          currentSentence.trim() === ""
                        }
                      >
                        {isAiProcessing
                          ? "🤔 Thinking..."
                          : "🤖 Ask AI About Your Sentence"}
                      </button>
                      {!currentSentence || currentSentence.trim() === "" ? (
                        <p className="ai-chat-hint">
                          Sign a sentence first to ask the AI assistant!
                        </p>
                      ) : null}

                      {aiResponse && (
                        <div className="ai-response-bubble">
                          <h4>🤖 AI Answer:</h4>
                          <p>{aiResponse}</p>
                          <button
                            onClick={() => sendToTextToSign(aiResponse)}
                            className="translate-to-sign-btn"
                          >
                            🤟 Translate Answer to Sign
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="speech-settings">
                      <h4>Speech Settings:</h4>
                      <div className="settings-controls">
                        <label>
                          Rate: {rate}
                          <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.1"
                            value={rate}
                            onChange={(e) =>
                              setRate(parseFloat(e.target.value))
                            }
                          />
                        </label>
                        <label>
                          Pitch: {pitch}
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={pitch}
                            onChange={(e) =>
                              setPitch(parseFloat(e.target.value))
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div className="sentence-history">
                      <div className="history-header">
                        <h4>Sentence History:</h4>
                        <div className="history-buttons">
                          <button
                            onClick={clearAllHistory}
                            className="clear-history-btn"
                          >
                            Clear All
                          </button>
                          <button
                            onClick={exportSentenceHistory}
                            className="export-history-btn"
                          >
                            Export
                          </button>
                        </div>
                      </div>
                      {sentenceHistory.length > 0 ? (
                        <div className="history-list">
                          {sentenceHistory.map((item) => (
                            <div key={item.id} className="history-item">
                              <span className="timestamp">{item.timestamp}</span>
                              <span className="sentence">
                                {formatSentenceForDisplay(item.sentence)}
                              </span>
                              <button
                                onClick={() => sendToTextToSign(item.sentence)}
                                className="convert-to-sign-btn small"
                                title="Convert to signs"
                              >
                                🤟
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-sentences">
                          No sentences completed yet. Start building your first
                          sentence!
                        </p>
                      )}
                    </div>
                  </div>

                  <TextToSign
                    onSignGenerated={handleSignGenerated}
                    isActive={true}
                    externalPayload={textToSignPayload}
                  />
                </>
              )}
            </div>
          </>
        ) : (
          <div className="signlang_detection_notLoggedIn">
            <h1 className="gradient__text">Please Login !</h1>
            <img src={DisplayImg} alt="display-img" />
            <p>
              We Save Your Detection Data to show your progress and learning in
              dashboard, So please Login to Test this Detection Feature.
            </p>
          </div>
        )}
      </div>
    </>
  );
};


export default Detect;

