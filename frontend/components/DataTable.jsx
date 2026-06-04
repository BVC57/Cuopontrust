export default function DataTable({ columns, rows, emptyText = "No records found." }) {
  return (
    <div className="admin-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="admin-table-head">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.18em] admin-muted">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={row._id || index} className="admin-table-row">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-4 text-sm admin-body">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm admin-muted">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
