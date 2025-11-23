# React + YOLOv5 在线抠图工具 (WebAssembly)

这是一个基于 React 和 ONNX Runtime Web 的纯前端 AI 抠图项目。
它利用浏览器端的 WebAssembly 能力，加载 YOLOv5-seg 模型实现实时的像素级物体分割，无需后端服务器支持。

## 功能特点

- **纯前端推理**：基于 ONNX Runtime Web (WASM)，保护用户隐私，无需上传图片到服务器。
- **自定义 Hook 封装**：实现了 `useYoloModel` Hook，逻辑与 UI 分离。
- **高性能后处理**：实现了 JS 版的 NMS (非极大值抑制) 和 Mask 裁剪算法。
- **UI 组件化**：使用 Ant Design 构建现代化界面。

## 技术栈

- React 18 + Vite
- ONNX Runtime Web
- Ant Design
- YOLOv5 (Segmentation Model)

## 如何运行

1. 克隆项目
   ```bash
   git clone <你的GitHub仓库地址>