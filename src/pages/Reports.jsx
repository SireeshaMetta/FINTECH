import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenses } from '../redux/expenseSlice';
import Loader from '../components/Loader';
import { FiDownload, FiFileText, FiCalendar, FiPieChart } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const Reports = () => {
  const dispatch = useDispatch();
  const { expenses, loading } = useSelector((state) => state.expenses);
  const [reportType, setReportType] = useState('Expenses'); // Expenses, Category, Budget

  useEffect(() => {
    dispatch(fetchExpenses({ limit: 1000 })); // load a bulk number of expenses for reports
  }, [dispatch]);

  const handleExportPDF = () => {
    if (expenses.length === 0) return;
    const doc = new jsPDF();

    // Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241); // Indigo
    doc.text('FinGuard AI Ledger Report', 14, 20);

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);
    doc.text(`Total Records: ${expenses.length}`, 14, 31);

    // Draw simple line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 36, 196, 36);

    // Table Headers
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Date', 14, 45);
    doc.text('Title', 45, 45);
    doc.text('Category', 110, 45);
    doc.text('Method', 150, 45);
    doc.text('Amount', 180, 45);

    doc.line(14, 49, 196, 49);

    // Table Body
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    let y = 57;

    expenses.forEach((exp, idx) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      const formattedDate = new Date(exp.date).toLocaleDateString();
      doc.text(formattedDate, 14, y);
      doc.text(exp.title.substring(0, 25), 45, y);
      doc.text(exp.category, 110, y);
      doc.text(exp.paymentMethod || 'Cash', 150, y);
      doc.text(`$${exp.amount.toFixed(2)}`, 180, y);
      y += 8;
    });

    doc.save(`FinGuard_Financial_Report_${Date.now()}.pdf`);
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) return;

    // Map fields
    const formattedData = expenses.map((exp) => ({
      Title: exp.title,
      Amount: exp.amount,
      Category: exp.category,
      Date: new Date(exp.date).toLocaleDateString(),
      Method: exp.paymentMethod || 'Cash',
      Description: exp.description || '',
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    XLSX.writeFile(wb, `FinGuard_Expenses_Report_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <FiFileText className="text-indigo-400 shrink-0" />
          <span>Audit Reports & Ledger Exports</span>
        </h1>
        <p className="text-slate-400 mt-1">Export transaction summaries and category distributions into Excel or PDF formats.</p>
      </div>

      {loading ? (
        <Loader size="lg" message="Aggregating records for export..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="p-6 rounded-2xl glass border border-slate-800 space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Report Configuration</h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase block">Report Scope</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 outline-none text-slate-300 text-sm focus:border-indigo-500 appearance-none"
              >
                <option value="Expenses">All Expenses Ledger</option>
                <option value="Category">Category Breakdown</option>
                <option value="Budget">Budget Limit Audit</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <button
                onClick={handleExportPDF}
                disabled={expenses.length === 0}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                <FiDownload />
                <span>Export PDF Report</span>
              </button>
              <button
                onClick={handleExportCSV}
                disabled={expenses.length === 0}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 font-semibold text-sm border border-slate-700 hover:border-indigo-500/20 transition-all active:scale-[0.98]"
              >
                <FiDownload />
                <span>Export Excel Sheet</span>
              </button>
            </div>
          </div>

          {/* Overview / Preview Panel */}
          <div className="lg:col-span-2 p-6 rounded-2xl glass border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-slate-200">Ledger Preview</h3>

            {expenses.length === 0 ? (
              <p className="text-sm text-slate-500 py-12 text-center">No transactions available to generate report summaries.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
                <table className="w-full text-left border-collapse text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {expenses.slice(0, 10).map((exp) => (
                      <tr key={exp._id} className="hover:bg-slate-900/10">
                        <td className="py-3 px-4 text-slate-400">{new Date(exp.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-medium text-slate-200">{exp.title}</td>
                        <td className="py-3 px-4 text-slate-400">{exp.category}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-100">${exp.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {expenses.length > 10 && (
                  <div className="p-3 text-center text-[10px] text-slate-500 border-t border-slate-800/40 font-medium">
                    Showing first 10 entries of {expenses.length} records.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
