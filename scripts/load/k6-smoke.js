/* eslint-disable import/no-anonymous-default-export */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [{ duration: "5s", target: 1 }],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.05"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:8080";

export default function () {
  // Health check
  const health = http.get(`${BASE}/api/health`);
  check(health, { "health returns 200": (r) => r.status === 200 });

  // Catalog
  const catalog = http.get(`${BASE}/api/articles`);
  check(catalog, { "catalog returns 200": (r) => r.status === 200 });

  // Static pages
  const about = http.get(`${BASE}/about`);
  check(about, { "about returns 200": (r) => r.status === 200 });

  const contacts = http.get(`${BASE}/contacts`);
  check(contacts, { "contacts returns 200": (r) => r.status === 200 });

  const offer = http.get(`${BASE}/offer`);
  check(offer, { "offer returns 200": (r) => r.status === 200 });

  const privacy = http.get(`${BASE}/privacy`);
  check(privacy, { "privacy returns 200": (r) => r.status === 200 });

  const refund = http.get(`${BASE}/refund`);
  check(refund, { "refund returns 200": (r) => r.status === 200 });

  // Login
  const login = http.post(
    `${BASE}/api/auth/login`,
    JSON.stringify({
      email: "reader@test.expers.ru",
      password: "test123456",
    }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(login, { "login returns 200": (r) => r.status === 200 });

  sleep(1);
}
