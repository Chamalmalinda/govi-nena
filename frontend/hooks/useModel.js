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

      // ── Lenient HSV Leaf Detection ─────────────────────────
      const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let leafPixels = 0;
      const totalPixels = canvas.width * canvas.height;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        const rf = r / 255;
        const gf = g / 255;
        const bf = b / 255;
        const max = Math.max(rf, gf, bf);
        const min = Math.min(rf, gf, bf);
        const d = max - min;
        
        let h = 0;
        const s = max === 0 ? 0 : d / max;
        const v = max;

        if (max !== min) {
          if (max === rf) {
            h = (gf - bf) / d + (gf < bf ? 6 : 0);
          } else if (max === gf) {
            h = (bf - rf) / d + 2;
          } else {
            h = (rf - gf) / d + 4;
          }
          h /= 6;
        }
        
        const hue = h * 360;
        const sat = s * 100;
        const val = v * 100;

        // Matches green (60°-165°), yellow (35°-60°), and withered brown (10°-35°)
        if (hue >= 10 && hue <= 165 && sat > 10 && val > 12) {
          leafPixels++;
        }
      }

      const leafRatio = leafPixels / totalPixels;
      // Rejects non-leaf objects (laptops, walls, umbrellas) while letting actual leaves (even yellow/brown/thin paddy) pass.
      if (leafRatio < 0.06) {
        tensor.dispose();
        return { disease: 'unknown', confidence: 0, gap: 0, isUncertain: true };
      }
      // ─────────────────────────────────────────────────────────────

      const predictions = await model.predict(tensor);
      const probabilities = await predictions.data();
      tensor.dispose();
      predictions.dispose();

      const maxIndex = probabilities.indexOf(Math.max(...probabilities));
      const confidence = parseFloat((probabilities[maxIndex] * 100).toFixed(1));

      const sorted = [...probabilities].sort((a, b) => b - a);
      const gap = parseFloat(((sorted[0] - sorted[1]) * 100).toFixed(1));

      const top3Sum = sorted.slice(0, 3).reduce((a, b) => a + b, 0);
      const dominance = sorted[0] / (top3Sum || 1);

      // Layer 0: If confidence is extremely low (< 30%), it's fully unknown
      if (confidence < 30) {
        return { disease: 'unknown', confidence, gap, isUncertain: true };
      }

      const isUncertain = (confidence < 70 || gap < 20 || dominance < 0.6);

      return { disease: classes[maxIndex], confidence, gap, isUncertain };
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