// The Jev call. Jev is a System One model: it answers typed questions about a state
// and returns a value plus a confidence, not text. Docs: https://docs.typesafe.ai
// "server-only" keeps the API key and this whole module out of the client graph.
import "server-only";
import { TypeSafeClient, choice } from "@typesafe-ai/sdk";
import type { Category } from "./types";

// The options Jev picks between. `satisfies` ties them to the union in lib/types.ts:
// add a category there and this object stops compiling until you describe it here.
const categoryCriteria = {
  frontend: "Browser user interfaces, React, rendering, routing, CSS, component code.",
  backend: "Servers, APIs, business logic, queues, background jobs, server frameworks.",
  mobile: "iOS, Android, React Native, mobile apps and app store delivery.",
  ai: "Models, agents, coding assistants, prompts, MCP servers, code generation.",
  "data-engineering": "Pipelines, streaming, ETL, warehouses, analytics, large scale data processing.",
  databases: "Schema design, queries, indexes, transactions, migrations, ORMs.",
  devops: "CI and CD, builds, containers, deployment, monitoring, incident response.",
  cloud: "Cloud platforms, serverless, edge runtimes, infrastructure as code, cost.",
  security: "Authentication, authorization, secrets, vulnerabilities, supply chain, privacy.",
  performance: "Speed, memory, bundle size, caching, profiling, load, Core Web Vitals.",
  testing: "Unit tests, integration tests, end to end tests, mocking, test tooling.",
  accessibility: "Screen readers, keyboard use, ARIA, contrast, inclusive user interfaces.",
  "design-systems": "Component libraries, design tokens, theming, the designer and developer handoff.",
  "developer-tools": "Editors, compilers, bundlers, linters, package managers, local tooling.",
  architecture: "System design, microservices, monoliths, boundaries, scaling, trade-offs.",
  networking: "HTTP, protocols, DNS, CDNs, WebSockets, latency, the network layer.",
  embedded: "Firmware, microcontrollers, robotics, IoT devices, hardware near software.",
  blockchain: "Smart contracts, wallets, distributed ledgers, cryptocurrency, web3.",
} satisfies Record<Category, string>;

// Above this confidence the app acts on Jev's answer by itself. Below it, a human decides.
// The number is low because the answer is split over eighteen categories.
// See https://docs.typesafe.ai/patterns/confidence-routing
export const AUTO_FILE_ABOVE = 0.5;

export type Triage = {
  // Typed by the criteria above, so this is the Category union. No cast, no parsing.
  category: Category;
  confidence: number;
  probabilities: Record<Category, number>;
  model: string;
};

// Returns null when no key is set. The caller then asks the human instead.
export async function triageTalk(title: string): Promise<Triage | null> {
  if (!process.env.TYPESAFE_API_KEY) return null;

  const client = new TypeSafeClient();
  const { answers, model } = await client.systemOne({
    state: { talk_title: title },
    questions: {
      category: choice("Which technology category does this conference talk belong to?", categoryCriteria),
    },
  });

  return {
    category: answers.category.choice,
    confidence: answers.category.confidence,
    probabilities: answers.category.probabilities,
    model,
  };
}
