import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import * as tf from "@tensorflow/tfjs";
import { SignImageData } from "../data/SignImageData";

const SIGN_LABELS = SignImageData.map((sign) => sign.name);
const publicUrl = process.env.PUBLIC_URL || "";
const publicAssetPath = (path) => `${publicUrl}${path}`;

const MAX_WAIT_MS = 2500;
const POLL_MS = 50;
const LANDMARKS_MAX_AGE_MS = 350;

let handLandmarkerPromise = null;
let classifierPromise = null;
let handLandmarkerInstance = null;
let runningMode = "VIDEO";

// Continuous tracking (same idea as Detect.jsx's RAF loop)
let trackingVideo = null;
let trackingRafId = null;
let latestLandmarks = null;
let latestLandmarksAt = 0;
let lastVideoTimestamp = -1;

/**
 * Detect.jsx-compatible landmark preprocessing:
 * wrist-relative xyz, scaled by middle-finger MCP (landmark 9) → 63 features.
 */
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadImageFromBase64 = (base64Image) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode captured frame"));
    img.src = base64Image.startsWith("data:")
      ? base64Image
      : `data:image/jpeg;base64,${base64Image}`;
  });

const ensureModelsLoaded = async () => {
  if (!handLandmarkerPromise) {
    handLandmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        publicAssetPath("/models/mediapipe/wasm")
      );

      runningMode = "VIDEO";
      return HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: publicAssetPath("/models/hand_landmarker.task"),
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.35,
        minHandPresenceConfidence: 0.35,
        minTrackingConfidence: 0.35,
      });
    })().catch((error) => {
      handLandmarkerPromise = null;
      throw error;
    });
  }

  if (!classifierPromise) {
    classifierPromise = (async () => {
      await tf.ready();
      return tf.loadLayersModel(
        publicAssetPath("/models/sign_classifier/model.json")
      );
    })().catch((error) => {
      classifierPromise = null;
      throw error;
    });
  }

  const [handLandmarker, classifier] = await Promise.all([
    handLandmarkerPromise,
    classifierPromise,
  ]);

  handLandmarkerInstance = handLandmarker;
  return { handLandmarker, classifier };
};

const setLandmarkerMode = async (handLandmarker, mode) => {
  if (runningMode === mode) return;
  await handLandmarker.setOptions({ runningMode: mode });
  runningMode = mode;
  if (mode === "VIDEO") {
    lastVideoTimestamp = -1;
  }
};

const normalizeSignName = (signName = "") =>
  String(signName).trim().toLowerCase().replace(/\s+/g, "");

const signsMatch = (prediction, targetSign) =>
  normalizeSignName(prediction) === normalizeSignName(targetSign);

const isVideoReady = (video) =>
  Boolean(
    video &&
      video.readyState >= 2 &&
      video.videoWidth > 0 &&
      video.videoHeight > 0 &&
      !video.paused
  );

const pickBestHandLandmarks = (results) => {
  const hands = results?.landmarks || [];
  if (!hands.length) return null;

  let best = null;
  let bestArea = -1;

  for (const landmarks of hands) {
    if (!landmarks || landmarks.length !== 21) continue;

    let minX = 1;
    let minY = 1;
    let maxX = 0;
    let maxY = 0;

    for (const point of landmarks) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    const area = Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
    if (area > bestArea) {
      bestArea = area;
      best = landmarks;
    }
  }

  return best;
};

/**
 * Educational validation layer — sits above unchanged model output.
 */
const evaluateEducationally = (classification, targetSign) => {
  const { prediction, confidence, top3, targetConfidence } = classification;
  const details = {
    prediction,
    confidence,
    targetConfidence,
    top3,
  };

  const isTopPrediction =
    prediction !== "none" && signsMatch(prediction, targetSign);

  if (isTopPrediction && confidence >= 0.5) {
    return {
      correct: true,
      feedback: "Good job! Your sign matches the target.",
      ...details,
    };
  }

  if (isTopPrediction && confidence < 0.5) {
    return {
      correct: true,
      feedback: "Almost perfect! Try making the sign clearer next time.",
      ...details,
    };
  }

  const targetInTop3 = top3.find(
    (entry) =>
      entry.prediction !== "none" && signsMatch(entry.prediction, targetSign)
  );

  if (targetInTop3 && targetInTop3.confidence >= 0.3) {
    return {
      correct: true,
      feedback:
        "Close enough! The model detected your target sign with lower confidence.",
      ...details,
      targetConfidence: targetInTop3.confidence,
    };
  }

  return {
    correct: false,
    feedback: `Detected ${prediction}. Try matching the reference image more closely.`,
    ...details,
  };
};

