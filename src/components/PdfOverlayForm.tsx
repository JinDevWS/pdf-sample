import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.js?url";

GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PdfOverlayForm() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [name, setName] = useState("");

  // PDF 렌더링
  useEffect(() => {
    const renderPdf = async () => {
      const loadingTask = getDocument("/sample.pdf"); // 퍼블릭 폴더 기준
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      const ratio = window.devicePixelRatio || 1;

      canvas.width = viewport.width * ratio;
      canvas.height = viewport.height * ratio;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      await page.render({ canvasContext: context, viewport }).promise;

      drawText(context);
    };

    renderPdf();
  }, []);

  // 텍스트 실시간 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // 원본 PDF는 다시 안 그리고, 텍스트만 덧씌움
    drawText(context);
  }, [name]);

  const drawText = (ctx: CanvasRenderingContext2D) => {
    const ratio = window.devicePixelRatio || 1;

    // 위치와 스타일 지정 후 텍스트 덧씌우기
    ctx.font = `${20 * ratio}px Arial`;
    ctx.fillStyle = "red";

    // 예: x=100, y=150 위치에 name 출력 (배율 적용)
    ctx.fillText(name, 100 * ratio, 150 * ratio);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="이름 입력"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid #ccc", marginTop: 10 }}
      />
    </div>
  );
}
