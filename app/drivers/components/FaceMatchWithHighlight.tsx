"use client";

import { useRef, useState, useEffect } from "react";
import * as faceapi from "@vladmandic/face-api";
import "@tensorflow/tfjs-backend-webgl";

export default function FaceMatchFast() {
  const [profilePreview, setProfilePreview] = useState("");
  const [idPreview, setIdPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const profileCanvasRef = useRef<HTMLCanvasElement>(null);
  const idCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        const tf = (faceapi as any).tf;
        await tf.setBackend("webgl");
        await tf.ready();

        const MODEL_URL = "/models";
        // Using TinyFaceDetector for speed
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        setModelsLoaded(true);
        console.log("🚀 Fast AI Ready");
      } catch (err) {
        console.error("❌ Init failed:", err);
        setResult("❌ AI Initialization failed.");
      }
    }
    loadModels();
  }, []);

  // Helper to downscale large images for faster processing
  const getResizedCanvas = (img: HTMLImageElement, targetWidth = 600) => {
    const scale = targetWidth / img.naturalWidth;
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = img.naturalHeight * scale;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  const getDescriptor = async (
    source: HTMLCanvasElement | HTMLImageElement,
    overlayCanvasRef: React.RefObject<HTMLCanvasElement | null>
  ) => {
    // TinyFaceDetector is much faster than SsdMobilenetv1
    const detection = await faceapi
      .detectSingleFace(source, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return null;

    const canvas = overlayCanvasRef.current;
    if (canvas) {
      const displaySize = { width: source.width, height: source.height };
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
      faceapi.matchDimensions(canvas, displaySize);

      const resized = faceapi.resizeResults(detection, displaySize);
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);
    }

    return detection.descriptor;
  };

  const compareFaces = async () => {
    if (!profilePreview || !idPreview) return setResult("❌ Upload images");
    setLoading(true);
    setResult("");

    try {
      const loadImage = (src: string): Promise<HTMLImageElement> =>
        new Promise((res, rej) => {
          const i = new Image();
          i.crossOrigin = "anonymous";
          i.onload = () => res(i);
          i.onerror = rej;
          i.src = src;
        });

      const [raw1, raw2] = await Promise.all([
        loadImage(profilePreview),
        loadImage(idPreview),
      ]);

      // Resize images to 600px width for massive performance boost
      const img1 = getResizedCanvas(raw1);
      const img2 = getResizedCanvas(raw2);

      const [desc1, desc2] = await Promise.all([
        getDescriptor(img1, profileCanvasRef),
        getDescriptor(img2, idCanvasRef),
      ]);

      if (!desc1 || !desc2) {
        setResult(`❌ Face not detected in ${!desc1 ? "Selfie" : "ID"}`);
        return;
      }

      const distance = faceapi.euclideanDistance(desc1, desc2);
      const match = distance < 0.6;

      setResult(
        match
          ? `✅ Match! (${((1 - distance) * 100).toFixed(0)}% confidence)`
          : `❌ Mismatch (Score: ${distance.toFixed(2)})`
      );
    } catch (e) {
      console.error(e);
      setResult("❌ Error processing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 bg-slate-50 rounded-2xl shadow-sm border border-slate-200">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Biometric Verification</h2>
        <p className="text-slate-500 text-sm">Fast local identity matching</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Selfie Photo</label>
          <input type="file" className="block w-full text-xs" onChange={(e) => e.target.files?.[0] && setProfilePreview(URL.createObjectURL(e.target.files[0]))} />
          <div className="relative aspect-square bg-white border-2 border-dashed border-slate-300 rounded-lg overflow-hidden">
            {profilePreview && <img src={profilePreview} className="absolute inset-0 w-full h-full object-cover" />}
            <canvas ref={profileCanvasRef} className="absolute inset-0 w-full h-full" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">ID Document</label>
          <input type="file" className="block w-full text-xs" onChange={(e) => e.target.files?.[0] && setIdPreview(URL.createObjectURL(e.target.files[0]))} />
          <div className="relative aspect-square bg-white border-2 border-dashed border-slate-300 rounded-lg overflow-hidden">
            {idPreview && <img src={idPreview} className="absolute inset-0 w-full h-full object-cover" />}
            <canvas ref={idCanvasRef} className="absolute inset-0 w-full h-full" />
          </div>
        </div>
      </div>

      <button
        onClick={compareFaces}
        disabled={loading || !modelsLoaded}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg disabled:bg-slate-300 transition-all active:scale-95"
      >
        {loading ? "Analyzing Geometry..." : "Verify Identity"}
      </button>

      {result && (
        <div className={`p-4 rounded-xl text-center font-bold animate-in fade-in slide-in-from-bottom-2 ${result.includes("✅") ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"}`}>
          {result}
        </div>
      )}
    </div>
  );
}
