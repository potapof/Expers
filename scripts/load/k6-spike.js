/* eslint-disable import/no-anonymous-default-export */
import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 200 },
    { duration: "30s", target: 200 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.05"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:8080";

export default function () {
  // Only fast endpoints during spike
  const r = http.get(`${BASE}/api/health`);
  check(r, { "health ok": (r) => r.status === 200 });

  const catalog = http.get(`${BASE}/api/articles`);
  check(catalog, { "catalog ok": (r) => r.status === 200 });
}
