// src/components/charts/Prediction.tsx
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

type PredictionPoint = {
  date: string;
  aqi: number;
};

interface PredictionChartProps {
  data: PredictionPoint[];
  width?: number;
  height?: number;
}

const Prediction: React.FC<PredictionChartProps> = ({
  data,
  width = 1100,
  height = 350,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [chartReady, setChartReady] = React.useState(false);

  useEffect(() => {
    if (!data || data.length === 0) return;

    setChartReady(false);

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 50, right: 40, bottom: 80, left: 70 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const parsedData = data.map((d) => ({
      ...d,
      dateObj: new Date(d.date),
    }));

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(parsedData, (d) => d.dateObj) as [Date, Date])
      .range([0, w]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.aqi)!])
      .range([h, 0])
      .nice();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 🌙 Detect dark mode
    const isDark = document.documentElement.classList.contains("dark");
    const axisColor = isDark ? "#E5E7EB" : "#1f2937";

    // ******** STRICT 7-DAY LABELS ********
    const weeklyTicks: Date[] = [];
    let cursor = parsedData[0].dateObj;
    const lastDate = parsedData[parsedData.length - 1].dateObj;

    while (cursor <= lastDate) {
      weeklyTicks.push(new Date(cursor));
      cursor = new Date(cursor.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    // Line
    const line = d3
      .line<any>()
      .x((d) => xScale(d.dateObj))
      .y((d) => yScale(d.aqi))
      .curve(d3.curveMonotoneX);

    chart
      .append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "#2196F3")
      .attr("stroke-width", 3)
      .attr("d", line);

    // X axis
    const xAxis = chart
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${h})`)
      .call(
        d3.axisBottom(xScale)
          .tickValues(weeklyTicks)
          .tickFormat(d3.timeFormat("%-d/%-m/%Y") as any)
      );

    xAxis
      .selectAll("text")
      .attr("transform", "rotate(35)")
      .style("text-anchor", "start")
      .style("font-size", "10px")
      .style("fill", axisColor);

    xAxis.selectAll("line").style("stroke", axisColor);
    xAxis.selectAll("path").style("stroke", axisColor);

    // Y axis
    const yAxis = chart.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

    yAxis.selectAll("text").style("fill", axisColor);
    yAxis.selectAll("line").style("stroke", axisColor);
    yAxis.selectAll("path").style("stroke", axisColor);

    // **********************
    // AXIS LABELS + TITLE
    // **********************

    // Chart Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .style("fill", axisColor)
      .text("6-Month AQI Forecast");

    // Y Axis Label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", axisColor)
      .text("AQI");

    // X Axis Label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", axisColor)
      .text("Date");

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("padding", "6px 10px")
      .style("background", "black")
      .style("color", "white")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    chart
      .selectAll(".point")
      .data(parsedData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.dateObj))
      .attr("cy", (d) => yScale(d.aqi))
      .attr("r", 1.8)
      .attr("fill", "#ff5722")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.date}</strong><br/>AQI: ${d.aqi}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    setChartReady(true);

    return () => tooltip.remove();
  }, [data, width, height]);

  return (
    <div className="w-full overflow-x-auto relative">
      {!chartReady && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
      )}
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Prediction;
