'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Pretendard 웹폰트 적용
const fontUrl = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css";

// Sidebar folder structure
const sidebar = {
  LANGUAGE: ["TOEIC_RC", "TOEIC_LC", "JLPT"],
  CODING: ["JAVA", "PYTHON", "C++"],
  HEALTH: ["GYM"],
};

const itemColors = {
  "TOEIC_RC": "#F97316",
  "TOEIC_LC": "#FB923C",
  "JLPT": "#E879F9",
  "JAVA": "#0EA5E9",   // 더 밝은 파랑 (Sky Blue)
  "PYTHON": "#60A5FA",
  "C++": "#6366F1",    // 보라빛 파랑 (Indigo)
  "GYM": "#16A34A",
};

const grayLight = "#E5E7EB";

// Format YYYY‑MM‑DD
function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

export default function StepsApp() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null); // sub-item selected
  const [data, setData] = useState({});

  // Load & save localStorage
  useEffect(() => {
    const saved = localStorage.getItem("stepsData");
    if (saved) setData(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("stepsData", JSON.stringify(data));
  }, [data]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  // Month navigation
  const changeMonth = (delta) => {
    const dt = new Date(year, month + delta, 1);
    setYear(dt.getFullYear());
    setMonth(dt.getMonth());
    setSelected(null);
  };

  const allItems = Object.values(sidebar).flat();

  // Toggle a specific sub-item on a specific date
  const toggleDate = (item, dateStr) => {
    setData(d => ({
      ...d,
      [item]: { ...(d[item] || {}), [dateStr]: !d[item]?.[dateStr] }
    }));
  };

  // 달력형 Overview (칸 안에 도트 정렬)
  const OverviewCalendar = () => {
    const todayStr = formatDate(new Date());
    const cells = Array(firstWeekday).fill(null)
      .concat([...Array(daysInMonth)].map((_, i) => i + 1));
    const maxDotsPerRow = 4; // 한 줄에 도트 4개

    return (
      <div className="mt-2">
        {/* 카테고리 라벨 */}
        <div className="flex flex-wrap gap-4 mb-5">
          {Object.entries(sidebar).map(([group, items]) => (
            <div key={group} className="flex flex-col items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{group}</span>
              {items.map(it => (
                <div key={it} className="flex items-center gap-2 mb-1">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: itemColors[it] }} />
                  <span className="font-medium text-sm" style={{ color: itemColors[it] }}>{it}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* 달력 */}
        <div>
          <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-gray-700 mb-1">
            {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(w => (
              <div key={w} className="text-center">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="h-20"></div>;
              const dateObj = new Date(year, month, d);
              const dateStr = formatDate(dateObj);
              const isToday = dateStr === todayStr;
              // 도트 2줄 정렬
              const dots = allItems.map(it => ({
                it,
                checked: data[it]?.[dateStr]
              }));
              const dotRows = [];
              for (let r = 0; r < Math.ceil(dots.length / maxDotsPerRow); r++) {
                dotRows.push(dots.slice(r * maxDotsPerRow, (r + 1) * maxDotsPerRow));
              }
              return (
                <div
                  key={i}
                  className={`
                    h-20 rounded-xl border flex flex-col items-center justify-start p-1
                    ${isToday ? "border-green-500 border-2 shadow-md" : "border-gray-200"}
                    bg-white relative transition
                  `}
                  title={dateStr}
                >
                  <span className={`text-xs font-bold mb-1 ${isToday ? "text-green-600" : "text-gray-700"}`}>{d}</span>
                  <div className="flex flex-col gap-1 w-full flex-1 justify-center items-center">
                    {dotRows.map((row, ri) => (
                      <div key={ri} className="flex flex-row gap-1 justify-center">
                        {row.map(({ it, checked }) => (
                          <motion.button
                            key={it}
                            whileTap={{ scale: 0.8 }}
                            whileHover={{
                              scale: checked ? 1.12 : 1.07,
                              boxShadow: checked
                                ? `0 2px 8px 0 ${itemColors[it]}33`
                                : "0 1px 4px 0 #0001"
                            }}
                            animate={{
                              backgroundColor: checked ? itemColors[it] : grayLight,
                              borderColor: checked ? itemColors[it] : "#E5E7EB",
                              scale: checked ? 1.1 : 1,
                              boxShadow: checked ? `0 2px 8px 0 ${itemColors[it]}33` : "none"
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 18 }}
                            className={`
                              w-5 h-5 rounded-full border flex items-center justify-center
                              transition-all duration-200 cursor-pointer
                              focus:outline-none
                            `}
                            onClick={() => toggleDate(it, dateStr)}
                            title={it}
                          >
                            {checked && (
                              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                                <motion.path
                                  d="M5 10.5L9 14L15 7"
                                  stroke="#fff"
                                  strokeWidth="2.1"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.18, delay: 0.03 }}
                                />
                              </svg>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // DetailCalendar(카테고리별 달력) - 내가 누른 버튼만 애니메이션
  const DetailCalendar = () => {
    if (!selected) return null;
    const cells = [];
    const todayStr = formatDate(new Date());
    for (let i = 0; i < firstWeekday; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }

    return (
      <div>
        <h3 className="text-xl font-bold mb-3">{selected} Calendar</h3>
        <div className="grid grid-cols-7 gap-1 text-sm font-semibold text-gray-700 mb-2">
          {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(w=><div key={w} className="text-center">{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="h-14"></div>;
            const dateObj = new Date(year, month, d);
            const dateStr = formatDate(dateObj);
            const checked = data[selected]?.[dateStr];
            const isToday = dateStr === todayStr;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: checked ? 1.06 : 1.03 }}
                animate={{
                  backgroundColor: checked ? itemColors[selected] : "#F3F4F6",
                  color: checked ? "#fff" : "#222",
                  borderColor: isToday ? "#10B981" : (checked ? itemColors[selected] : "#E5E7EB"),
                  scale: checked ? 1.03 : 1,
                }}
                transition={{ type: "spring", stiffness: 340, damping: 18 }}
                className={`
                  h-14 w-full rounded-lg border-2 flex flex-col items-center justify-center font-semibold relative
                  ${isToday ? "ring-2 ring-green-400" : ""}
                  ${checked ? "" : "hover:bg-gray-200"}
                  focus:outline-none
                `}
                onClick={() => toggleDate(selected, dateStr)}
                title={dateStr}
              >
                <span className="text-base">{d}</span>
                {checked && (
                  <div className="absolute bottom-2 right-2">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <motion.path
                        d="M5 10.5L9 14L15 7"
                        stroke="#fff"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                      />
                    </svg>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  const Statistics = () => {
    const stats = allItems.map(it => ({
      it, count: Object.values(data[it]||{}).filter(v=>v).length
    }));
    return (
      <aside className="w-56 bg-white rounded-xl shadow p-4">
        <h2 className="font-bold mb-2">Statistics</h2>
        <ul className="text-sm space-y-1">
          {stats.map(s=><li key={s.it} style={{ color: itemColors[s.it], fontWeight: 600 }}>{s.it}: {s.count}</li>)}
        </ul>
      </aside>
    );
  };

  return (
    <>
      {/* Pretendard 웹폰트 적용 */}
      <style jsx global>{`
        @import url('${fontUrl}');
        html, body {
          font-family: 'Pretendard', 'Apple SD Gothic Neo', 'sans-serif';
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col md:flex-row gap-4">
        {/* Sidebar */}
        <nav className="w-full md:w-48 bg-white shadow rounded-xl p-4 space-y-2 sticky top-4 h-[90vh] overflow-auto">
          <motion.button layout whileTap={{scale:0.95}} className={`w-full text-left font-bold py-2 ${!selected?"bg-gray-200":""}`} onClick={()=>setSelected(null)}>
            Overview
          </motion.button>
          {Object.entries(sidebar).map(([group, items])=>(
            <div key={group}>
              <div className="text-xs font-semibold uppercase mt-2 mb-1">{group}</div>
              {items.map(item=>(
                <motion.button layout whileTap={{scale:0.95}}
                  key={item}
                  className={`w-full text-left py-1 pl-2 rounded-sm ${selected===item?"bg-gray-200":""}`}
                  onClick={()=>setSelected(item)}
                >
                  {item}
                </motion.button>
              ))}
            </div>
          ))}
        </nav>

        {/* Main Calendar */}
        <main className="flex-1 bg-white shadow rounded-xl p-4 overflow-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-2">
            <motion.button layout whileTap={{scale:0.9}} onClick={()=>changeMonth(-1)} className="px-2 bg-gray-200 rounded">◀</motion.button>
            <span className="font-bold text-lg">{year} / {month+1}</span>
            <motion.button layout whileTap={{scale:0.9}} onClick={()=>changeMonth(1)} className="px-2 bg-gray-200 rounded">▶</motion.button>
          </div>
          {selected? <DetailCalendar/> : <OverviewCalendar/>}
        </main>

        {/* Right Stats */}
        <Statistics/>
      </div>
    </>
  );
}
