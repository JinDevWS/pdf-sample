// 실시간 svg 미리보기 + pdf 다운로드(백엔드)

import { useState, useRef } from "react";
import { SvgTextTemplate } from "./SvgTextTemplate";
import axios from "axios";

export default function SvgEditor() {
  const [form, setForm] = useState({
    sender: "",
    recipient: "",
    title: "내용증명",
    content: [
      "귀하의 무궁한 발전을 기원합니다.",
      "본 발신인은 귀하에게 아래와 같이 돈을 빌려주었습니다.",
    ],
  });

  const svgRef = useRef<SVGSVGElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (index: number, value: string) => {
    const updated = [...form.content];
    updated[index] = value;
    setForm((prev) => ({ ...prev, content: updated }));
  };

  const handleDownloadPdf = async () => {
    try {
      console.log("보내는 데이터", {
        name: form.sender,
        address: form.recipient,
        content1: form.content[0],
        content2: form.content[1],
      });

      const res = await axios.post(
        "http://localhost:8080/api/pdf",
        {
          name: form.sender,
          address: form.recipient,
          content1: form.content[0] || "",
          content2: form.content[1] || "",
        },
        {
          responseType: "blob",
          headers: { "Content-Type": "application/json" },
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "generated.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF 다운로드 실패", err);
    }
  };

  return (
    <div style={{ display: "flex", gap: 32 }}>
      {/* 입력 폼 */}
      <div>
        <h3>문서 입력</h3>
        <label>
          발신인:
          <input
            name="sender"
            value={form.sender}
            onChange={handleChange}
            style={{ display: "block", marginBottom: 8 }}
          />
        </label>
        <label>
          수신인:
          <input
            name="recipient"
            value={form.recipient}
            onChange={handleChange}
            style={{ display: "block", marginBottom: 8 }}
          />
        </label>
        {form.content.map((line, idx) => (
          <label key={idx}>
            본문 {idx + 1}:
            <input
              value={line}
              onChange={(e) => handleContentChange(idx, e.target.value)}
              style={{ display: "block", marginBottom: 8 }}
            />
          </label>
        ))}
        <button onClick={handleDownloadPdf}>PDF 다운로드</button>
      </div>

      {/* SVG 샘플 문서 보기 */}
      <div>
        <h3>샘플 문서</h3>
        <SvgTextTemplate
          ref={svgRef}
          sender={form.sender}
          recipient={form.recipient}
          title={form.title}
          content={form.content}
        />
      </div>
    </div>
  );
}
