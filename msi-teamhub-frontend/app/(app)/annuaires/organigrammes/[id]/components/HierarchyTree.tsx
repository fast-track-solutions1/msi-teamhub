"use client";

import React from "react";

export interface HierarchyNode {
  id: number;
  nom: string;
  prenom: string;
  gradenom: string;
  poste: string;
  statut: string;
  departements?: { id: number; nom: string }[];
  children?: HierarchyNode[];
}

interface HierarchyTreeProps {
  nodes: HierarchyNode[];
  onSelectEmployee?: (employee: HierarchyNode) => void;
  expandedByDefault?: boolean;
  isDarkMode?: boolean;
}

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({
  nodes,
  onSelectEmployee,
  expandedByDefault = true,
  isDarkMode = false,
}) => {
  return (
    <div className="flex flex-col items-center gap-12 py-8">
      {nodes.map((node) => (
        <HierarchyBranch
          key={node.id}
          node={node}
          onSelectEmployee={onSelectEmployee}
          expandedByDefault={expandedByDefault}
          isDarkMode={isDarkMode}
          level={0}
        />
      ))}
    </div>
  );
};

interface HierarchyBranchProps {
  node: HierarchyNode;
  onSelectEmployee?: (employee: HierarchyNode) => void;
  expandedByDefault: boolean;
  isDarkMode: boolean;
  level: number;
}

const HierarchyBranch: React.FC<HierarchyBranchProps> = ({
  node,
  onSelectEmployee,
  expandedByDefault,
  isDarkMode,
  level,
}) => {
  const [expanded, setExpanded] = React.useState(expandedByDefault);
  const hasChildren = node.children && node.children.length > 0;

  const borderColor = isDarkMode ? "border-slate-600" : "border-slate-300";
  const bgColor = isDarkMode
    ? "bg-slate-800 border-slate-600"
    : "bg-white border-slate-200";

  return (
    <div className="flex flex-col items-center">
      {/* CARTE EMPLOYÉ */}
      <div
        className={`rounded-lg border shadow-md px-5 py-4 min-w-[260px] text-left
          ${bgColor}
          hover:shadow-lg transition-all`}
      >
        <button
          type="button"
          onClick={() => onSelectEmployee?.(node)}
          className={`w-full text-left cursor-pointer
            ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <div className="font-bold text-sm">
                {node.prenom} {node.nom}
              </div>
              <div
                className={`text-xs mt-1.5 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                {node.poste}
              </div>
              <div
                className={`text-xs font-semibold mt-0.5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
              >
                {node.gradenom}
              </div>

              {node.statut && (
                <div
                  className={`text-[10px] uppercase mt-1 px-2 py-0.5 rounded inline-block font-semibold
                    ${isDarkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-700"}`}
                >
                  {node.statut}
                </div>
              )}
            </div>

            {hasChildren && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className={`w-7 h-7 flex items-center justify-center rounded-full text-lg font-bold flex-shrink-0
                  ${isDarkMode ? "bg-slate-700 text-slate-100 hover:bg-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}
                  transition-colors`}
              >
                {expanded ? "−" : "+"}
              </button>
            )}
          </div>
        </button>

        {/* BADGES DÉPARTEMENTS */}
        {node.departements && node.departements.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {node.departements.map((dept) => (
              <span
                key={dept.id}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                  ${isDarkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-700"}`}
              >
                {dept.nom}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ENFANTS (SI EXPANDED) */}
      {hasChildren && expanded && (
        <>
          {/* LIGNE VERTICALE */}
          <div
            className={`w-0.5 h-8 border-l-2 ${borderColor}`}
          />

          {/* CONTENEUR ENFANTS */}
          <div className="relative flex items-start gap-0">
            {/* LIGNE HORIZONTALE */}
            <svg
              className="absolute top-0 -left-8 w-16 h-0.5"
              style={{ display: node.children!.length > 1 ? "block" : "none" }}
            >
              <line
                x1="0"
                y1="0"
                x2="100%"
                y2="0"
                stroke={isDarkMode ? "#475569" : "#cbd5e1"}
                strokeWidth="2"
              />
            </svg>

            {/* ENFANTS EN COLONNE */}
            <div className="flex gap-8">
              {node.children!.map((child, idx) => (
                <div
                  key={child.id}
                  className="flex flex-col items-center relative"
                >
                  {/* LIGNE VERTICALE CONNECTEUR ENFANT */}
                  <div
                    className={`w-0.5 h-8 border-l-2 ${borderColor}`}
                  />
                  <HierarchyBranch
                    node={child}
                    onSelectEmployee={onSelectEmployee}
                    expandedByDefault={expandedByDefault}
                    isDarkMode={isDarkMode}
                    level={level + 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
