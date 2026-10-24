import { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import type { ColDef } from 'ag-grid-community';
import type { PnLRow } from '@/hooks/useInvest';

interface Props {
  rows: PnLRow[];
  onTrade: (ticker: string, side: 'buy' | 'sell') => void;
}

function fmt$(cents: number) { return `$${(cents / 100).toFixed(2)}`; }
function fmtPct(n: number) { return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`; }

export default function HoldingsGrid({ rows, onTrade }: Props) {
  const [quick, setQuick] = useState('');

  const colDefs: ColDef<PnLRow>[] = useMemo(() => [
    { field: 'ticker', headerName: 'Ticker', width: 90, cellStyle: { fontFamily: 'monospace', fontWeight: 700 } },
    { field: 'shares', headerName: 'Shares', width: 90, valueFormatter: p => p.value.toFixed(4) },
    { field: 'avgCostCents', headerName: 'Avg cost', width: 100, valueFormatter: p => fmt$(p.value) },
    { field: 'currentPriceCents', headerName: 'Price', width: 90, valueFormatter: p => fmt$(p.value) },
    { field: 'marketValueCents', headerName: 'Value', width: 100, valueFormatter: p => fmt$(p.value) },
    {
      field: 'unrealisedPnLCents',
      headerName: 'P&L',
      width: 110,
      valueFormatter: p => `${p.value >= 0 ? '+' : ''}${fmt$(p.value)}`,
      cellStyle: p => ({ color: p.value >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }),
    },
    {
      field: 'unrealisedPct',
      headerName: '%',
      width: 90,
      valueFormatter: p => fmtPct(p.value),
      cellStyle: p => ({ color: (p.value ?? 0) >= 0 ? '#16a34a' : '#dc2626' }),
    },
    { field: 'allocationPct', headerName: 'Alloc', width: 80, valueFormatter: p => `${p.value.toFixed(1)}%` },
    {
      headerName: 'Trade',
      width: 140,
      sortable: false,
      cellRenderer: (p: { data: PnLRow }) => (
        <div className="flex gap-1 items-center h-full">
          <button
            onClick={() => onTrade(p.data.ticker, 'buy')}
            className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded font-semibold"
          >Buy</button>
          <button
            onClick={() => onTrade(p.data.ticker, 'sell')}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded font-semibold"
          >Sell</button>
        </div>
      ),
    },
  ], [onTrade]);

  const filtered = quick
    ? rows.filter(r => r.ticker.toLowerCase().includes(quick.toLowerCase()))
    : rows;

  return (
    <div>
      <input
        type="search"
        placeholder="Filter ticker…"
        value={quick}
        onChange={e => setQuick(e.target.value)}
        className="input mb-2 w-40 text-sm"
      />
      <div className="ag-theme-quartz w-full" style={{ height: Math.min(300, 48 + rows.length * 42) }}>
        <AgGridReact
          rowData={filtered}
          columnDefs={colDefs}
          defaultColDef={{ sortable: true, resizable: true }}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
}
