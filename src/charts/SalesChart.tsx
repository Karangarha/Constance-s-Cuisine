import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ResponsiveLineCanvas } from "@nivo/line";
import { startOfWeek, startOfMonth, format } from "date-fns";
import DateTimeLogic from "../logic/DateTimeLogic";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Order {
  created_at: string;
  total_amount: number;
}

type Range = "Day" | "Week" | "Month" | "All" | "Range";

export default function SalesChart() {
  const [chartData, setChartData] = useState<
    { id: string; data: { x: string; y: number }[] }[]
  >([]);
  const [range, setRange] = useState<Range>("Week");
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch all orders once
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("created_at, total_amount");

      if (error) {
        console.error("Error fetching sales:", error);
        return;
      }
      if (data) setOrders(data);
    };

    fetchData();
  }, []);

  // Process chart data when range/dateRange changes
  useEffect(() => {
    if (!orders.length) return;

    let filtered = orders;

    // Filter depending on range
    filtered = orders.filter((order: Order) => {
      const date = new Date(order.created_at);
      return DateTimeLogic(date, range, dateRange);
    });

    // Group by range
    const grouped = filtered.reduce(
      (acc: Record<string, number>, order: Order) => {
        const date = new Date(order.created_at);
        let key = "";

        switch (range) {
          case "Day":
            key = format(date, "H");
            break;
          case "Week":
            key = format(date, "MMM-dd");
            break;
          case "Month":
            key = format(startOfWeek(date), "MMM-dd");
            break;
          case "Range":
            key = format(date, "MMM-dd");
            break;
          case "All":
            key = format(startOfMonth(date), "yyyy-MMM");
            break;
        }

        acc[key] = (acc[key] || 0) + order.total_amount;
        return acc;
      },
      {}
    );

    // Sort
    const sortedEntries =
      range === "All"
        ? Object.entries(grouped)
        : Object.entries(grouped).sort(
            ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
          );

    // Format for Nivo
    const formatted = [
      {
        id: `Sales (${range})`,
        data: sortedEntries.map(([x, y]) => ({
          x,
          y: Number(y),
        })),
      },
    ];

    setChartData(formatted);
  }, [range, dateRange, orders]);

  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Sales Overview
      </h2>

      {/* Chart Section */}
      <div style={{ height: 400 }}>
        {chartData.length > 0 ? (
          <ResponsiveLineCanvas
            data={chartData}
            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", max: "auto" }}
            axisBottom={{
              legend: "Date",
              legendOffset: 36,
              tickRotation: 0,
            }}
            axisLeft={{ legend: "Sales ($)", legendOffset: -50 }}
            colors={{ scheme: "category10" }}
            pointSize={6}
          />
        ) : (
          <p className="text-gray-500 text-center mt-10">Loading chart...</p>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center mt-6">
        <div className="flex justify-between w-3/4 md:w-1/2">
          {(["Day", "Week", "Month", "Range", "All"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                range === r
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Section */}
      {range === "Range" && (
        <div className="flex justify-center mt-6">
          <div>
            <Calendar
              selectRange
              onChange={(value) => {
                if (Array.isArray(value)) setDateRange(value as [Date, Date]);
              }}
              value={dateRange || new Date()}
            />
            {!dateRange && (
              <p className="text-center text-gray-500 mt-2">
                Select a date range to view sales.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
