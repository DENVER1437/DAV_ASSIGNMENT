import React, { useState, useEffect } from 'react';
import { Grid, Sparkles, Info, HelpCircle } from 'lucide-react';
import { CorrelationMatrixResponse, AnalysisFilterRequest } from '../../types';
import { getCorrelationMatrix } from '../../services/api';

interface CorrelationAnalysisProps {
  filters?: AnalysisFilterRequest;
}

export const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({ filters }) => {
  const [data, setData] = useState<CorrelationMatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
    val: number;
    featA: string;
    featB: string;
  } | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchMatrix = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getCorrelationMatrix(filters);
        if (!isCancelled) {
          setData(res);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || 'Failed to compute correlation matrix');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchMatrix();
    return () => {
      isCancelled = true;
    };
  }, [filters]);

  // Color generator for Pearson correlation [-1.0, 1.0]
  const getCellColor = (val: number) => {
    if (val === 1.0) return 'bg-teal-600 text-white font-bold';
    if (val >= 0.7) return 'bg-teal-500/80 text-white font-semibold';
    if (val >= 0.4) return 'bg-teal-400/50 text-teal-950 dark:text-teal-100 font-medium';
    if (val >= 0.15) return 'bg-teal-200/40 dark:bg-teal-900/30 text-slate-800 dark:text-slate-200';
    if (val > -0.15) return 'bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400';
    if (val > -0.4) return 'bg-rose-100 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200';
    if (val > -0.7) return 'bg-rose-300/60 text-rose-900 dark:text-rose-100 font-medium';
    return 'bg-rose-500 text-white font-bold';
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors h-full flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Grid className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Pearson Correlation Matrix (Heatmap)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bivariate statistical relationship matrix across 12 continuous operational & clinical variables.
          </p>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center space-x-2 text-[10px] text-slate-500">
          <span>-1.0 (Inverse)</span>
          <div className="flex h-3 w-28 rounded overflow-hidden border border-slate-300 dark:border-slate-700">
            <div className="flex-1 bg-rose-500" />
            <div className="flex-1 bg-rose-200" />
            <div className="flex-1 bg-slate-100" />
            <div className="flex-1 bg-teal-200" />
            <div className="flex-1 bg-teal-600" />
          </div>
          <span>+1.0 (Direct)</span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs rounded-lg border border-rose-200 dark:border-rose-900/60">
          {error}
        </div>
      ) : data && data.matrix.length > 0 ? (
        <div className="space-y-4">
          {/* Active Hover Callout Banner */}
          <div className="h-9 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
            {hoveredCell ? (
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {hoveredCell.featA}
                </span>
                <span className="text-slate-400">×</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {hoveredCell.featB}
                </span>
                <span className="text-slate-400">:</span>
                <span
                  className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                    hoveredCell.val > 0.3
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                      : hoveredCell.val < -0.3
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  r = {hoveredCell.val > 0 ? `+${hoveredCell.val}` : hoveredCell.val}
                </span>
                <span className="text-slate-500 text-[11px] hidden sm:inline">
                  (
                  {Math.abs(hoveredCell.val) >= 0.7
                    ? 'Strong Correlation'
                    : Math.abs(hoveredCell.val) >= 0.3
                    ? 'Moderate Correlation'
                    : 'Weak / Invariant Relation'}
                  )
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-slate-500">
                <Info className="w-3.5 h-3.5 text-teal-600" />
                <span>Hover over any matrix intersection cell to inspect bivariate coefficient.</span>
              </div>
            )}
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[700px] border-collapse text-[10px]">
              <thead>
                <tr>
                  <th className="p-1 text-left font-bold text-slate-400 w-36 truncate">
                    Attributes
                  </th>
                  {data.display_labels.map((label, idx) => (
                    <th
                      key={idx}
                      className="p-1 font-semibold text-slate-600 dark:text-slate-400 text-center max-w-[55px] truncate"
                      title={label}
                    >
                      <div className="truncate">{label.split(' ')[0]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.matrix.map((rowVals, rIdx) => (
                  <tr key={rIdx} className="border-t border-slate-100 dark:border-slate-800/60">
                    <td
                      className="p-1.5 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]"
                      title={data.display_labels[rIdx]}
                    >
                      {data.display_labels[rIdx]}
                    </td>
                    {rowVals.map((val, cIdx) => (
                      <td
                        key={cIdx}
                        onMouseEnter={() =>
                          setHoveredCell({
                            row: rIdx,
                            col: cIdx,
                            val: val,
                            featA: data.display_labels[rIdx],
                            featB: data.display_labels[cIdx],
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`p-1.5 text-center font-mono cursor-pointer transition-transform hover:scale-110 hover:z-10 rounded-xs ${getCellColor(
                          val
                        )}`}
                      >
                        {val === 1.0 ? '1.0' : val.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Strongest Correlations Callout Badges */}
          {data.strongest_correlations && data.strongest_correlations.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                Notable Empirical Relationships
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {data.strongest_correlations.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                        {item.relationship}
                      </span>
                      <span
                        className={`font-mono font-bold text-[11px] ${
                          item.correlation > 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600'
                        }`}
                      >
                        r = {item.correlation > 0 ? `+${item.correlation}` : item.correlation}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                      {item.label_a} ↔ {item.label_b}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
};
