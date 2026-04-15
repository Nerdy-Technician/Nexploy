import { useMemo } from "react";
import { Icon } from "@mdi/react";
import { mdiChevronLeft, mdiChevronRight, mdiInformationOutline } from "@mdi/js";
import Button from "@/common/components/Button";
import "./styles.sass";

export const PaginatedTable = ({
                                   data = [],
                                   columns = [],
                                   pagination,
                                   onPageChange,
                                   renderRow,
                                   onRowClick,
                                   getRowKey = (item, index) => item.id ?? index,
                                   loading = false,
                                   emptyState = {},
                                   className = "",
                               }) => {
    const totalPages = useMemo(() =>
            Math.ceil(pagination.total / pagination.itemsPerPage),
        [pagination.total, pagination.itemsPerPage],
    );

    if (data.length === 0 && !loading) {
        return (
            <div className={`paginated-table-container ${className}`}>
                <div className="no-data">
                    <Icon path={emptyState.icon || mdiInformationOutline} />
                    <h3>{emptyState.title || "No data found"}</h3>
                    <p>{emptyState.subtitle || "There are no items to display."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`paginated-table-container ${className}`}>
            <div className="paginated-table">
                <div className="table-header" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
                    {columns.map((column) => (
                        <div key={column.key} className={`header-cell ${column.className || ""}`}>
                            {column.icon && <Icon path={column.icon} />}
                            <span>{column.label}</span>
                        </div>
                    ))}
                </div>

                <div className="table-body">
                    {data.map((item, index) => {
                        const key = getRowKey(item, index);

                        if (renderRow) {
                            return renderRow(item, index, key);
                        }

                        return (
                            <div
                                key={key}
                                className={`table-row ${onRowClick ? "clickable" : ""}`}
                                onClick={() => onRowClick?.(item)}
                                style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
                            >
                                {columns.map((column) => (
                                    <div
                                        key={column.key}
                                        className={`cell ${column.className || ""}`}
                                        data-label={column.mobileLabel || ""}
                                    >
                                        {column.render ? column.render(item) : item[column.key]}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {data.length > 0 && (
                <div className="pagination">
                    <div className="pagination-info">
                        Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.total)} of {pagination.total}
                    </div>

                    <div className="pagination-controls">
                        <Button
                            text="Previous"
                            icon={mdiChevronLeft}
                            onClick={() => onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                            type="secondary"
                        />

                        <span className="page-info">
                            Page {pagination.currentPage} of {totalPages}
                        </span>

                        <Button
                            text="Next"
                            icon={mdiChevronRight}
                            onClick={() => onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= totalPages}
                            type="secondary"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};