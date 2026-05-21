'use client';

import { useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

export function useModel() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadModel = useCallback(async (cropName) => {
    setLoading(true);
    setError(null);
    try {
      const loadedModel = await tf.loadGraphModel(`/models/${cropName}/model.json`);
      setModel(loadedModel);
      setLoading(false);
      return loadedModel;
    } catch (err) {
      setError('Model load failed');
      setLoading(false);
      return null;
    }
  }, []);

  const predict = useCallback(async (canvas, cropName, classes) => {
    if (!model) return null;
    try {
      const tensor = tf.browser.fromPixels(canvas)
        .resizeBilinear([224, 224])
        .toFloat()
        .div(255.0)
        .expandDims(0);
      // ── Green pixel check ─────────────────────────
// Plant leaf නම් green pixels 15%+ තියෙන්න ඕනෙ
const imageData = canvas.getContext('2d')
  .getImageData(0, 0, canvas.width, canvas.height);
const pixels = imageData.data;
let greenCount = 0;
const totalPixels = canvas.width * canvas.height;

for (let i = 0; i < pixels.length; i += 4) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];
  // More lenient green check
  if (g > r + 10 && g > b + 10 && g > 40) {
    greenCount++;
  }
}

const greenRatio = greenCount / totalPixels;
if (greenRatio < 0.08) {
  return { disease: 'unknown', confidence: 0, gap: 0, isUncertain: true };
}
// ─────────────────────────────────────────────
      const predictions = await model.predict(tensor);
      const probabilities = await predictions.data();
      tensor.dispose();
      predictions.dispose();

const maxIndex = probabilities.indexOf(Math.max(...probabilities));
const confidence = parseFloat((probabilities[maxIndex] * 100).toFixed(1));

const sorted = [...probabilities].sort((a, b) => b - a);
const gap = parseFloat(((sorted[0] - sorted[1]) * 100).toFixed(1));

// Layer 1: Confidence 70% යට නම් uncertain
if (confidence < 70) {
  return { disease: 'unknown', confidence, gap, isUncertain: true };
}

// Layer 2: Gap 20% යට නම් uncertain  
if (gap < 20) {
  return { disease: 'unknown', confidence, gap, isUncertain: true };
}

// Layer 3: Top-3 entropy check
// Probabilities ගොඩක් spread වෙලා තියෙනවා නම් uncertain
const top3Sum = sorted.slice(0, 3).reduce((a, b) => a + b, 0);
const dominance = sorted[0] / top3Sum;
if (dominance < 0.6) {
  return { disease: 'unknown', confidence, gap, isUncertain: true };
}

return { disease: classes[maxIndex], confidence, gap, isUncertain: false };
    } catch {
      return null;
    }
  }, [model]);

  const clearModel = useCallback(() => {
    if (model) {
      model.dispose();
      setModel(null);
    }
    setError(null);
  }, [model]);

  return { model, loading, error, loadModel, predict, clearModel };
}