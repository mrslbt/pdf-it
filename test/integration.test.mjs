#!/usr/bin/env node
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { mkdtempSync, statSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const PASS = "\x1b[32m✓\x1b[0m";
const FAIL = "\x1b[31m✗\x1b[0m";
const INFO = "\x1b[36m·\x1b[0m";

let failures = 0;
function check(label, cond, detail) {
  if (cond) {
    console.log(`${PASS} ${label}`);
  } else {
    failures++;
    console.log(`${FAIL} ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const SAMPLE_MARKDOWN = `# Test Report

This is a generated test document used by the pdf-it integration test.

## Section A

Some prose with **bold** and *italic* text.

## Section B

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

A short list:

- Item one
- Item two
- Item three

## Section C

Final paragraph to give the renderer enough content to span more than
one page when rendered with the research-report template.
`;

const tmpDir = mkdtempSync(path.join(tmpdir(), "pdf-it-test-"));
const outputPath = path.join(tmpDir, "output.pdf");
console.log(`${INFO} Output path: ${outputPath}`);

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"],
});

const client = new Client(
  { name: "pdf-it-integration-test", version: "1.0.0" },
  { capabilities: {} }
);

try {
  await client.connect(transport);
  console.log(`${PASS} Server connected`);

  const tools = await client.listTools();
  const toolNames = tools.tools.map((t) => t.name);
  check("tools/list contains generate_pdf", toolNames.includes("generate_pdf"));
  check("tools/list contains list_templates", toolNames.includes("list_templates"));

  const prompts = await client.listPrompts();
  const promptNames = prompts.prompts.map((p) => p.name);
  for (const name of ["research_report", "quick_note", "pdf_outline"]) {
    check(`prompts/list contains ${name}`, promptNames.includes(name));
  }

  const resources = await client.listResources();
  const resourceUris = resources.resources.map((r) => r.uri);
  check(
    "resources/list contains style-guide",
    resourceUris.includes("pdf-it://style-guide")
  );
  check(
    "resources/list contains markdown-cheatsheet",
    resourceUris.includes("pdf-it://markdown-cheatsheet")
  );

  console.log(`${INFO} Listing templates`);
  const tmplResult = await client.callTool({
    name: "list_templates",
    arguments: {},
  });
  check("list_templates did not error", !tmplResult.isError);
  const tmplText = tmplResult.content.map((c) => c.text).join("\n");
  check("list_templates mentions research-report", /research-report/.test(tmplText));
  check("list_templates mentions plain", /plain/.test(tmplText));

  console.log(`${INFO} Generating PDF (research-report template)`);
  const result = await client.callTool({
    name: "generate_pdf",
    arguments: {
      content: SAMPLE_MARKDOWN,
      title: "pdf-it integration test",
      author: "CI",
      template: "research-report",
      output_path: outputPath,
    },
  });

  const summaryText = result.content.find((c) => c.type === "text");
  if (result.isError) {
    console.log(`${INFO} generate_pdf error: ${summaryText?.text}`);
  }
  check("generate_pdf did not error", !result.isError);

  let stat;
  try {
    stat = statSync(outputPath);
  } catch (e) {
    check("PDF written to disk", false, e.message);
  }
  if (stat) {
    check("PDF written to disk", true);
    check("PDF is non-trivial size (> 5 KB)", stat.size > 5_000, `${stat.size} bytes`);

    const head = readFileSync(outputPath).subarray(0, 5).toString("ascii");
    check("file starts with %PDF- magic bytes", head.startsWith("%PDF-"), `header=${JSON.stringify(head)}`);
  }

  console.log(`${INFO} Closing client`);
  await client.close();
} catch (err) {
  console.log(`${FAIL} Unhandled error: ${err.message}`);
  failures++;
} finally {
  try {
    rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
}

if (failures > 0) {
  console.log(`\n${FAIL} ${failures} check(s) failed`);
  process.exit(1);
}
console.log(`\n${PASS} All checks passed`);
process.exit(0);
