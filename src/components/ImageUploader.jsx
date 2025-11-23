import React from "react";
import { Card, Upload, Button, message } from "antd";
import { UploadOutlined, ThunderboltOutlined } from "@ant-design/icons";

const ImageUploader = ({
  imageURL,
  onUpload,
  onProcess,
  isReady,
  isProcessing,
  imgRef,
}) => {
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("只能上传图片文件！");
      return Upload.LIST_IGNORE;
    }
    onUpload(file);
    return false;
  };

  return (
    <Card
      title="1. 原始图像"
      variant="borderless"
      extra={
        <Upload
          beforeUpload={beforeUpload}
          showUploadList={false}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>选择图片</Button>
        </Upload>
      }
    >
      <div
        style={{
          height: 350,
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed #d9d9d9",
          borderRadius: 8,
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        {imageURL ? (
          <img
            ref={imgRef}
            src={imageURL}
            alt="Source"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <div style={{ textAlign: "center", color: "#ccc" }}>
            <UploadOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <br />
            请上传一张包含物体或人物的照片
          </div>
        )}
      </div>

      <Button
        type="primary"
        size="large"
        block
        icon={<ThunderboltOutlined />}
        onClick={onProcess}
        loading={isProcessing}
        disabled={!isReady || !imageURL}
      >
        {isProcessing ? "AI 正在推理中..." : "开始智能抠图"}
      </Button>
    </Card>
  );
};

export default ImageUploader;
