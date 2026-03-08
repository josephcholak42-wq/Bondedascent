import { useState } from "react";

interface MoodDataPoint {
  date: string;
  mood: number;
  obedience: number;
}

interface MoodChartProps {
  data: Array<MoodDataPoint>;
}

const CHART_WIDTH = 800;
const CHART_HEIGHT = 400;
const PADDING = { top: 20, right: 20, bottom: 60, left: 40 };
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

const COLORS = {
  background: "#0a0a0a",
  grid: "#1a1a1a",
  label: "#94a3b8",
  mood: "#991b1b",
  obedience: "#7f1d1d",
};

function MoodChart({ data }: MoodChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <svg
        data-testid="chart-mood-obedience"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        width="100%"
        style={{ backgroundColor: COLORS.background }}
      >
        <text
          x={CHART_WIDTH / 2}
          y={CHART_HEIGHT / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={COLORS.label}
          fontSize="16"
          opacity="0.6"
        >
          No data yet
        </text>
      </svg>
    );
  }

  const yMin = 1;
  const yMax = 10;
  const xScale = (i: number) => PADDING.left + (i / (data.length - 1 || 1)) * PLOT_WIDTH;
  const yScale = (v: number) => PADDING.top + PLOT_HEIGHT - ((v - yMin) / (yMax - yMin)) * PLOT_HEIGHT;

  const buildLinePath = (key: "mood" | "obedience") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d[key])}`).join(" ");

  const buildAreaPath = (key: "mood" | "obedience") => {
    const line = buildLinePath(key);
    const lastX = xScale(data.length - 1);
    const firstX = xScale(0);
    const bottom = yScale(yMin);
    return `${line} L${lastX},${bottom} L${firstX},${bottom} Z`;
  };

  const gridLines = [];
  for (let v = yMin; v <= yMax; v++) {
    gridLines.push(v);
  }

  return (
    <svg
      data-testid="chart-mood-obedience"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      width="100%"
      style={{ backgroundColor: COLORS.background }}
    >
      {gridLines.map((v) => (
        <g key={`grid-${v}`}>
          <line
            x1={PADDING.left}
            y1={yScale(v)}
            x2={PADDING.left + PLOT_WIDTH}
            y2={yScale(v)}
            stroke={COLORS.grid}
            strokeWidth="1"
          />
          <text
            x={PADDING.left - 8}
            y={yScale(v)}
            textAnchor="end"
            dominantBaseline="middle"
            fill={COLORS.label}
            fontSize="10"
          >
            {v}
          </text>
        </g>
      ))}

      <path d={buildAreaPath("mood")} fill={COLORS.mood} opacity="0.1" />
      <path d={buildAreaPath("obedience")} fill={COLORS.obedience} opacity="0.1" />

      <path d={buildLinePath("mood")} fill="none" stroke={COLORS.mood} strokeWidth="2" />
      <path d={buildLinePath("obedience")} fill="none" stroke={COLORS.obedience} strokeWidth="2" />

      {data.map((d, i) => (
        <g key={`labels-${i}`}>
          {i % 5 === 0 && (
            <text
              x={xScale(i)}
              y={PADDING.top + PLOT_HEIGHT + 16}
              textAnchor="end"
              fill={COLORS.label}
              fontSize="9"
              transform={`rotate(-45, ${xScale(i)}, ${PADDING.top + PLOT_HEIGHT + 16})`}
            >
              {d.date}
            </text>
          )}
        </g>
      ))}

      {data.map((d, i) => (
        <g key={`points-${i}`}>
          <rect
            x={xScale(i) - 8}
            y={PADDING.top}
            width={16}
            height={PLOT_HEIGHT}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
          {hoveredIndex === i && (
            <>
              <circle cx={xScale(i)} cy={yScale(d.mood)} r="4" fill={COLORS.mood} />
              <circle cx={xScale(i)} cy={yScale(d.obedience)} r="4" fill={COLORS.obedience} />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

export default MoodChart;
