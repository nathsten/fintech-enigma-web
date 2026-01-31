import React, { useEffect, useMemo, useRef, useState } from "react";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
} from "chart.js";

// NB: Ikke registrer ChartJS under SSR
if (ExecutionEnvironment.canUseDOM) {
  ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);
}

/* ---------- Hjelpefunksjoner ---------- */

function formatPctFromPercentNumber(p) {
  // p er i "prosentpoeng" (f.eks 13.2)
  if (!Number.isFinite(p)) return "-";
  return `${p.toFixed(2)}%`;
}

/* ---------- Donut Chart (vekting i prosentpoeng) ---------- */

function DonutChart({ labels, values }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Ikke forsøk å tegne graf under SSR
    if (!ExecutionEnvironment.canUseDOM) return;

    let cancelled = false;

    try {
      if (!canvasRef.current) throw new Error("Canvas element not found");

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const ctx = canvasRef.current.getContext("2d");
      const sum = values.reduce((a, b) => a + b, 0) || 1;

      chartRef.current = new ChartJS(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              // values er prosentpoeng (f.eks. 13.2)
              data: values,
              backgroundColor: [
                "#06ADF4",
                "#FF6B6B",
                "#4ECDC4",
                "#45B7D1",
                "#FFA07A",
                "#98D8C8",
                "#F7DC6F",
                "#BB8FCE",
                "#85C1E9",
                "#F5B7B1",
                "#82E0AA",
                "#D7BDE2",
                "#F8C471",
                "#A3E4D7",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: (t) => {
                  const v = Number(t.parsed); // prosentpoeng
                  // Normaliser hvis sum != 100
                  const normalized = (v / sum) * 100;
                  return `${t.label}: ${normalized.toFixed(2)}%`;
                },
              },
            },
          },
        },
      });
    } catch (e) {
      if (!cancelled) setError(e?.message || "Feil ved tegning av graf");
    }

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, values]);

  return (
    <div>
      {error && <div style={{ color: "crimson" }}>Feil: {error}</div>}
      <div style={{ height: 320 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

/* ---------- Side ---------- */

export default function PortefoljeSam() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [positions, setPositions] = useState([]); // [{ posisjon, vekting }]

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const API_URL = "https://fintechenigmaapi.onrender.com/getFundAPISheets";
        const res = await fetch(API_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`Kunne ikke laste porteføljedata (${res.status})`);

        const json = await res.json();

        // API-format (fra meldingen din):
        // { status:"OK", data: { posisjonerListe: [{ posisjon, vekting }, ...] } }
        const list = json?.data?.posisjonerListe ?? [];

        if (!Array.isArray(list)) throw new Error("Ugyldig dataformat fra API");

        if (!cancelled) setPositions(list);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Ukjent feil");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    // Rydd + sorter etter vekting
    return [...positions]
      .map((p) => ({
        posisjon: String(p.posisjon ?? ""),
        vekting: Number(p.vekting) || 0, // prosentpoeng
      }))
      .filter((p) => p.posisjon.length > 0)
      .sort((a, b) => b.vekting - a.vekting);
  }, [positions]);

  const sumVekting = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.vekting) || 0), 0),
    [rows]
  );

  const donutLabels = useMemo(() => rows.map((r) => r.posisjon), [rows]);
  const donutValues = useMemo(() => rows.map((r) => r.vekting), [rows]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      {loading && <div>Laster portefølje…</div>}

      {!loading && error && <div style={{ color: "crimson" }}>Feil: {error}</div>}

      {!loading && !error && rows.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 0.7fr",
            gap: 16,
            marginTop: 16,
          }}
        >
          {/* Tabell */}
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h2>Portefølje</h2>

            <table style={{ width: "100%", borderCollapse: "collapse", display: 'table', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th align="left">Posisjon</th>
                  <th align="right">Vekting</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.posisjon}
                    style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    <td>{r.posisjon}</td>
                    <td align="right">{formatPctFromPercentNumber(r.vekting)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid rgba(0,0,0,0.2)" }}>
                  <td>
                    <strong>Sum</strong>
                  </td>
                  <td align="right">
                    <strong>{formatPctFromPercentNumber(sumVekting)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>

            <p style={{ fontSize: "0.85em", opacity: 0.8, marginTop: 12 }}>
        
            </p>
          </div>

          {/* Donut */}
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h2>Fordeling</h2>
            <DonutChart labels={donutLabels} values={donutValues} />
          </div>
        </div>
      )}
    </main>
  );
}
