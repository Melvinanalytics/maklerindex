import { loadBundle } from "./okf.ts";
import { rankCity } from "./ranking.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

interface JsonRpc {
  jsonrpc?: string;
  id?: number | string | null;
  method?: string;
  params?: unknown;
}

function writeMessage(message: unknown): void {
  const payload = JSON.stringify(message);
  const header = `Content-Length: ${Buffer.byteLength(payload, "utf8")}\r\n\r\n`;
  process.stdout.write(header + payload);
}

function result(id: number | string | null | undefined, value: unknown): void {
  writeMessage({ jsonrpc: "2.0", id: id ?? null, result: value });
}

function error(id: number | string | null | undefined, message: string): void {
  writeMessage({
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code: -32603, message },
  });
}

const tools = [
  {
    name: "list_cities",
    description: "Cities with a Maklerindex ranking. v1 is Hannover only.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "rank_city",
    description:
      "Attested city ranking. Do not invent an order. size_band is a filter, never a score.",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string" },
      },
      required: ["city"],
    },
  },
  {
    name: "get_makler",
    description: "One Makler concept. Read trust signals in frontmatter before the body.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
      },
      required: ["slug"],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const asOf = new Date("2026-08-25T12:00:00Z");
  if (name === "list_cities") {
    return { cities: [{ slug: "hannover", title: "Hannover" }] };
  }
  if (name === "rank_city") {
    const city = String(args.city ?? "");
    const ranking = rankCity(bundle, city, asOf);
    return {
      city: ranking.city,
      computation: ranking.computation_file,
      receipt: ranking.receipt,
      rows: ranking.rows,
      note: "Factory size_band is excluded. Headcount is not a score input.",
    };
  }
  if (name === "get_makler") {
    const slug = String(args.slug ?? "");
    const office = bundle.makler.find((item) => item.slug === slug);
    if (!office) throw new Error(`unknown makler ${slug}`);
    return office;
  }
  throw new Error(`unknown tool ${name}`);
}

async function handle(message: JsonRpc): Promise<void> {
  const id = message.id;
  const method = message.method ?? "";
  try {
    if (method === "initialize") {
      result(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "maklerindex", version: "0.1.0" },
      });
      return;
    }
    if (method === "notifications/initialized" || method === "initialized") {
      return;
    }
    if (method === "tools/list") {
      result(id, { tools });
      return;
    }
    if (method === "tools/call") {
      const params = (message.params ?? {}) as {
        name?: string;
        arguments?: Record<string, unknown>;
      };
      const name = params.name ?? "";
      const value = await callTool(name, params.arguments ?? {});
      result(id, {
        content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
      });
      return;
    }
    if (method === "ping") {
      result(id, {});
      return;
    }
    error(id, `unknown method ${method}`);
  } catch (caught) {
    const text = caught instanceof Error ? caught.message : String(caught);
    error(id, text);
  }
}

let buffer = Buffer.alloc(0);

process.stdin.on("data", (chunk: Buffer) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (true) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;
    const header = buffer.slice(0, headerEnd).toString("utf8");
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match?.[1]) {
      buffer = buffer.slice(headerEnd + 4);
      continue;
    }
    const length = Number(match[1]);
    const start = headerEnd + 4;
    if (buffer.length < start + length) return;
    const body = buffer.slice(start, start + length).toString("utf8");
    buffer = buffer.slice(start + length);
    void handle(JSON.parse(body) as JsonRpc);
  }
});

process.stdin.on("end", () => {
  process.exit(0);
});
