import { useState } from "react";

/**
 * useCmsInlineEdit
 * Manages inline-edit state for CMS tables (editingId, editForm, showAddRow).
 *
 * Usage:
 *   const {
 *     editingId, editForm, showAddRow, newForm,
 *     startEdit, cancelEdit, setEditField,
 *     openAddRow, closeAddRow, setNewField,
 *   } = useCmsInlineEdit({ emptyForm: { text: "" } });
 */
const useCmsInlineEdit = ({ emptyForm = {} } = {}) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);

  const startEdit = (item, formMapper) => {
    setEditingId(item.id);
    setEditForm(formMapper ? formMapper(item) : { ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const setEditField = (key, value) =>
    setEditForm((prev) => ({ ...prev, [key]: value }));

  const openAddRow = (initialForm) => {
    setShowAddRow(true);
    setNewForm(initialForm ?? emptyForm);
  };

  const closeAddRow = () => {
    setShowAddRow(false);
    setNewForm(emptyForm);
  };

  const setNewField = (key, value) =>
    setNewForm((prev) => ({ ...prev, [key]: value }));

  return {
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
  };
};

export default useCmsInlineEdit;
