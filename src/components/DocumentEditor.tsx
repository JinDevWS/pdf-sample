import { useRef, useState } from "react";
import axios from "axios";
import { toSvg } from "html-to-image";

export default function DocumentEditor() {
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [svgPreview, setSvgPreview] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownloadPdf = async () => {
    try {
      if (!previewRef.current) return;

      // HTML을 SVG 문자열로 변환
      const svgString = await toSvg(previewRef.current);

      const res = await axios.post(
        "http://localhost:8080/api/pdf", // Spring Boot 컨트롤러 엔드포인트
        { svg: svgString },
        {
          responseType: "blob", // PDF 이진 데이터 받기
          headers: { "Content-Type": "application/json" },
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "generated.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF 다운로드 실패", err);
    }
  };

  // SVG 미리보기 생성 핸들러
  const handlePreviewSvg = async () => {
    try {
      if (!previewRef.current) return;
      const svgString = await toSvg(previewRef.current);
      console.log("SVG 문자열 시작 여부:", svgString.startsWith("<svg"));
      console.log("SVG 문자열:", svgString);
      // SVG 문자열을 그대로 상태에 저장
      setSvgPreview(svgString);
    } catch (err) {
      console.error("SVG 미리보기 생성 실패", err);
    }
  };

  return (
    <div style={{ display: "flex", gap: 24 }}>
      {/* 입력 폼 */}
      <div style={{ width: 300 }}>
        <h3>입력</h3>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="성명"
        />
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="주소"
        />
        <button onClick={handleDownloadPdf} style={{ marginTop: 16 }}>
          PDF 다운로드
        </button>
        <button onClick={handlePreviewSvg} style={{ marginTop: 8 }}>
          SVG 미리보기 생성
        </button>
      </div>

      {/* HTML 기반 실시간 미리보기 */}
      <div>
        <h3>미리보기</h3>
        <div
          ref={previewRef}
          style={{
            width: "500px",
            height: "700px",
            border: "1px solid #ccc",
            background: "white",
            padding: "40px",
            fontFamily: "sans-serif",
          }}
        >
          <h1 style={{ textAlign: "center" }}>문서 제목</h1>
          <p>성명: {formData.name}</p>
          <p>주소: {formData.address}</p>
          <p style={{ marginTop: "80px", textAlign: "right" }}>
            날짜: __________
          </p>
        </div>
        {svgPreview && (
          <div style={{ marginTop: 24 }}>
            <h4>SVG 미리보기</h4>
            <iframe
              src={URL.createObjectURL(
                new Blob([svgPreview], { type: "image/svg+xml" })
              )}
              style={{
                width: "500px",
                height: "700px",
                border: "1px solid #aaa",
                background: "#fff",
              }}
              title="SVG Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
