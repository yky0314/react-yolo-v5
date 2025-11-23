import React, { useEffect, useRef } from "react";
import { Card, Button, Spin, Empty } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const ResultCanvas = ({ maskCanvas, originalImage, isProcessing }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!maskCanvas || !originalImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = originalImage.naturalWidth;
    canvas.height = originalImage.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
  }, [maskCanvas, originalImage]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `matting_result_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <Card
      title="2. 抠图结果"
      variant="borderless"
      extra={
        maskCanvas && (
          <Button
            type="primary"
            ghost
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            保存 PNG
          </Button>
        )
      }
    >
      <Spin spinning={isProcessing} tip="正在进行像素级分割...">
        <div
          style={{
            height: 420,
            background:
              'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAjyQc6wcEGAIAoLwXkNjI+KUAAAAASUVORK5CYII=") repeat',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            border: "1px solid #eee",
            overflow: "hidden",
          }}
        >
          {maskCanvas ? (
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无结果，请在左侧开始"
            />
          )}
        </div>
      </Spin>
    </Card>
  );
};

export default ResultCanvas;
