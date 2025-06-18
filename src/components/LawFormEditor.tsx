import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export default function LawformEditor() {
  // 사용자 입력값 상태
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  // HTML 미리보기를 참조하는 ref
  const htmlRef = useRef<HTMLDivElement | null>(null);

  // SVG 미리보기 URL
  const [svgUrl, setSvgUrl] = useState<string>("");

  // 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // HTML → SVG 변환 함수
  const generateSvg = async () => {
    if (htmlRef.current) {
      try {
        const dataUrl = await toPng(htmlRef.current);
        setSvgUrl(dataUrl);
      } catch (err) {
        console.error("SVG 변환 실패", err);
      }
    }
  };

  // PDF 다운로드
  const generatePdf = async () => {
    if (!htmlRef.current) return;

    try {
      // toPng를 사용하여 PNG 이미지 생성
      const pngDataUrl = await toPng(htmlRef.current, { pixelRatio: 2 });

      const pdf = new jsPDF({ unit: "px", format: "a4" });

      // 이미지 객체를 직접 await 처리
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = pngDataUrl;
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // 이미지 비율 유지하여 PDF에 맞게 크기 조정 및 중앙 정렬
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const pageRatio = pageWidth / pageHeight;
      const imgRatio = imgWidth / imgHeight;

      let renderWidth = pageWidth;
      let renderHeight = pageHeight;

      if (imgRatio > pageRatio) {
        // 이미지가 더 넓음
        renderWidth = pageWidth;
        renderHeight = pageWidth / imgRatio;
      } else {
        // 이미지가 더 높음
        renderHeight = pageHeight;
        renderWidth = pageHeight * imgRatio;
      }

      // 중앙 정렬을 위한 좌표 계산
      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;

      pdf.addImage(img, "PNG", x, y, renderWidth, renderHeight);
      pdf.save("document.pdf");
    } catch (err) {
      console.error("PDF 생성 실패", err);
    }
  };

  return (
    <div style={{ display: "flex", gap: 24 }}>
      {/* 입력 영역 */}
      <div style={{ width: 300 }}>
        <h3>입력 폼</h3>
        <label>
          이름: <br />
          <input name="name" value={formData.name} onChange={handleChange} />
        </label>
        <br />
        <label>
          주소: <br />
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </label>
        <br />
        <button onClick={generateSvg} style={{ marginTop: 16 }}>
          샘플 문서 미리보기
        </button>
        <button onClick={generatePdf} style={{ marginTop: 8 }}>
          PDF 저장
        </button>
      </div>

      {/* HTML 기반 실시간 미리보기 */}
      <div>
        <h3>실시간 미리보기</h3>
        <div
          ref={htmlRef}
          style={{
            border: "1px solid #ccc",
            padding: 20,
            width: 500,
            fontFamily: "sans-serif",
            backgroundColor: "white",
          }}
        >
          <h1 style={{ textAlign: "center" }}>문서 제목</h1>
          <p>성명: {formData.name}</p>
          <p>주소: {formData.address}</p>
          <p style={{ marginTop: 80, textAlign: "right" }}>날짜: ___________</p>
        </div>
      </div>

      {/* SVG 미리보기 */}
      <div>
        <h3>SVG 문서 미리보기</h3>
        {svgUrl && (
          <img
            src={svgUrl}
            alt="SVG 미리보기"
            style={{ border: "1px solid #ccc", width: 500 }}
          />
        )}
      </div>
    </div>
  );
}
