import { useState, useEffect, useRef } from "react";
import * as ort from "onnxruntime-web";
import { preprocess, postprocess } from "../utils/yolo"; // 假设你把工具函数移到了这里

// 配置路径 (根据实际情况调整)
ort.env.wasm.wasmPaths =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@dev/dist/";

export const useYoloModel = (modelPath) => {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("正在初始化引擎...");
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 初始化模型
  useEffect(() => {
    const loadModel = async () => {
      try {
        const sess = await ort.InferenceSession.create(modelPath, {
          executionProviders: ["wasm"],
        });
        setSession(sess);
        setStatus("模型已加载");
        setIsReady(true);
      } catch (e) {
        setStatus(`模型加载失败: ${e.message}`);
        setIsReady(false);
      }
    };
    loadModel();
  }, [modelPath]);

  // 推理函数
  const runInference = async (imageElement) => {
    if (!session || !imageElement) return null;

    setIsProcessing(true);
    setStatus("正在进行 AI 运算...");

    try {
      // 给 UI 渲染留一点时间
      await new Promise((r) => setTimeout(r, 50));

      const inputTensor = preprocess(imageElement, 640, 640);
      const results = await session.run({ images: inputTensor });
      const maskCanvas = postprocess(results.output0, results.output1);

      setStatus("处理完成");
      setIsProcessing(false);
      return maskCanvas;
    } catch (e) {
      console.error(e);
      setStatus("推理出错");
      setIsProcessing(false);
      throw e;
    }
  };

  return { isReady, status, isProcessing, runInference };
};
