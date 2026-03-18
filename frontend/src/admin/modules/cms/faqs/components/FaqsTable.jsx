import { useState } from "react";
import {
  Plus,
  Trash2,
  Archive,
  Pencil,
  X,
  Check,
  Filter,
  Search,
} from "lucide-react";
import { useFaqs } from "../context/FaqsContext";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import CustomDropdown from "../../../../components/common/CustomDropdown";

const FaqsTable = () => {
  const {
    faqs,
    loading,
    addFaq,
    updateFaq,
    deleteFaq,
    archiveFaq,
    restoreFaq,
  } = useFaqs();

  const [selectedFaqs, setSelectedFaqs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  // ── Inline add state ────────────────────────────────────────────
  const [showAddRow, setShowAddRow] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  // ── Inline edit state ───────────────────────────────────────────
  const [editingId, setEditingId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  // ── Filter ──────────────────────────────────────────────────────
  const filtered = faqs.filter((f) => {
    const matchesSearch =
      f.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer?.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      matchesSearch && (statusFilter === "all" || f.status === statusFilter)
    );
  });

  // ── Checkbox ────────────────────────────────────────────────────
  const handleSelectAll = (e) =>
    setSelectedFaqs(e.target.checked ? filtered.map((f) => f.id) : []);
  const handleSelectOne = (id) =>
    setSelectedFaqs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const isAllSelected =
    filtered.length > 0 && selectedFaqs.length === filtered.length;
  const hasSelection = selectedFaqs.length > 0;

  // ── Add ─────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newQuestion.trim() || !newAnswer.trim())
      return alert("Question and answer are required.");
    const result = await addFaq({
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
    });
    if (result.success) {
      setNewQuestion("");
      setNewAnswer("");
      setShowAddRow(false);
    } else alert("Failed: " + result.message);
  };

  // ── Edit ────────────────────────────────────────────────────────
  const startEdit = (faq) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  const handleSaveEdit = async (id) => {
    if (!editQuestion.trim() || !editAnswer.trim())
      return alert("Question and answer are required.");
    const result = await updateFaq(id, {
      question: editQuestion.trim(),
      answer: editAnswer.trim(),
    });
    if (result.success) setEditingId(null);
    else alert("Failed: " + result.message);
  };

  // ── Delete / Archive ────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (window.confirm("Delete this FAQ?")) {
      const result = await deleteFaq(id);
      if (!result.success) alert("Failed: " + result.message);
    }
  };

  const handleArchive = async (id) => {
    const faq = faqs.find((f) => f.id === id);
    if (faq?.status === "archived") {
      const result = await restoreFaq(id);
      if (!result.success) alert("Failed: " + result.message);
    } else {
      if (window.confirm("Archive this FAQ?")) {
        const result = await archiveFaq(id);
        if (!result.success) alert("Failed: " + result.message);
      }
    }
  };

  // ── Bulk ────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedFaqs.length} FAQ(s)?`)) return;
    for (const id of selectedFaqs) await deleteFaq(id);
    setSelectedFaqs([]);
  };

  const handleBulkArchive = async () => {
    const first = faqs.find((f) => f.id === selectedFaqs[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedFaqs.length} FAQ(s)?`,
      )
    )
      return;
    for (const id of selectedFaqs) {
      if (isArchived) await restoreFaq(id);
      else await archiveFaq(id);
    }
    setSelectedFaqs([]);
  };

  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const first = faqs.find((f) => f.id === selectedFaqs[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          <div>
            <h2 className="text-lg font-bold">Manage FAQs</h2>
            <p className="text-xs text-gray-600">
              FAQs shown here will appear on your website.
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddRow(true);
              setNewQuestion("");
              setNewAnswer("");
            }}
            className="bg-black hover:bg-gray-800 text-white text-xs rounded-md px-4 py-3 transition-colors flex items-center gap-2 self-end sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New FAQ</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Search and Filter */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by question or answer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="Active"
              icon={Filter}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="min-w-[50px] px-6 pt-5 pb-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="min-w-[280px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Question
                </th>
                <th className="min-w-[350px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Answer
                </th>
                <th className="min-w-[100px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-end" />
              </tr>
            </thead>
            <tbody>
              {/* Inline add row */}
              {showAddRow && (
                <tr className="border-b border-blue-100 bg-blue-50">
                  <td className="px-6 py-4" />
                  <td className="px-4 py-4">
                    <textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Enter question..."
                      rows={2}
                      autoFocus
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Enter answer..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-600">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleAdd}
                        className="p-1.5 rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowAddRow(false)}
                        className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((faq, index) => (
                  <tr
                    key={faq.id}
                    className={`${index !== filtered.length - 1 && editingId !== faq.id ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedFaqs.includes(faq.id)}
                        onChange={() => handleSelectOne(faq.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      {editingId === faq.id ? (
                        <textarea
                          value={editQuestion}
                          onChange={(e) => setEditQuestion(e.target.value)}
                          rows={2}
                          autoFocus
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                        />
                      ) : (
                        <p
                          className={`text-sm font-medium ${faq.status === "archived" ? "text-gray-400 line-through" : "text-gray-900"}`}
                        >
                          {faq.question}
                        </p>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      {editingId === faq.id ? (
                        <textarea
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                        />
                      ) : (
                        <p
                          className={`text-sm ${faq.status === "archived" ? "text-gray-400 line-through" : "text-gray-600"}`}
                        >
                          {faq.answer}
                        </p>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${faq.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}
                      >
                        {faq.status === "archived" ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === faq.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(faq.id)}
                              className="p-1.5 rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(faq)}
                              className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleArchive(faq.id)}
                              className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                              title={
                                faq.status === "archived"
                                  ? "Restore"
                                  : "Archive"
                              }
                            >
                              <Archive className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(faq.id)}
                              className="p-1.5 rounded-md border border-red-200 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    No FAQs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hasSelection && (
        <BulkActionBar
          count={selectedFaqs.length}
          onDelete={handleBulkDelete}
          onArchive={handleBulkArchive}
          archiveLabel={bulkArchiveLabel}
        />
      )}
    </div>
  );
};

export default FaqsTable;
