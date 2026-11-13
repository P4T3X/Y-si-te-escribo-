import { getStore } from "@netlify/blobs";
import { makeApp } from "./core.mjs";

export default async (req) => {
  const store = getStore("ysite");
  const app = makeApp({ store, env: process.env });
  return app(req);
};

export const config = { path: "/api/*" };
