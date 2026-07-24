/* eslint-disable import/no-anonymous-default-export */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 100 },
    { duration: "2m", target: 100 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.02"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:8080";

export default function () {
  const endpoints = [
    () => http.get(`${BASE}/api/health`),
    () => http.get(`${BASE}/api/articles`),
    () => http.get(`${BASE}/about`),
    () => http.get(`${BASE}/contacts`),
    () =>
      http.post(
        `${BASE}/api/auth/login`,
        JSON.stringify({
          email: "reader@test.expers.ru",
          password: "test123456",
        }),
        { headers: { "Content-Type": "application/json" } }
      ),
  ];

  const fn = endpoints[Math.floor(Math.random() * endpoints.length)];
  const r = fn();
  check(r, { "status ok": (r) => [200, 201].includes(r.status) });
  sleep(1);
}
