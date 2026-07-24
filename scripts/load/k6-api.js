/* eslint-disable import/no-anonymous-default-export */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "2m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:8080";

function randomArticleId() {
  const ids = [
    "article-2c29c96b-6b6d-4a7f-980d-fe4f933e1a13",
    "article-42178f21-21c1-43c4-b600-229ab46791e7",
  ];
  return ids[Math.floor(Math.random() * ids.length)];
}

export default function () {
  const scenario = Math.random();

  if (scenario < 0.1) {
    // 10% — Health
    const r = http.get(`${BASE}/api/health`);
    check(r, { "health ok": (r) => r.status === 200 });
  } else if (scenario < 0.5) {
    // 40% — Catalog
    const r = http.get(`${BASE}/api/articles`);
    check(r, { "catalog ok": (r) => r.status === 200 });
  } else if (scenario < 0.8) {
    // 30% — Article
    const r = http.get(`${BASE}/api/articles/${randomArticleId()}`);
    check(r, { "article ok": (r) => [200, 404].includes(r.status) });
  } else if (scenario < 0.9) {
    // 10% — Login
    const r = http.post(
      `${BASE}/api/auth/login`,
      JSON.stringify({
        email: "reader@test.expers.ru",
        password: "test123456",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    check(r, { "login ok": (r) => r.status === 200 });
  } else {
    // 10% — Profile
    const login = http.post(
      `${BASE}/api/auth/login`,
      JSON.stringify({
        email: "reader@test.expers.ru",
        password: "test123456",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    const token = login.json("token");
    const r = http.get(`${BASE}/api/expert/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    check(r, { "profile ok": (r) => r.status === 200 });
  }

  sleep(1);
}
