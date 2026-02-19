import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_TR } from "material-react-table/locales/tr";
;

const DataTable = ({ data, columns, pagination, totalCount, onPaginationChange, enableExpanding }) => {
  const table = useMaterialReactTable({
    columns,
    data,
    localization: MRT_Localization_TR,
    enableExpanding: enableExpanding || false,
    getSubRows: (row) => row.subRows,
    enableStickyHeader: true,
    rowCount: totalCount,
    manualFiltering: true,
    enablePagination: true,
    manualPagination: true, // manual pagination control
    onPaginationChange,
    state: { pagination }, // pass the pagination state to the table
    muiPaginationProps: {
      showRowsPerPage: false,
      shape: "rounded",
    },
    initialState: { density: 'compact' },
    paginationDisplayMode: "pages",
    enableColumnActions: false,
  });

  return <MaterialReactTable table={table} />;
};

export default DataTable;
