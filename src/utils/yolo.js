import * as ort from "onnxruntime-web";

/**
 * 图像预处理：缩放、归一化、HWC->CHW
 */
export const preprocess = (image, width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high"; // 高质量缩放
  ctx.drawImage(image, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height).data;
  const data = new Float32Array(3 * width * height);

  for (let i = 0; i < width * height; i++) {
    data[i] = imgData[i * 4] / 255.0; // R
    data[i + width * height] = imgData[i * 4 + 1] / 255.0; // G
    data[i + 2 * width * height] = imgData[i * 4 + 2] / 255.0; // B
  }
  return new ort.Tensor("float32", data, [1, 3, height, width]);
};

// Sigmoid 激活函数
const sigmoid = (x) => 1 / (1 + Math.exp(-x));

// IoU 计算 (用于 NMS)
const iou = (box1, box2) => {
  const [x1, y1, w1, h1] = box1;
  const [x2, y2, w2, h2] = box2;
  const inter_area =
    Math.max(
      0,
      Math.min(x1 + w1 / 2, x2 + w2 / 2) - Math.max(x1 - w1 / 2, x2 - w2 / 2)
    ) *
    Math.max(
      0,
      Math.min(y1 + h1 / 2, y2 + h2 / 2) - Math.max(y1 - h1 / 2, y2 - h2 / 2)
    );
  const union_area = w1 * h1 + w2 * h2 - inter_area;
  return inter_area / (union_area + 1e-6);
};

/**
 * 后处理：解析模型输出，执行 NMS，生成最终 Mask
 */
export const postprocess = (output0, output1) => {
  const boxes = output0.cpuData;
  const protos = output1.cpuData;
  const num_anchors = 25200;
  const num_coeffs = 32;
  const mask_w = 160;
  const mask_h = 160;
  const conf_threshold = 0.45;

  // 1. 筛选候选框
  let candidates = [];
  for (let i = 0; i < num_anchors; i++) {
    const offset = i * 117;
    const conf = boxes[offset + 4];
    if (conf > conf_threshold) {
      candidates.push({
        index: i,
        conf: conf,
        box: [
          boxes[offset],
          boxes[offset + 1],
          boxes[offset + 2],
          boxes[offset + 3],
        ], // xywh
        offset: offset,
      });
    }
  }

  // 2. NMS (非极大值抑制)
  candidates.sort((a, b) => b.conf - a.conf);
  const finalCandidates = [];
  while (candidates.length > 0) {
    const best = candidates.shift();
    finalCandidates.push(best);
    candidates = candidates.filter((c) => iou(best.box, c.box) < 0.5);
  }

  if (finalCandidates.length === 0) return null;

  // 3. 绘制 Mask (带 Box 裁剪)
  const masterMaskCanvas = document.createElement("canvas");
  masterMaskCanvas.width = mask_w;
  masterMaskCanvas.height = mask_h;
  const masterCtx = masterMaskCanvas.getContext("2d");
  masterCtx.fillStyle = "#FFFFFF";

  finalCandidates.forEach((item) => {
    const maskCoeffs = [];
    for (let j = 0; j < num_coeffs; j++) {
      maskCoeffs.push(boxes[item.offset + 85 + j]);
    }

    const box_x = item.box[0] / 4;
    const box_y = item.box[1] / 4;
    const box_w = item.box[2] / 4;
    const box_h = item.box[3] / 4;

    // 计算边界
    const x1 = box_x - box_w / 2;
    const x2 = box_x + box_w / 2;
    const y1 = box_y - box_h / 2;
    const y2 = box_y + box_h / 2;

    const currentObjectMaskData = new Float32Array(mask_w * mask_h);

    for (let row = 0; row < mask_h; row++) {
      for (let col = 0; col < mask_w; col++) {
        // 裁剪：框外的像素强制设为 0
        if (col < x1 || col > x2 || row < y1 || row > y2) {
          currentObjectMaskData[row * mask_w + col] = 0;
          continue;
        }
        let sum = 0;
        const idx = row * mask_w + col;
        for (let c = 0; c < num_coeffs; c++) {
          sum += maskCoeffs[c] * protos[c * mask_w * mask_h + idx];
        }
        currentObjectMaskData[idx] = sigmoid(sum);
      }
    }

    // 叠加
    const singleMaskCanvas = document.createElement("canvas");
    singleMaskCanvas.width = mask_w;
    singleMaskCanvas.height = mask_h;
    const ctx = singleMaskCanvas.getContext("2d");
    const imgData = ctx.createImageData(mask_w, mask_h);
    for (let i = 0; i < mask_w * mask_h; i++) {
      const val = currentObjectMaskData[i];
      imgData.data[i * 4] = 255;
      imgData.data[i * 4 + 1] = 255;
      imgData.data[i * 4 + 2] = 255;
      imgData.data[i * 4 + 3] = val > 0.5 ? 255 : 0;
    }
    ctx.putImageData(imgData, 0, 0);
    masterCtx.drawImage(singleMaskCanvas, 0, 0);
  });

  return masterMaskCanvas;
};
