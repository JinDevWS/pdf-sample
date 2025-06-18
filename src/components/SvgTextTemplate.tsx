import { forwardRef } from "react";

interface SvgTextTemplateProps {
  sender: string;
  recipient: string;
  title: string;
  content: string[];
}

export const SvgTextTemplate = forwardRef<SVGSVGElement, SvgTextTemplateProps>(
  ({ sender, recipient, title, content }, ref) => {
    return (
      <svg
        ref={ref}
        width={640}
        height={900}
        xmlns="http://www.w3.org/2000/svg"
        style={{ background: "#fff" }}
      >
        {/* 제목 */}
        <text
          x="320"
          y="60"
          fontSize="24"
          textAnchor="middle"
          fontWeight="bold"
        >
          {title}
        </text>

        {/* 발신인 영역 */}
        <text x="60" y="120" fontSize="16" fontWeight="bold">
          발신인
        </text>
        <text x="60" y="150" fontSize="14">
          {sender}
        </text>

        {/* 수신인 영역 */}
        <text x="60" y="200" fontSize="16" fontWeight="bold">
          수신인
        </text>
        <text x="60" y="230" fontSize="14">
          {recipient}
        </text>

        {/* 본문 */}
        <text x="60" y="300" fontSize="16" fontWeight="bold">
          제목 : {title}
        </text>
        {content.map((line, idx) => (
          <text key={idx} x="60" y={340 + idx * 28} fontSize="14">
            {`${idx + 1}. ${line}`}
          </text>
        ))}

        {/* 워터마크 */}
        <text
          x="320"
          y="700"
          fontSize="60"
          textAnchor="middle"
          opacity="0.05"
          transform="rotate(-30 320 700)"
        >
          Sample
        </text>
      </svg>
    );
  }
);

SvgTextTemplate.displayName = "SvgTextTemplate";
