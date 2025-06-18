// 실시간 HTML 미리보기 + pdf 다운로드(백엔드)

import { useState, useRef } from "react";
import axios from "axios";
import { HtmlTextTemplate } from "./HtmlTextTemplate";
import { Document, Page, pdfjs } from "react-pdf";

// public 폴더 기준 경로(node_modules 내부 파일 복붙)
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

export default function HtmlEditorPdf() {
  const [isChanging, setIsChanging] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    sender: "",
    recipient: "",
    title: "내용증명",
    content: [
      "귀하의 무궁한 발전을 기원합니다.",
      "본 발신인은 귀하에게 아래와 같이 돈을 빌려주었습니다.",
    ],
  });

  const htmlRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChanging(true);
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (index: number, value: string) => {
    setIsChanging(true);
    const updated = [...form.content];
    updated[index] = value;
    setForm((prev) => ({ ...prev, content: updated }));
  };

  const handlePreviewPdf = async () => {
    const res = await axios.post("http://localhost:8080/api/generate-pdf", {
      name: form.sender,
      address: form.recipient,
      content1: form.content[0] || "",
      content2: form.content[1] || "",
    });

    // setPdfData(new Uint8Array(res.data));

    const { pdfBase64, pages } = res.data;

    const byteArray = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
    setPdfData(byteArray);
    setPageCount(pages);
    setCurrentPage(1); // 새로 불러올 때 첫 페이지로 초기화
    setIsChanging(false);
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
        <button onClick={handlePreviewPdf}>PDF 미리보기</button>
        <button onClick={handleDownloadPdf}>PDF 다운로드</button>
      </div>

      {/* html 샘플 문서 보기 */}
      <div>
        <h3>샘플 문서</h3>
        <HtmlTextTemplate
          ref={htmlRef}
          sender={form.sender}
          recipient={form.recipient}
          title={form.title}
          content={form.content}
        />
      </div>

      {!isChanging && pdfData && (
        <div>
          <Document
            file={{ data: pdfData }}
            onLoadSuccess={({ numPages }) => setPageCount(numPages)}
          >
            <Page
              pageNumber={currentPage}
              width={600}
              renderTextLayer={false} // 이거 끄면 textLayer 안 보임
              renderAnnotationLayer={false} // 이거 끄면 annotationLayer 안 보임
            />
          </Document>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              이전
            </button>
            <span>
              {currentPage} / {pageCount}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, pageCount))}
              disabled={currentPage === pageCount}
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
