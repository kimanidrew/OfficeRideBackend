"use client";

import { useRef, useState, useEffect } from "react";
import * as faceapi from "@vladmandic/face-api";
import "@tensorflow/tfjs-backend-webgl";

export default function MultiImageFaceMatch() {
  const [selfiePreview, setSelfiePreview] = useState("");
  const [idFrontPreview, setIdFrontPreview] = useState("");
  const [idBackPreview, setIdBackPreview] = useState(""); // New state for back ID
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const selfieCanvasRef = useRef<HTMLCanvasElement>(null);
  const idFrontCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        const tf = (faceapi as any).tf;
        await tf.setBackend("webgl");
        await tf.ready();
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("❌ Init failed:", err);
        setResult("❌ AI Initialization failed.");
      }
    }
    loadModels();
  }, []);

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
    if (!selfiePreview || !idFrontPreview || !idBackPreview) return setResult("❌ Upload all 3 images");
    setLoading(true);
    setResult("");

    try {
      const loadImage = (src: string): Promise<HTMLImageElement> =>
        new Promise((res, rej) => { const i = new Image(); i.crossOrigin="anonymous"; i.onload=()=>res(i); i.onerror=rej; i.src=src; });

      // Load all three original images
      const [rawSelfie, rawIDFront, rawIDBack] = await Promise.all([
        loadImage(selfiePreview),
        loadImage(idFrontPreview),
        loadImage(idBackPreview), // Back image is loaded but only used for UI preview
      ]);

      // Resize images for fast AI processing
      const processedSelfie = getResizedCanvas(rawSelfie);
      const processedIDFront = getResizedCanvas(rawIDFront);

      // We only run AI analysis on the selfie and the front ID photo
      const [selfieDesc, idFrontDesc] = await Promise.all([
        getDescriptor(processedSelfie, selfieCanvasRef),
        getDescriptor(processedIDFront, idFrontCanvasRef),
      ]);

      if (!selfieDesc || !idFrontDesc) {
        setResult(`❌ Face not detected in ${!selfieDesc ? "Selfie" : "ID Front"}`);
        return;
      }

      const distance = faceapi.euclideanDistance(selfieDesc, idFrontDesc);
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

  const imageInputStyle = "block w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-slate-50 rounded-2xl shadow-lg border border-slate-200">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">3-Point Identity Verification</h2>
        <p className="text-slate-500 text-sm">Selfie vs. ID Front & Back Check</p>
      </div>

      {/* Image Upload Area */}
      <div className="grid grid-cols-3 gap-4">
        {/* Selfie Upload */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">1. Selfie Photo</label>
          <input type="file" className={imageInputStyle} onChange={(e) => e.target.files?.[0] && setSelfiePreview(URL.createObjectURL(e.target.files[0]))} />
          <div className="relative aspect-square bg-white border-2 border-dashed border-slate-300 rounded-lg overflow-hidden">
            {selfiePreview && <img src={selfiePreview} className="absolute inset-0 w-full h-full object-cover" />}
            <canvas ref={selfieCanvasRef} className="absolute inset-0 w-full h-full" />
          </div>
        </div>

        {/* ID Front Upload */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">2. ID Card Front</label>
          <input type="file" className={imageInputStyle} onChange={(e) => e.target.files?.[0] && setIdFrontPreview(URL.createObjectURL(e.target.files[0]))} />
           <div className="relative aspect-square bg-white border-2 border-dashed border-slate-300 rounded-lg overflow-hidden">
            {idFrontPreview && <img src={idFrontPreview} className="absolute inset-0 w-full h-full object-cover" />}
            <canvas ref={idFrontCanvasRef} className="absolute inset-0 w-full h-full" />
          </div>
        </div>

         {/* ID Back Upload (UI Only, No AI analysis needed for back page) */}
         <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">3. ID Card Back</label>
          <input type="file" className={imageInputStyle} onChange={(e) => e.target.files?.[0] && setIdBackPreview(URL.createObjectURL(e.target.files[0]))} />
           <div className="relative aspect-square bg-white border-2 border-dashed border-slate-300 rounded-lg overflow-hidden">
            {idBackPreview && <img src={idBackPreview} className="absolute inset-0 w-full h-full object-cover" />}
            {/* No canvas ref for the back image */}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={compareFaces}
        disabled={loading || !modelsLoaded}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg disabled:bg-slate-300 transition-all active:scale-95"
      >
        {loading ? "Analyzing Geometry..." : "Verify Identity"}
      </button>

      {/* Result Display */}
      {result && (
        <div className={`p-4 rounded-xl text-center font-bold ${result.includes("✅") ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"}`}>
          {result}
        </div>
      )}
    </div>
  );
}
