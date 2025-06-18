import { forwardRef } from "react";

interface HtmlTextTemplateProps {
  sender: string;
  recipient: string;
  title: string;
  content: string[];
}

export const HtmlTextTemplate = forwardRef<
  HTMLDivElement,
  HtmlTextTemplateProps
>(({ sender, recipient, title, content }, ref) => {
  return (
    <div
      ref={ref}
      style={{ background: "#fff", width: "640px", height: "900px" }}
    >
      {/* 제목 */}
      <p
        style={{
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        {title}
      </p>

      {/* 발신인 영역 */}
      <p style={{ fontSize: "16", fontWeight: "bold" }}>발신인</p>
      <p style={{ fontSize: "14" }}>{sender}</p>

      {/* 수신인 영역 */}
      <p style={{ fontSize: "16", fontWeight: "bold" }}>수신인</p>
      <p style={{ fontSize: "14" }}>{recipient}</p>

      {/* 본문 */}
      <p style={{ fontSize: "16", fontWeight: "bold" }}>제목 : {title}</p>
      {content.map((line, idx) => (
        <p key={idx} style={{ fontSize: "14" }}>
          {`${idx + 1}. ${line}`}
        </p>
      ))}
    </div>
  );
});

HtmlTextTemplate.displayName = "HtmlTextTemplate";
