"use client";

import { useEffect, useState } from "react";
import { Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import type { AuthLogRow as AuthLog } from "@/lib/auth-logs";

export default function LogsPage() {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const [range, setRange] = useState<"all" | "today" | "yesterday" | "last7" | "thisMonth" | "lastMonth">("today");

  useEffect(() => {
    let cancelled = false;

    async function fetchLogs() {
      try {
        const res = await fetch("/api/auth/logs", { cache: "no-store", credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setLogs(data);
            setLoading(false);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setLoading(false);
        }
      }
    }

    fetchLogs();
    const id = setInterval(fetchLogs, 5000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  function formatTime(iso: string) {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("th-TH");
  }

  function isInRange(timeIso: string) {
    if (range === "all") return true;
    if (!timeIso) return false;
    const d = new Date(timeIso);
    if (Number.isNaN(d.getTime())) return false;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    if (range === "today") {
      return d >= startOfToday && d < startOfTomorrow;
    }

    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (range === "yesterday") {
      return d >= startOfYesterday && d < startOfToday;
    }

    if (range === "last7") {
      const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      return d >= sevenDaysAgo && d < startOfTomorrow;
    }

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    if (range === "thisMonth") {
      return d >= startOfThisMonth && d < startOfNextMonth;
    }

    if (range === "lastMonth") {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d >= startOfLastMonth && d < startOfThisMonth;
    }

    return true;
  }

  const filteredLogs = logs.filter((log) => isInRange(log.time));
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredLogs.slice(startIndex, startIndex + pageSize);

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Log การเข้าสู่ระบบ
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: 14 }}>
          ประวัติการเข้าสู่ระบบและออกจากระบบของบัญชี
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>ช่วงเวลา:</span>
        {[
          { key: "today", label: "วันนี้" },
          { key: "yesterday", label: "เมื่อวาน" },
          { key: "last7", label: "7 วันที่แล้ว" },
          { key: "thisMonth", label: "เดือนนี้" },
          { key: "lastMonth", label: "เดือนที่แล้ว" },
          { key: "all", label: "ทั้งหมด" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setRange(item.key as any);
              setPage(1);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: range === item.key ? "var(--primary)" : "transparent",
              color: range === item.key ? "#fff" : "var(--text-secondary)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

        <div style={{
        background: "var(--card-bg)",
        borderRadius: 16,
        border: "1px solid var(--border)",
        boxShadow: "var(--card-shadow)",
        overflow: "hidden"
        }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <span>กำลังโหลด...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Clock size={32} strokeWidth={1.5} opacity={0.5} />
            <span>ไม่มีประวัติการใช้งาน</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  <th style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-secondary)" }}>เวลา</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-secondary)" }}>เหตุการณ์</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-secondary)" }}>สถานะ</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-secondary)" }}>IP Address</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-secondary)" }}>Browser</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--list-border)" }} className="transition-all hover:bg-[var(--bg-page)]">
                    <td style={{ padding: "16px 24px", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                      {formatTime(log.time)}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: log.action === "LOGIN" ? "var(--live-bg)" : "var(--border)",
                        color: log.action === "LOGIN" ? "var(--live-text)" : "var(--text-secondary)"
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      {log.success ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--success)", fontWeight: 500 }}>
                          <ShieldCheck size={16} /> สำเร็จ
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--error)", fontWeight: 500 }}>
                          <ShieldAlert size={16} /> ล้มเหลว
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 13 }}>
                      {log.ip}
                    </td>
                    <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.userAgent || "-"}>
                      {(log.userAgent || "-").split(" ")[0]}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--text-secondary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>แสดงต่อหน้า:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg-page)",
              fontSize: 12,
            }}
          >
            {[20, 50, 100, 200].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: currentPage <= 1 ? "transparent" : "var(--bg-page)",
              color: "var(--text-secondary)",
              cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              fontSize: 12,
            }}
          >
            ก่อนหน้า
          </button>
          <span>
            หน้า {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: currentPage >= totalPages ? "transparent" : "var(--bg-page)",
              color: "var(--text-secondary)",
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              fontSize: 12,
            }}
          >
            ถัดไป
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        tr:hover { background-color: var(--bg-page); }
      `}} />
    </div>
  );
}
