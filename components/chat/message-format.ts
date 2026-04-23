export type ChatMessageSegment =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "code";
      content: string;
      language: string;
      terminal: boolean;
    };

const FENCED_CODE_BLOCK_PATTERN = /```([\w#+.-]*)\n?([\s\S]*?)```/g;
const TERMINAL_PREFIX_PATTERN =
  /^\s*(?:\$|#|>|(?:pnpm|npm|yarn|bun|npx|node|git|cargo|rustc|python|pip|docker|kubectl|ssh|brew|ls|cd|mkdir|rm|cp|mv|cat|curl|wget)\b)/i;
const SQL_PATTERN =
  /\b(select|insert|update|delete|from|where|order by|group by|join|inner join|left join|limit)\b/i;
const HTML_PATTERN = /<\/?[a-z][\w:-]*(?:\s+[\w:-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>/i;
const CSS_PATTERN = /[.#]?[a-z0-9_-]+\s*\{[\s\S]*:[\s\S]*;[\s\S]*\}/i;

function normalizeLanguage(language: string | undefined) {
  if (!language) {
    return "";
  }

  const lower = language.trim().toLowerCase();
  if (["ts", "tsx", "typescript"].includes(lower)) return "typescript";
  if (["js", "jsx", "javascript"].includes(lower)) return "javascript";
  if (["sh", "bash", "shell", "zsh"].includes(lower)) return "bash";
  if (["json", "jsonc"].includes(lower)) return "json";
  if (["html", "xml"].includes(lower)) return "html";
  if (["css", "scss", "sass"].includes(lower)) return "css";
  if (["sql", "postgresql", "mysql"].includes(lower)) return "sql";
  if (["md", "markdown"].includes(lower)) return "markdown";
  return lower;
}

function isLikelyJson(block: string) {
  const trimmed = block.trim();
  if (!trimmed) return false;
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return false;
  if (!(trimmed.endsWith("}") || trimmed.endsWith("]"))) return false;

  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

function isTerminalBlock(block: string) {
  const lines = block.split("\n").filter((line) => line.trim().length > 0);
  if (!lines.length) return false;
  const terminalLines = lines.filter((line) => TERMINAL_PREFIX_PATTERN.test(line)).length;
  return terminalLines >= Math.max(1, Math.ceil(lines.length * 0.6));
}

function looksLikeCodeLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (TERMINAL_PREFIX_PATTERN.test(trimmed)) return true;
  if (HTML_PATTERN.test(trimmed)) return true;
  if (SQL_PATTERN.test(trimmed)) return true;
  if (/^[\]}),;]+$/.test(trimmed)) return true;
  if (/[{}[\]();=>]/.test(trimmed)) return true;
  if (/\b(import|export|const|let|var|function|return|await|async|class|interface|type|if|else)\b/.test(trimmed)) {
    return true;
  }
  if (/^\s*[\w$-]+\s*:\s*["'`[{0-9-]/.test(trimmed)) return true;
  if (/^\s*--[\w-]+/.test(trimmed)) return true;
  return false;
}

function detectLanguage(block: string) {
  if (isTerminalBlock(block)) return "bash";
  if (isLikelyJson(block)) return "json";
  if (HTML_PATTERN.test(block)) return "html";
  if (CSS_PATTERN.test(block)) return "css";
  if (SQL_PATTERN.test(block)) return "sql";
  if (/\b(interface|type)\s+[A-Z]/.test(block) || /:\s*(string|number|boolean|unknown|Record<)/.test(block)) {
    return "typescript";
  }
  if (/\b(import|export|const|let|var|function|=>)\b/.test(block)) {
    return "javascript";
  }
  return "text";
}

function isProbablyCodeBlock(block: string) {
  if (!block.trim()) return false;
  if (isTerminalBlock(block) || isLikelyJson(block) || HTML_PATTERN.test(block) || SQL_PATTERN.test(block)) {
    return true;
  }

  const lines = block.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length < 2) return false;
  const codeLikeCount = lines.filter(looksLikeCodeLine).length;
  return codeLikeCount >= Math.max(2, Math.ceil(lines.length * 0.55));
}

function pushTextSegments(segments: ChatMessageSegment[], source: string) {
  const trimmedSource = source.replace(/^\n+|\n+$/g, "");
  if (!trimmedSource.trim()) {
    return;
  }

  const blocks = trimmedSource
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  for (const block of blocks) {
    if (isProbablyCodeBlock(block)) {
      const language = detectLanguage(block);
      segments.push({
        type: "code",
        content: block,
        language,
        terminal: language === "bash",
      });
      continue;
    }

    segments.push({
      type: "text",
      content: block,
    });
  }
}

export function parseChatMessage(body: string): ChatMessageSegment[] {
  if (!body.trim()) {
    return [{ type: "text", content: "" }];
  }

  const segments: ChatMessageSegment[] = [];
  let lastIndex = 0;
  let match = FENCED_CODE_BLOCK_PATTERN.exec(body);

  while (match) {
    const [fullMatch, rawLanguage, rawCode] = match;
    const startIndex = match.index;

    if (startIndex > lastIndex) {
      pushTextSegments(segments, body.slice(lastIndex, startIndex));
    }

    const normalizedLanguage = normalizeLanguage(rawLanguage) || detectLanguage(rawCode);
    const content = rawCode.replace(/\n+$/g, "");
    if (content.trim()) {
      segments.push({
        type: "code",
        content,
        language: normalizedLanguage,
        terminal: normalizedLanguage === "bash",
      });
    }

    lastIndex = startIndex + fullMatch.length;
    match = FENCED_CODE_BLOCK_PATTERN.exec(body);
  }

  if (lastIndex < body.length) {
    pushTextSegments(segments, body.slice(lastIndex));
  }

  return segments.length ? segments : [{ type: "text", content: body }];
}
