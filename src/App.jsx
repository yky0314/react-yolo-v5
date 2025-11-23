import React, { useState, useRef } from "react";
import { Layout, Typography, Alert, Row, Col, message } from "antd";
import { useYoloModel } from "./hooks/useYoloModel";
import ImageUploader from "./components/ImageUploader";
import ResultCanvas from "./components/ResultCanvas";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const MODEL_PATH = "/model/yolov5s-seg.onnx";

const App = () => {
  const { isReady, status, isProcessing, runInference } =
    useYoloModel(MODEL_PATH);
  const [imageURL, setImageURL] = useState(null);
  const [resultMask, setResultMask] = useState(null);
  const imgRef = useRef(null);

  const handleUpload = (file) => {
    const url = URL.createObjectURL(file);
    setImageURL(url);
    setResultMask(null);
  };

  const handleProcess = async () => {
    if (!imgRef.current) return;
    try {
      const maskCanvas = await runInference(imgRef.current);
      if (maskCanvas) {
        setResultMask(maskCanvas);
        message.success(`识别成功！`);
      } else {
        message.warning("未检测到明显物体，请换张图试试");
      }
    } catch (error) {
      console.error(error);
      message.error("推理过程中发生错误");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 40px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}></span>
            <Title level={4} style={{ margin: 0 }}>
              YOLOv5 在线抠图工具
            </Title>
          </div>
          <Text type="secondary">Powered by ONNX Runtime Web & React</Text>
        </div>
      </Header>

      <Content
        style={{
          padding: "40px 50px",
          maxWidth: 1400,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ✅ 修复点：把 message 改为 title */}
        <Alert
          title="AI 引擎状态"
          description={status}
          type={isReady ? "success" : "info"}
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Row gutter={32}>
          <Col xs={24} lg={12}>
            <ImageUploader
              imageURL={imageURL}
              onUpload={handleUpload}
              onProcess={handleProcess}
              isReady={isReady}
              isProcessing={isProcessing}
              imgRef={imgRef}
            />
          </Col>
          <Col xs={24} lg={12}>
            <ResultCanvas
              maskCanvas={resultMask}
              originalImage={imgRef.current}
              isProcessing={isProcessing}
            />
          </Col>
        </Row>
      </Content>

      <Footer style={{ textAlign: "center", color: "#888" }}>
        React YOLOv5 Segmentation Demo ©2025 Created for Internship Project
      </Footer>
    </Layout>
  );
};

export default App;
