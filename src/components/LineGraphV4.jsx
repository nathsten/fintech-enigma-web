import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title
);

export default function LineGraphV4({ data, title, label, utvikler, utviklerUrl }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastPrice, setLastPrice] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError("");

        if (!data || !data.Avkast) {
          throw new Error("Ingen data tilgjengelig");
        }

        // 1) Sort and process data
        const sorted = [...data.Avkast].sort((a, b) => a.time - b.time);
        const rawLabels = sorted.map((e) => e.time);
        const rawPrices = sorted.map((e) => Number(e.avkast));

        // 2) Aggregate data if too many points
        const s = 45;
        let labels = [];
        let values = [];

        if (rawPrices.length > s) {
          const chunkSize = Math.ceil(rawPrices.length / s);
          const averagedLabels = [];
          const averagedPrices = [];

          for (let i = 0; i < rawPrices.length; i += chunkSize) {
            const chunk = rawPrices.slice(i, i + chunkSize);
            const avgPrice = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
            averagedPrices.push(avgPrice);
            averagedLabels.push(
              rawLabels[Math.min(i + Math.floor(chunkSize / 2), rawLabels.length - 1)]
            );
          }
          labels = averagedLabels.map((t) => new Date(t).toLocaleDateString("no-NO"));
          values = averagedPrices;
        } else {
          labels = rawLabels.map((t) => new Date(t).toLocaleDateString("no-NO"));
          values = rawPrices;
        }

        if (cancelled) return;

        setLastPrice(values[values.length - 1] || 0);

        // 3) Draw chart
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }

        if (!canvasRef.current) {
          throw new Error("Canvas element not found");
        }

        const ctx = canvasRef.current.getContext("2d");
        chartRef.current = new ChartJS(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label,
                data: values,
                tension: 0.25,
                pointRadius: 0,
                borderColor: "#06ADF4",
                backgroundColor: "#06ADF4",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
              legend: { display: true },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${Number(ctx.parsed.y).toFixed(2)}%`,
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  maxTicksLimit: 10,
                },
              },
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (val) => `${Number(val).toFixed(2)}%`,
                },
              },
            },
          },
        });
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Ukjent feil ved henting/plotting");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data]);

  return (
    <div>
      <h2>
        Avkastning {title}:{" "}
        <span style={{ color: lastPrice > 0 ? "green" : "red" }}>
          {Number.isFinite(lastPrice) ? lastPrice.toFixed(2) : "0.00"}%
        </span>
      </h2>

      {loading && <div>Laster data…</div>}
      {error && <div style={{ color: "crimson" }}>Feil: {error}</div>}

      <div style={{ height: 200, display: loading ? "none" : "block" }}>
        <canvas ref={canvasRef} />
      </div>

      <br />

      <p style={{ fontSize: "0.8em" }}>
        Algoritmen er utviklet av{" "}
        <a href={utviklerUrl} style={{ color: "#06ADF4" }}>
          {utvikler}
        </a>
        .
      </p>
    </div>
  );
}