const classifyLandmarks = (classifier, landmarks, targetSign) => {
  const landmarkFeatures = flattenHandLandmarks(landmarks);

  return tf.tidy(() => {
    const input = tf.tensor2d([landmarkFeatures]);
    const predictionTensor = classifier.predict(input);
    const probabilities = Array.from(predictionTensor.dataSync());

    const ranked = probabilities
      .map((score, index) => ({
        prediction: SIGN_LABELS[index] || `Class ${index}`,
        confidence: score || 0,
        index,
      }))
      .sort((a, b) => b.confidence - a.confidence);

    const top3 = ranked.slice(0, 3);
    const top = top3[0] || { prediction: "none", confidence: 0 };

    const targetIndex = SIGN_LABELS.findIndex((label) =>
      signsMatch(label, targetSign)
    );
    const targetConfidence =
      targetIndex >= 0 ? probabilities[targetIndex] || 0 : null;

    return {
      prediction: top.prediction,
      confidence: top.confidence,
      top3,
      targetConfidence,
    };
  });
};

const scoreEducationalResult = (result) => {
  if (!result) return -1;

  let score = 0;
  if (result.correct) score += 1000;
  score += (result.targetConfidence || 0) * 100;
  score += (result.confidence || 0) * 10;
  return score;
};

const classifyFromLandmarks = (classifier, landmarks, targetSign) => {
  if (!landmarks || landmarks.length !== 21) return null;
  const classification = classifyLandmarks(classifier, landmarks, targetSign);
  return evaluateEducationally(classification, targetSign);
};

const detectVideoFrame = (handLandmarker, video) => {
  // MediaPipe VIDEO mode requires strictly increasing timestamps from performance.now()
  let timestamp = performance.now();
  if (timestamp <= lastVideoTimestamp) {
    timestamp = lastVideoTimestamp + 1;
  }
  lastVideoTimestamp = timestamp;

  try {
    return pickBestHandLandmarks(
      handLandmarker.detectForVideo(video, timestamp)
    );
  } catch (error) {
    console.warn("VIDEO hand detection failed:", error);
    return null;
  }
};

const trackingLoop = () => {
  if (!trackingVideo) {
    trackingRafId = null;
    return;
  }

  if (
    handLandmarkerInstance &&
    runningMode === "VIDEO" &&
    isVideoReady(trackingVideo)
  ) {
    const landmarks = detectVideoFrame(
      handLandmarkerInstance,
      trackingVideo
    );
    if (landmarks) {
      latestLandmarks = landmarks;
      latestLandmarksAt = performance.now();
    }
  }

  trackingRafId = requestAnimationFrame(trackingLoop);
};

/**
 * Start continuous VIDEO-mode hand tracking on a live camera element.
 * Call this when SignLingo practice camera is ready (same pattern as Detect).
 */
export async function startHandTracking(video) {
  if (!video) return;

  const { handLandmarker } = await ensureModelsLoaded();
  await setLandmarkerMode(handLandmarker, "VIDEO");

  stopHandTracking();

  trackingVideo = video;
  latestLandmarks = null;
  latestLandmarksAt = 0;
  lastVideoTimestamp = -1;

  if (video.paused) {
    try {
      await video.play();
    } catch (_) {
      // stream may already be live
    }
  }

  trackingRafId = requestAnimationFrame(trackingLoop);
}

/**
 * Stop continuous tracking and clear cached landmarks.
 */
export function stopHandTracking() {
  trackingVideo = null;
  if (trackingRafId != null) {
    cancelAnimationFrame(trackingRafId);
    trackingRafId = null;
  }
  latestLandmarks = null;
  latestLandmarksAt = 0;
}

