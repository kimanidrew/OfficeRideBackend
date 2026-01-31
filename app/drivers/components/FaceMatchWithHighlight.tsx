"use client";

import { useRef, useState, useEffect } from "react";
import { FaceLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

export default function FaceMatchWithMediaPipe() {
  const [profilePreview, setProfilePreview] = useState("");
  const [idPreview, setIdPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const profileCanvasRef = useRef<HTMLCanvasElement>(null);
  const idCanvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);

  // Initialize Landmarker once on mount
useEffect(() => {
  async function init() {
    // FilesetResolver still needs the WASM files (can also be local if desired)
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        // Change this line to your local path
        modelAssetPath: `/models/face_landmarker.task`,
        delegate: "GPU"
      },
      outputFaceBlendshapes: false,
      runningMode: "IMAGE",
      numFaces: 1
    });
  }
  init();
}, []);

  const detectFace = async (img: HTMLImageElement) => {
    if (!landmarkerRef.current) return null;
    const result = landmarkerRef.current.detect(img);
    return result.faceLandmarks.length > 0 ? result.faceLandmarks[0] : null;
  };

  const compareFaces = async () => {
    if (!profilePreview || !idPreview) {
      setResult("❌ Please upload both images");
      return;
    }
    if (!landmarkerRef.current) {
      setResult("⌛ Model still loading, please wait...");
      return;
    }

    setLoading(true);
    setResult("");
    setProgress(10);

    const profileImg = new Image();
    const idImg = new Image();
    profileImg.src = profilePreview;
    idImg.src = idPreview;

    await Promise.all([
      new Promise((res) => (profileImg.onload = res)),
      new Promise((res) => (idImg.onload = res))
    ]);

    setProgress(30);
    const profileLandmarks = await detectFace(profileImg);
    if (!profileLandmarks) {
      setResult("❌ No face detected in profile photo");
      setLoading(false);
      return;
    }

    setProgress(60);
    const idLandmarks = await detectFace(idImg);
    if (!idLandmarks) {
      setResult("❌ No face detected in ID photo");
      setLoading(false);
      return;
    }

    setProgress(80);

    // Euclidean Distance Comparison
    let distanceSum = 0;
    for (let i = 0; i < profileLandmarks.length; i++) {
      const dx = profileLandmarks[i].x - idLandmarks[i].x;
      const dy = profileLandmarks[i].y - idLandmarks[i].y;
      const dz = profileLandmarks[i].z - idLandmarks[i].z;
      distanceSum += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    const avgDistance = distanceSum / profileLandmarks.length;

    // Threshold for matching: 0.05 - 0.08 is typical for normalized landmarks
    const match = avgDistance < 0.06;

    const draw = (img: HTMLImageElement, canvasRef: React.RefObject<HTMLCanvasElement>, landmarks: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const drawingUtils = new DrawingUtils(ctx);
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
      drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });
    };

    draw(profileImg, profileCanvasRef, profileLandmarks);
    draw(idImg, idCanvasRef, idLandmarks);

    setProgress(100);
    setResult(match ? `✅ Match (Score: ${(1 - avgDistance).toFixed(2)})` : "❌ No match");
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto border rounded-xl shadow-lg bg-white">
      <h2 className="text-2xl font-bold text-center">Face Identity Check</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Selfie Photo</label>
          <input type="file" className="block w-full text-xs" accept="image/*" onChange={(e) => e.target.files && setProfilePreview(URL.createObjectURL(e.target.files[0]))} />
          {profilePreview && (
            <div className="relative border rounded overflow-hidden">
              <img src={profilePreview} className="w-full h-auto" />
              <canvas ref={profileCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">ID Photo</label>
          <input type="file" className="block w-full text-xs" accept="image/*" onChange={(e) => e.target.files && setIdPreview(URL.createObjectURL(e.target.files[0]))} />
          {idPreview && (
            <div className="relative border rounded overflow-hidden">
              <img src={idPreview} className="w-full h-auto" />
              <canvas ref={idCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      <button onClick={compareFaces} disabled={loading} className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-400">
        {loading ? `Verifying... ${progress}%` : "Verify Identity"}
      </button>

      {result && <div className={`p-4 rounded-md text-center font-bold ${result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{result}</div>}
    </div>
  );
}
