import { useState } from "react";
import { Plus } from "lucide-react";
import { useFaqs } from "../context/FaqsContext";

import useBulkActions from "../../../../components/hooks/useBulkActions";
import useCmsInlineEdit from "../../../../components/hooks/useCmsInlineEdit";
import useCmsFilter from "../../../../components/hooks/useCmsFilter";
import { STATUS_OPTIONS } from "../../../../components/common/Table/tableConstants";

import TableHeader from "../../../../components/common/Table/TableHeader";
import CmsTableToolbar from "../../../../components/common/Table/CmsTableToolbar";
import StatusBadge from "../../../../components/common/StatusBadge";
import InlineActionButtons from "../../../../components/common/Action/InlineActionButtons";
import BulkActionBar from "../../../../components/common/Action/BulkActionBar";
import {
  TextPrimary,
  Text,
} from "../../../../../shared/components/ui/Typography";

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

  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } =
    useCmsFilter();
  const {
    editingId,
    editForm,
    showAddRow,
    newForm,
    startEdit,
    cancelEdit,
    setEditField,
    openAddRow,
    closeAddRow,
    setNewField,
  } = useCmsInlineEdit({ emptyForm: { question: "", answer: "" } });

  const [selectedFaqs, setSelectedFaqs] = useState([]);

  const filtered = faqs.filter((f) => {
    const matchesSearch =
      f.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer?.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      matchesSearch && (statusFilter === "all" || f.status === statusFilter)
    );
  });

  const isAllSelected =
    filtered.length > 0 && selectedFaqs.length === filtered.length;
  const handleSelectAll = (e) =>
    setSelectedFaqs(e.target.checked ? filtered.map((f) => f.id) : []);
  const handleSelectOne = (id) =>
    setSelectedFaqs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: faqs,
      selectedItems: selectedFaqs,
      setSelectedItems: setSelectedFaqs,
      actions: { delete: deleteFaq, archive: archiveFaq, restore: restoreFaq },
      labels: { singular: "FAQ", plural: "FAQs" },
    });

  const handleAdd = async () => {
    if (!newForm.question.trim() || !newForm.answer.trim())
      return alert("Question and answer are required.");
    const result = await addFaq({
      question: newForm.question.trim(),
      answer: newForm.answer.trim(),
    });
    if (result.success) closeAddRow();
    else alert("Failed: " + result.message);
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.question.trim() || !editForm.answer.trim())
      return alert("Question and answer are required.");
    const result = await updateFaq(id, {
      question: editForm.question.trim(),
      answer: editForm.answer.trim(),
    });
    if (result.success) cancelEdit();
    else alert("Failed: " + result.message);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this FAQ?")) {
      const result = await deleteFaq(id);
      if (!result.success) alert("Failed: " + result.message);
    }
  };

  const handleArchive = async (id) => {
    const faq = faqs.find((f) => f.id === id);
    if (faq?.status !== "archived" && !window.confirm("Archive this FAQ?"))
      return;
    const result = await (faq?.status === "archived"
      ? restoreFaq(id)
      : archiveFaq(id));
    if (!result.success) alert("Failed: " + result.message);
  };

  const INPUT_CLS =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm";

  return (
    <div className="pb-6">
      <TableHeader
        title="Manage FAQs"
        subtitle="FAQs shown here will appear on your website."
        actions={[
          {
            label: "New FAQ",
            onClick: () => openAddRow(),
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <CmsTableToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by question or answer..."
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={STATUS_OPTIONS}
        />

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
              {showAddRow && (
                <tr className="border-b border-blue-100 bg-blue-50">
                  <td className="px-6 py-4" />
                  <td className="px-4 py-4">
                    <textarea
                      value={newForm.question}
                      onChange={(e) => setNewField("question", e.target.value)}
                      placeholder="Enter question..."
                      rows={2}
                      autoFocus
                      className={INPUT_CLS}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <textarea
                      value={newForm.answer}
                      onChange={(e) => setNewField("answer", e.target.value)}
                      placeholder="Enter answer..."
                      rows={2}
                      className={INPUT_CLS}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-600">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <InlineActionButtons
                      isEditing
                      onSave={handleAdd}
                      onCancel={closeAddRow}
                    />
                  </td>
                </tr>
              )}

              {loading ? (
                <tr>
                  <td
                    colSpan="5"
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
                          value={editForm.question}
                          onChange={(e) =>
                            setEditField("question", e.target.value)
                          }
                          rows={2}
                          autoFocus
                          className={INPUT_CLS}
                        />
                      ) : (
                        <TextPrimary
                          className={
                            faq.status === "archived"
                              ? "line-through opacity-50"
                              : ""
                          }
                        >
                          {faq.question}
                        </TextPrimary>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      {editingId === faq.id ? (
                        <textarea
                          value={editForm.answer}
                          onChange={(e) =>
                            setEditField("answer", e.target.value)
                          }
                          rows={3}
                          className={INPUT_CLS}
                        />
                      ) : (
                        <Text
                          className={
                            faq.status === "archived"
                              ? "line-through opacity-50"
                              : ""
                          }
                        >
                          {faq.answer}
                        </Text>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <StatusBadge status={faq.status} />
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <InlineActionButtons
                        isEditing={editingId === faq.id}
                        onEdit={() =>
                          startEdit(faq, (f) => ({
                            question: f.question,
                            answer: f.answer,
                          }))
                        }
                        onSave={() => handleSaveEdit(faq.id)}
                        onCancel={cancelEdit}
                        onArchive={() => handleArchive(faq.id)}
                        onDelete={() => handleDelete(faq.id)}
                        status={faq.status}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
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

      {selectedFaqs.length > 0 && (
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
