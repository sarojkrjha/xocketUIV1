import { AllCommunityModule, ModuleRegistry, type ColDef, type RowDoubleClickedEvent, type SelectionChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([AllCommunityModule]);

type EnterpriseGridProps<TData extends object> = {
  rows: TData[];
  columns: ColDef<TData>[];
  isLoading?: boolean;
  emptyMessage?: string;
  height?: number | string;
  onRowDoubleClicked?: (row: TData) => void;
  onSelectionChanged?: (rows: TData[]) => void;
  rowHeight?: number;
  headerHeight?: number;
};

export function EnterpriseGrid<TData extends object>({
  rows,
  columns,
  isLoading = false,
  emptyMessage = 'No records found.',
  height = 520,
  onRowDoubleClicked,
  onSelectionChanged,
  rowHeight = 56,
  headerHeight = 56
}: EnterpriseGridProps<TData>) {
  return (
    <div className="enterprise-grid-shell">
      <div className="ag-theme-xocket" style={{ height, width: '100%' }}>
        <AgGridReact<TData>
          rowData={rows}
          columnDefs={columns}
          loading={isLoading}
          animateRows
          rowSelection={{ mode: 'multiRow' }}
          rowHeight={rowHeight}
          headerHeight={headerHeight}
          suppressCellFocus
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: true,
            minWidth: 120,
            flex: 1
          }}
          onRowDoubleClicked={(event: RowDoubleClickedEvent<TData>) => {
            if (event.data && onRowDoubleClicked) {
              onRowDoubleClicked(event.data);
            }
          }}
          onSelectionChanged={(event: SelectionChangedEvent<TData>) => {
            if (onSelectionChanged) {
              onSelectionChanged(event.api.getSelectedRows());
            }
          }}
          overlayNoRowsTemplate={`<span class="enterprise-grid-empty">${emptyMessage}</span>`}
        />
      </div>
    </div>
  );
}
