import { ResponsiveLine } from "@nivo/line";

interface SalesChartProps {
  data: { x: string; y: number }[];
  range: string;
}

export default function SalesChart({ data, range }: SalesChartProps) {
  const chartData = [
    {
      id: "Sales",
      data: data,
    },
  ];

  return (
    <div className="w-full h-[400px] bg-white rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Sales Trend ({range})</h3>
      {data.length > 0 ? (
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: true,
            reverse: false,
          }}
          yFormat=" >-.2f"
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: range === "Day" ? "Hour" : "Date",
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Sales ($)",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          enableGridX={false}
          colors={["#3b82f6"]}
          enableArea={true}
          areaOpacity={0.15}
          enablePoints={true}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          theme={{
            axis: {
              ticks: {
                text: {
                  fontSize: 12,
                  fill: "#6b7280",
                },
              },
              legend: {
                text: {
                  fontSize: 13,
                  fill: "#374151",
                  fontWeight: 600,
                },
              },
            },
            grid: {
              line: {
                stroke: "#e5e7eb",
                strokeWidth: 1,
              },
            },
            tooltip: {
              container: {
                background: "#ffffff",
                color: "#333333",
                fontSize: 12,
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              },
            },
          }}
          defs={[
            {
              id: "gradientC",
              type: "linearGradient",
              colors: [
                { offset: 0, color: "inherit" },
                { offset: 100, color: "inherit", opacity: 0 },
              ],
            },
          ]}
          fill={[{ match: "*", id: "gradientC" }]}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-400">
          No data available for this period
        </div>
      )}
    </div>
  );
}
