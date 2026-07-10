'use client';

import { useState } from 'react';
import type { CrmRecord } from '@/lib/types';

const CRM_FIELDS_ORDER: (keyof CrmRecord)[] = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
];

interface ResultTableProps {
  imported: CrmRecord[];
  skipped: Array<{ originalRow: Record<string, string>; reason: string }>;
}

type Tab = 'imported' | 'skipped';

const MAX_CELL = 80;
function truncate(val: string): string {
  if (!val) return '—';
  return val.length > MAX_CELL ? val.slice(0, MAX_CELL) + '…' : val;
}

function formatHeader(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        {tab === 'imported' ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-slate-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-slate-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <p className="text-slate-500 text-sm font-medium">
        {tab === 'imported' ? 'No records were imported.' : 'No records were skipped — perfect import!'}
      </p>
    </div>
  );
}

export default function ResultTable({ imported, skipped }: ResultTableProps) {
  const [activeTab, setActiveTab] = useState<Tab>('imported');

  // Collect all original-row keys for skipped table
  const skippedHeaders =
    skipped.length > 0
      ? Array.from(new Set(skipped.flatMap((s) => Object.keys(s.originalRow))))
      : [];

  return (
    <div className="glass rounded-2xl overflow-hidden animate-fade-in">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('imported')}
            className={[
              'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 focus:outline-none',
              activeTab === 'imported'
                ? 'text-primary-500 border-b-2 border-primary-500 -mb-px bg-primary-500/5'
                : 'text-slate-500 border-b-2 border-transparent hover:text-slate-300 hover:border-primary-500/40',
            ].join(' ')}
            aria-selected={activeTab === 'imported'}
            role="tab"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            Imported Records
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              {imported.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('skipped')}
            className={[
              'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 focus:outline-none',
              activeTab === 'skipped'
                ? 'text-amber-400 border-b-2 border-amber-500 -mb-px bg-amber-500/5'
                : 'text-slate-500 border-b-2 border-transparent hover:text-slate-300 hover:border-amber-500/40',
            ].join(' ')}
            aria-selected={activeTab === 'skipped'}
            role="tab"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            Skipped Records
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20">
              {skipped.length}
            </span>
          </button>
        </div>

        {/* Download PDF Button */}
        {imported.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const win = window.open('', '_blank');
              if (!win) return;
              const dateStr = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              const tableHeaders = CRM_FIELDS_ORDER.map(h => `<th>${formatHeader(h)}</th>`).join('');
              const tableRows = imported.map((r, idx) => {
                const cells = CRM_FIELDS_ORDER.map(h => `<td>${r[h] || '—'}</td>`).join('');
                return `<tr><td>${idx + 1}</td>${cells}</tr>`;
              }).join('');

              win.document.write(`
                <html>
                  <head>
                    <title>GrowEasy CRM Import Report - ${dateStr}</title>
                    <style>
                      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 24px; margin: 0; }
                      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ff3b5c; padding-bottom: 16px; margin-bottom: 24px; }
                      .title { font-size: 24px; font-weight: bold; color: #1e1b4b; }
                      .meta { font-size: 12px; color: #666; text-align: right; }
                      .summary { background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 14px; }
                      table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
                      th { background-color: #ff3b5c; color: white; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #e5e7eb; }
                      td { padding: 8px; border: 1px solid #e5e7eb; word-break: break-all; }
                      tr:nth-child(even) { background-color: #f9fafb; }
                      @media print {
                        body { padding: 0; }
                        button { display: none; }
                      }
                    </style>
                  </head>
                  <body>
                    <div class="header">
                      <div>
                        <div class="title">GrowEasy CRM Import Report</div>
                        <div style="font-size: 12px; color: #666; margin-top: 4px;">AI-Mapped Lead Extraction Results</div>
                      </div>
                      <div class="meta">
                        <div>Date: ${dateStr}</div>
                        <div>Generated by GrowEasy CSV Importer</div>
                      </div>
                    </div>
                    <div class="summary">
                      <strong>Import Status:</strong> Mapped ${imported.length} leads successfully. Mapped using Groq Llama 3.1 AI pipeline.
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          ${tableHeaders}
                        </tr>
                      </thead>
                      <tbody>
                        ${tableRows}
                      </tbody>
                    </table>
                    <script>
                      window.onload = function() {
                        window.print();
                        window.onafterprint = function() { window.close(); };
                      }
                    </script>
                  </body>
                </html>
              `);
              win.document.close();
            }}
            className="mr-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-slate-100 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zM10.5 3.5v3a1 1 0 001 1h3l-4-4z"
                clipRule="evenodd"
              />
            </svg>
            Download as PDF
          </button>
        )}
      </div>

      {/* Row count bar */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {activeTab === 'imported'
            ? `${imported.length} record${imported.length !== 1 ? 's' : ''} successfully imported`
            : `${skipped.length} record${skipped.length !== 1 ? 's' : ''} could not be processed`}
        </p>
        <p className="text-xs text-slate-600 italic">
          Scroll horizontally to see all columns
        </p>
      </div>

      {/* Table content */}
      {activeTab === 'imported' ? (
        imported.length === 0 ? (
          <EmptyState tab="imported" />
        ) : (
          <div className="overflow-x-auto">
            <div className="max-h-[520px] overflow-y-auto">
              <table className="w-full text-sm border-collapse min-w-max">
                <thead className="sticky top-0 z-10 bg-[#111118]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/10 w-12">
                      #
                    </th>
                    {CRM_FIELDS_ORDER.map((field) => (
                      <th
                        key={field}
                        className="px-4 py-3 text-left text-xs font-semibold text-primary-500 uppercase tracking-wider border-b border-white/10 whitespace-nowrap"
                      >
                        {formatHeader(field)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {imported.map((record, i) => (
                    <tr
                      key={i}
                      className={[
                        'table-row-hover transition-colors',
                        i % 2 === 0 ? 'table-row-even' : 'table-row-odd',
                      ].join(' ')}
                    >
                      <td className="px-4 py-2.5 text-xs text-slate-600 font-mono border-b border-white/5">
                        {i + 1}
                      </td>
                      {CRM_FIELDS_ORDER.map((field) => {
                        const val = record[field] ?? '';
                        return (
                          <td
                            key={field}
                            title={val.length > MAX_CELL ? val : undefined}
                            className="px-4 py-2.5 text-slate-300 border-b border-white/5 min-w-[150px] max-w-[280px] break-words"
                          >
                            <span className={val ? '' : 'text-slate-600 italic'}>
                              {truncate(val)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : skipped.length === 0 ? (
        <EmptyState tab="skipped" />
      ) : (
        <div className="overflow-x-auto">
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-sm border-collapse min-w-max">
              <thead className="sticky top-0 z-10 bg-[#111118]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/10 w-12">
                    #
                  </th>
                  {skippedHeaders.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider border-b border-white/10 whitespace-nowrap">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {skipped.map(({ originalRow, reason }, i) => (
                  <tr
                    key={i}
                    className={[
                      'table-row-hover transition-colors',
                      i % 2 === 0 ? 'table-row-even' : 'table-row-odd',
                    ].join(' ')}
                  >
                    <td className="px-4 py-2.5 text-xs text-slate-600 font-mono border-b border-white/5">
                      {i + 1}
                    </td>
                    {skippedHeaders.map((header) => {
                      const val = originalRow[header] ?? '';
                      return (
                        <td
                          key={header}
                          title={val.length > MAX_CELL ? val : undefined}
                          className="px-4 py-2.5 text-slate-300 border-b border-white/5 min-w-[150px] max-w-[280px] break-words"
                        >
                          <span className={val ? '' : 'text-slate-600 italic'}>
                            {truncate(val)}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-2.5 border-b border-white/5 max-w-[280px]">
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md whitespace-nowrap">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="w-3 h-3 flex-shrink-0"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 01-1.299 2.25H2.804a1.5 1.5 0 01-1.3-2.25l5.197-9zM8 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 4zm0 8a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {reason}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
