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

  useEffect(() => {
      let active = true;
      async function init() {
        try {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
          );

          const landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "/models/face_landmarker.task", // must exist in public/models
              delegate: "GPU", // fallback to CPU automatically if GPU not available
            },
            outputFaceBlendshapes: false,
            runningMode: "IMAGE",
            numFaces: 1,
          });

          if (active) {
            landmarkerRef.current = landmarker;
            console.log("✅ Face Landmarker initialized");
          }
        } catch (err) {
          console.error("❌ Model load failed:", err);
          setResult("❌ Failed to load model. Check /public/models path.");
        }
      }
      init();
      return () => {
        active = false;
        landmarkerRef.current?.close();
      };
    }, []);


  const detectFace = async (imgElement: HTMLImageElement) => {
    if (!landmarkerRef.current) return null;
    
    // Create a temporary canvas to get clean pixel data
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = imgElement.naturalWidth;
    tempCanvas.height = imgElement.naturalHeight;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return null;

    tempCtx.drawImage(imgElement, 0, 0);

  
    try {
      // Pass the canvas instead of the img element to avoid backend errors
      const detectionResult = landmarkerRef.current.detect(tempCanvas);
      return detectionResult.faceLandmarks && detectionResult.faceLandmarks.length > 0 
        ? detectionResult.faceLandmarks[0] 
        : null;
    } catch (e) {
      console.error("Detection error:", e);
      return null;
    }
  };

  const compareFaces = async () => {
    if (!profilePreview || !idPreview) {
      setResult("❌ Please upload both images");
      return;
    }
    if (!landmarkerRef.current) {
      setResult("⌛ Model loading...");
      return;
    }

    setLoading(true);
    setResult("");
    setProgress(10);

    try {
      const loadImage = (src: string): Promise<HTMLImageElement> => 
        new Promise((res, rej) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = src;
        });

      const [profileImg, idImg] = await Promise.all([
        loadImage(profilePreview),
        loadImage(idPreview)
      ]);

      setProgress(40);
      const profileLandmarks = await detectFace(profileImg);
      const idLandmarks = await detectFace(idImg);

      if (!profileLandmarks || !idLandmarks) {
        setResult(`❌ No face found in ${!profileLandmarks ? 'Selfie' : 'ID'}`);
        return;
      }

      setProgress(80);
      
      // Calculate Similarity
      let distanceSum = 0;
      for (let i = 0; i < profileLandmarks.length; i++) {
        const dx = profileLandmarks[i].x - idLandmarks[i].x;
        const dy = profileLandmarks[i].y - idLandmarks[i].y;
        const dz = profileLandmarks[i].z - idLandmarks[i].z;
        distanceSum += Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
      
      const avgDistance = distanceSum / profileLandmarks.length;
      const match = avgDistance < 0.055; // Threshold for 478 points

      // Visualization
      const draw = (
            img: HTMLImageElement,
            canvasRef: React.RefObject<HTMLCanvasElement | null>,
            landmarks: any
          ) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            // … drawing logic
          };


      draw(profileImg, profileCanvasRef, profileLandmarks);
      draw(idImg, idCanvasRef, idLandmarks);

      setProgress(100);
      setResult(match ? `✅ Match! (Score: ${(1 - avgDistance).toFixed(2)})` : "❌ Identity mismatch");
    } catch (err) {
      console.error(err);
      setResult("❌ Error processing images.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto border rounded-xl shadow-lg bg-white">
      <h2 className="text-2xl font-bold text-center">Face Identity Check</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Selfie Photo</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setProfilePreview(URL.createObjectURL(e.target.files[0]))} />
          {profilePreview && (
            <div className="relative border rounded overflow-hidden aspect-square bg-gray-100">
              <canvas ref={profileCanvasRef} className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">ID Photo</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setIdPreview(URL.createObjectURL(e.target.files[0]))} />
          {idPreview && (
            <div className="relative border rounded overflow-hidden aspect-square bg-gray-100">
              <canvas ref={idCanvasRef} className="w-full h-full object-contain" />
            </div>
          )}
        </div>
      </div>

      <button onClick={compareFaces} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400 transition-all">
        {loading ? `Verifying ${progress}%...` : "Run Identity Check"}
      </button>

      {result && <div className={`p-4 rounded-lg text-center font-bold border ${result.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>{result}</div>}
    </div>
  );
}
