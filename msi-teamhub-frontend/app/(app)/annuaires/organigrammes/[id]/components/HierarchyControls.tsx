"use client";

import React from "react";

export interface FilterState {
  searchQuery: string;
  selectedGrade: string | null;
  selectedStatut: string | null;
  selectedDepartement: string | null;
}

export interface HierarchyControlsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  grades: string[];
  statuts: string[];
  departements: string[];
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
  totalEmployees: number;
  filteredCount: number;
}

export const HierarchyControls: React.FC<HierarchyControlsProps> = ({
  filters,
  onFilterChange,
  grades,
  statuts,
  departements,
  zoom,
  onZoomChange,
  isFullscreen,
  onFullscreenToggle,
  isDarkMode,
  onDarkModeToggle,
  totalEmployees,
  filteredCount,
}) => {
  return (
    <div
      className={`sticky top-0 z-50 mb-6 rounded-xl border px-5 py-4 shadow-md
        ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* RECHERCHE */}
        <div className="flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom, poste..."
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors
              ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
          />
        </div>

        {/* GRADE */}
        <select
          value={filters.selectedGrade ?? ""}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              selectedGrade: e.target.value || null,
            })
          }
          className={`rounded-lg border px-3 py-2 text-sm font-medium
            ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-slate-100"
                : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
        >
          <option value="">Tous grades</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* STATUT */}
        <select
          value={filters.selectedStatut ?? ""}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              selectedStatut: e.target.value || null,
            })
          }
          className={`rounded-lg border px-3 py-2 text-sm font-medium
            ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-slate-100"
                : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
        >
          <option value="">Tous statuts</option>
          {statuts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* DÉPARTEMENT */}
        <select
          value={filters.selectedDepartement ?? ""}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              selectedDepartement: e.target.value || null,
            })
          }
          className={`rounded-lg border px-3 py-2 text-sm font-medium
            ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-slate-100"
                : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
        >
          <option value="">Tous depts</option>
          {departements.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* SÉPARATEUR */}
        <div
          className={`h-6 border-l ${isDarkMode ? "border-slate-700" : "border-slate-300"}`}
        />

        {/* ZOOM + COMPTEUR */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
          >
            {filteredCount}/{totalEmployees}
          </span>
          <input
            type="range"
            min={50}
            max={150}
            step={10}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-28 h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: isDarkMode
                ? "linear-gradient(to right, #64748b, #3b82f6)"
                : "linear-gradient(to right, #cbd5e1, #3b82f6)",
            }}
          />
          <span
            className={`text-xs font-semibold min-w-[35px] text-right ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
          >
            {zoom}%
          </span>
        </div>

        {/* BOUTONS MODE */}
        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={onDarkModeToggle}
            title={isDarkMode ? "Mode clair" : "Mode sombre"}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border font-semibold text-lg transition-all
              ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-yellow-400 hover:bg-slate-600"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          <button
            type="button"
            onClick={onFullscreenToggle}
            title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border font-semibold text-lg transition-all
              ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
          >
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
};
