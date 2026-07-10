'use client';

interface CsvPreviewTableProps {
  headers: string[];
  rows: Record<string, string>[];
}

const MAX_CELL_LENGTH = 60;

function truncate(value: string): string {
  if (!value) return '—';
  if (value.length > MAX_CELL_LENGTH) {
    return value.slice(0, MAX_CELL_LENGTH) + '…';
  }
  return value;
}

export default function CsvPreviewTable({ headers, rows }: CsvPreviewTableProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-fade-in">
      {/* Summary bar */}
      <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          <span className="text-sm font-medium text-slate-300">
            Preview
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
            <span className="text-slate-300 font-medium">{rows.length}</span> rows
          </span>
          <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
            <span className="text-slate-300 font-medium">{headers.length}</span> columns
          </span>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="overflow-x-auto">
        <div className="max-h-[480px] overflow-y-auto">
          <table className="w-full text-sm border-collapse min-w-max">
            {/* Sticky header */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#111118]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/10 w-12">
                  #
                </th>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length + 1}
                    className="px-4 py-12 text-center text-slate-600 text-sm"
                  >
                    No data rows found.
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={[
                      'table-row-hover transition-colors',
                      rowIndex % 2 === 0 ? 'table-row-even' : 'table-row-odd',
                    ].join(' ')}
                  >
                    <td className="px-4 py-2.5 text-xs text-slate-600 font-mono border-b border-white/5 whitespace-nowrap">
                      {rowIndex + 1}
                    </td>
                    {headers.map((header) => {
                      const cellValue = row[header] ?? '';
                      const truncated = truncate(cellValue);
                      const isTruncated = cellValue.length > MAX_CELL_LENGTH;
                      return (
                        <td
                          key={header}
                          className="px-4 py-2.5 text-slate-300 border-b border-white/5 max-w-[240px]"
                          title={isTruncated ? cellValue : undefined}
                        >
                          <span className={cellValue ? '' : 'text-slate-600 italic'}>
                            {truncated}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {rows.length > 0 && (
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Showing all {rows.length} rows · {headers.length} columns detected
          </p>
          <p className="text-xs text-slate-600 italic">
            Cells truncated at {MAX_CELL_LENGTH} chars
          </p>
        </div>
      )}
    </div>
  );
}
