"use client";

import type React from "react";

import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { AlertCircle, Camera, Check, Loader2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Separator } from "@repo/ui/components/separator";
import type { createAuthClient } from "@/lib/auth-api-client";

interface ImageUploadAreaProps {
  onIngredientsRecognized: (ingredients: string[]) => void;
  authClient?: ReturnType<typeof createAuthClient> | null;
}

function resizeImage(file: File, maxWidth: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function ImageUploadArea({
  onIngredientsRecognized,
  authClient,
}: ImageUploadAreaProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognizedIngredients, setRecognizedIngredients] = useState<string[]>(
    []
  );
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    setWebcamActive(false);
  }, []);

  // コンポーネントアンマウント時にストリームを停止
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, []);

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  const handleCameraClick = () => {
    if (isMobile()) {
      // スマホではネイティブカメラアプリを起動
      cameraInputRef.current?.click();
    } else {
      // PCではWebカメラプレビューを起動
      startWebcam();
    }
  };

  const startWebcam = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("お使いのブラウザはカメラに対応していません");
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setWebcamActive(true);
      // videoRefへの設定はレンダリング後に行う
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      setError("カメラへのアクセスが拒否されました。ブラウザの設定を確認してください。");
    }
  };

  const captureFromWebcam = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

    stopWebcam();
    setUploadedImage(dataUrl);
    analyzeImage(dataUrl);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("ファイルサイズは10MB以下にしてください");
      return;
    }

    setError(null);

    try {
      const resizedImage = await resizeImage(file);
      setUploadedImage(resizedImage);
      analyzeImage(resizedImage);
    } catch {
      setError("画像の読み込みに失敗しました");
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    setRecognizedIngredients([]);
    setSelectedIngredients([]);
    setError(null);

    try {
      if (!authClient) {
        setError("ログインが必要です");
        return;
      }

      const { data, error: apiError } = await authClient.POST("/gemini/recognize-ingredients", {
        body: { image: base64Image },
      });

      if (apiError || !data) {
        throw new Error("API request failed");
      }

      if ((data as { ingredients?: string[] }).ingredients && (data as { ingredients: string[] }).ingredients.length > 0) {
        const ingredients = (data as { ingredients: string[] }).ingredients;
        setRecognizedIngredients(ingredients);
        setSelectedIngredients(ingredients);
      } else {
        setError("食材を認識できませんでした。別の画像をお試しください。");
      }
    } catch {
      setError("食材の認識に失敗しました。もう一度お試しください。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleIngredientSelection = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const selectAll = () => {
    setSelectedIngredients([...recognizedIngredients]);
  };

  const deselectAll = () => {
    setSelectedIngredients([]);
  };

  const addSelectedIngredients = () => {
    onIngredientsRecognized(selectedIngredients);
    resetUpload();
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setRecognizedIngredients([]);
    setSelectedIngredients([]);
    setIsAnalyzing(false);
    setError(null);
    stopWebcam();
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {!uploadedImage ? (
        webcamActive ? (
          <div className="border-2 border-dashed rounded-lg p-4 text-center border-orange-500 bg-black">
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-80 rounded-lg object-contain bg-black"
              />
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={captureFromWebcam}
                  className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  撮影する
                </Button>
                <Button
                  variant="ghost"
                  onClick={stopWebcam}
                  className="text-white border border-white hover:bg-white/10 hover:text-white"
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Upload className="h-8 w-8 text-gray-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">食材の画像をアップロード</h3>
                <p className="text-sm text-gray-500">
                  カメラで撮影、またはファイルを選択してください
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={handleCameraClick}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  カメラで撮影
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  ファイルを選択
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-400">
                JPG, PNG, WebP形式に対応（最大10MB）
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {/* アップロードした画像のプレビュー */}
          <div className="border-2 border-dashed rounded-lg p-6 border-gray-400">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="アップロードした食材画像"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetUpload}
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-white shadow-md hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-2">
                  {isAnalyzing ? (
                    <div className="space-y-2">
                      <h4 className="font-medium">画像を解析中...</h4>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">
                          AIが食材を認識しています...
                        </span>
                      </div>
                    </div>
                  ) : recognizedIngredients.length > 0 ? (
                    <div className="space-y-1">
                      <h4 className="font-medium">解析完了</h4>
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm">
                          {recognizedIngredients.length}
                          個の食材を認識しました
                        </span>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">解析結果</h4>
                      <div className="flex items-start gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4 min-w-4 min-h-4 mt-0.5" />
                        <span className="text-sm">{error}</span>
                      </div>
                    </div>
                  ) : null}
                </div>

              </div>
          {recognizedIngredients.length > 0 && (
            <>
            
            <Separator className="mt-4" />
                <div className="mt-4">
                    <h4 className="text-sm flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      認識された食材を選択してください
                    </h4>
                  <div className="flex items-center justify-end my-2">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAll}
                        className="text-xs h-7 cursor-pointer"
                      >
                        全選択
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={deselectAll}
                        className="text-xs h-7 cursor-pointer"
                      >
                        全解除
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 my-4">
                    {recognizedIngredients.map((ingredient, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`cursor-pointer transition-colors px-3 py-1 ${
                          selectedIngredients.includes(ingredient)
                            ? "border-orange-600 text-orange-600 hover:bg-orange-50"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => toggleIngredientSelection(ingredient)}
                      >
                        {selectedIngredients.includes(ingredient) && (
                          <Check className="h-3 w-3 mr-1" />
                        )}
                        {ingredient}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2 justify-end">
                    <Button variant="outline" onClick={resetUpload} className="cursor-pointer">
                      キャンセル
                    </Button>
                    <Button
                      onClick={addSelectedIngredients}
                      disabled={selectedIngredients.length === 0}
                      className="bg-orange-600 hover:bg-orange-700 cursor-pointer"
                    >
                      選択した食材を追加 ({selectedIngredients.length})
                    </Button>
                  </div>
                </div>
                </>
          )}
            </div>
        </div>
      )}

      {/* エラー表示（画像アップロード前のエラー） */}
      {error && !uploadedImage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
