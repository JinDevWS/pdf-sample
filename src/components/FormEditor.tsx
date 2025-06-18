import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.js?url";

GlobalWorkerOptions.workerSrc = pdfjsWorker;

// 초기 필드 데이터를 정의합니다.
// 각 필드는 입력 항목(label)과 해당 값(value), 그리고 PDF 내에 텍스트가 표시될 좌표(x, y)를 포함합니다.
// 좌표 단위는 px이며, PDF의 좌상단을 기준으로 지정됩니다. x는 수평 거리, y는 수직 거리입니다.
const initialFields = [
  { id: "name", label: "성명", value: "", x: 100, y: 150 },
  { id: "address", label: "주소", value: "", x: 100, y: 180 },
];

export default function FormEditor() {
  const [fields, setFields] = useState(initialFields);

  // canvas 엘리먼트를 참조하기 위한 useRef입니다.
  // 이 참조는 PDF 렌더링 시점과 텍스트를 그릴 때 모두 사용됩니다.
  // React가 해당 DOM 요소를 실제로 렌더링한 후에만 값이 설정되며,
  // 따라서 useEffect 안에서 canvasRef.current를 안전하게 사용할 수 있습니다.
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    async function loadPdf() {
      const loadingTask = getDocument("/sample.pdf");
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      // 디스플레이의 고해상도 대응을 위한 배율 설정입니다.
      // devicePixelRatio는 Retina 디스플레이와 같은 고해상도 화면에서 일반 해상도 대비 픽셀 밀도를 나타냅니다.
      // 캔버스 내부 픽셀 수를 실제 표시 영역보다 더 높게 설정하고, 그에 맞게 context의 transform을 조정함으로써
      // 텍스트와 그래픽이 흐릿해지지 않고 선명하게 보이도록 보장합니다.
      const ratio = window.devicePixelRatio || 1;
      canvas.width = viewport.width * ratio;
      canvas.height = viewport.height * ratio;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      await page.render({ canvasContext: context, viewport }).promise;

      drawTexts(context);
    }

    loadPdf();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // 텍스트만 다시 그리기 전에 캔버스를 초기화하는 처리입니다.
    // 단, 이 처리는 기존에 그려진 PDF 렌더링까지 모두 지워버릴 수 있으므로 주의가 필요합니다.
    // 현재는 텍스트를 반영할 때마다 PDF 전체를 다시 그리지 않기 때문에, 이 시점에서는 텍스트만 업데이트되기를 의도한 경우
    // 실제로는 PDF와 텍스트를 분리하거나 레이어 개념으로 재설계하는 것이 바람직할 수 있습니다.
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawTexts(context);
  }, [fields]);

  const drawTexts = (ctx: CanvasRenderingContext2D) => {
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";

    fields.forEach((field) => {
      // 사용자 입력값을 캔버스에 렌더링하는 핵심 부분입니다.
      // fillText는 텍스트의 좌측 baseline을 기준으로 (x, y) 위치에 출력합니다.
      // 따라서 글자가 baseline 기준으로 y 좌표에 정렬되며, 폰트 크기와 정렬에 따라 시각적 위치 조정이 필요할 수 있습니다.
      ctx.fillText(field.value, field.x, field.y);
    });
  };

  const handleChange = (id: string, value: string) => {
    setFields((prevFields) =>
      prevFields.map((f) => (f.id === id ? { ...f, value } : f))
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: 300, padding: 16 }}>
        {fields.map((field) => (
          <div key={field.id} style={{ marginBottom: 8 }}>
            <label>
              {field.label}
              <input
                type="text"
                value={field.value}
                onChange={(e) => handleChange(field.id, e.target.value)}
                style={{ width: "100%" }}
              />
            </label>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <canvas ref={canvasRef} style={{ border: "1px solid #ccc" }} />
      </div>
    </div>
  );
}
