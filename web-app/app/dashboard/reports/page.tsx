'use client';

import { db, ConsolidatedReportItem } from '@/app/lib/store';
import { useEffect, useState } from 'react';

export default function ReportsPage() {
    const [report, setReport] = useState<ConsolidatedReportItem[]>([]);

    useEffect(() => {
        // In a real app this might be async/server side, but with MockDB it's direct
        setReport(db.getConsolidatedReport());
    }, []);

    return (
        <>
            <div className="header">
                <h1 className="page-title">Consolidated Report</h1>
                <button className="btn btn-secondary">Download Excel</button>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Budget Item</th>
                            <th style={{ textAlign: 'right' }}>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.length === 0 ? (
                            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>No data found.</td></tr>
                        ) : (
                            report.map((r, idx) => (
                                <tr key={idx}>
                                    <td>{r.category_code}</td>
                                    <td>{r.category_name}</td>
                                    <td style={{ textAlign: 'right' }}>{r.total_amount.toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