const getFreshTrackedLandmarks = () => {
  if (!latestLandmarks) return null;
  if (performance.now() - latestLandmarksAt > LANDMARKS_MAX_AGE_MS) return null;
  return latestLandmarks;
};

/** Whether continuous tracking currently sees a hand. */
export function isHandCurrentlyDetected() {
  return Boolean(getFreshTrackedLandmarks());
}

const detectFromBase64 = async (base64Image, handLandmarker, classifier, targetSign) => {
  // Pause continuous tracking briefly so IMAGE/VIDEO modes don't collide
  const wasTracking = Boolean(trackingVideo);
  const trackedVideo = trackingVideo;
  if (wasTracking) {
    stopHandTracking();
  }

  try {
    await setLandmarkerMode(handLandmarker, "IMAGE");
    const image = await loadImageFromBase64(base64Image);
    let landmarks = null;

    try {
      landmarks = pickBestHandLandmarks(handLandmarker.detect(image));
    } catch (error) {
      console.warn("IMAGE hand detection failed:", error);
    }

    if (!landmarks) return null;
    return classifyFromLandmarks(classifier, landmarks, targetSign);
  } finally {
    if (wasTracking && trackedVideo) {
      startHandTracking(trackedVideo).catch(() => {});
    }
  }
};

/**
 * Verify an ASL sign using local MediaPipe + TF.js.
 * Prefer startHandTracking(video) while the camera is live, then call verifySign(video, sign).
 *
 * @param {HTMLVideoElement|string} source - live video or JPEG base64
 * @param {string} targetSign - Expected sign label (e.g. "A", "Hello")
 */
export async function verifySign(source, targetSign) {
  try {
    if (!source) {
      return {
        correct: false,
        feedback: "No camera frame available. Please try again.",
        prediction: null,
        confidence: 0,
        targetConfidence: null,
      };
    }

    const { handLandmarker, classifier } = await ensureModelsLoaded();

    let result = null;

    if (typeof source === "string") {
      result = await detectFromBase64(
        source,
        handLandmarker,
        classifier,
        targetSign
      );
    } else if (source instanceof HTMLVideoElement) {
      if (source.paused) {
        try {
          await source.play();
        } catch (_) {
          // continue
        }
      }

      // Continuous tracking matches Detect.jsx — warm the VIDEO tracker first
      if (trackingVideo !== source) {
        await startHandTracking(source);
      }

      let bestResult = null;
      const sampleStart = performance.now();

      // Only read landmarks from the RAF tracker — never call detectForVideo
      // concurrently on the same HandLandmarker instance.
      while (performance.now() - sampleStart < MAX_WAIT_MS) {
        const landmarks =
          getFreshTrackedLandmarks() ||
          (latestLandmarks &&
          performance.now() - latestLandmarksAt < 2000
            ? latestLandmarks
            : null);

        if (landmarks) {
          const candidate = classifyFromLandmarks(
            classifier,
            landmarks,
            targetSign
          );

          if (
            scoreEducationalResult(candidate) >
            scoreEducationalResult(bestResult)
          ) {
            bestResult = candidate;
          }

          if (
            candidate?.correct &&
            signsMatch(candidate.prediction, targetSign) &&
            candidate.confidence >= 0.5
          ) {
            return candidate;
          }
        }

        await sleep(POLL_MS);
      }

      result = bestResult;
    } else {
      return {
        correct: false,
        feedback: "Invalid camera source. Please refresh and try again.",
        prediction: null,
        confidence: 0,
        targetConfidence: null,
      };
    }

    if (!result) {
      return {
        correct: false,
        feedback:
          "No hand detected. Center your palm facing the camera, keep fingers fully visible under bright light, then press Check again.",
        prediction: null,
        confidence: 0,
        targetConfidence: null,
      };
    }

    return result;
  } catch (error) {
    console.error("Local sign model error:", error);
    return {
      correct: false,
      feedback:
        "Could not run local sign recognition. Please refresh and try again.",
      prediction: null,
      confidence: 0,
      targetConfidence: null,
    };
  }
}

export async function preloadSignModels() {
  await ensureModelsLoaded();
}
