/**
 * useBulkActions
 * Provides bulk delete and archive/restore handlers with confirm + alert.
 * Eliminates the identical handleBulkDelete / handleBulkArchive blocks in every table.
 *
 * Usage:
 *   const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } = useBulkActions({
 *     items: products,
 *     selectedItems,
 *     setSelectedItems,
 *     actions: { delete: deleteProduct, archive: archiveProduct, restore: restoreProduct },
 *     labels: { singular: "product", plural: "products" },
 *   });
 */
const useBulkActions = ({
  items,
  selectedItems,
  setSelectedItems,
  actions,
  labels,
}) => {
  const { singular, plural } = labels;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} ${plural}?`)) return;
    for (const id of selectedItems) await actions.delete(id);
    setSelectedItems([]);
    alert(`Selected ${plural} deleted.`);
  };

  const handleBulkArchive = async () => {
    const first = items.find((i) => i.id === selectedItems[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (!window.confirm(`${cap(action)} ${selectedItems.length} ${plural}?`))
      return;
    for (const id of selectedItems) {
      if (isArchived) await actions.restore(id);
      else await actions.archive(id);
    }
    setSelectedItems([]);
    alert(`Selected ${plural} ${action}d.`);
  };

  const bulkArchiveLabel = (() => {
    if (!selectedItems.length) return "Archive";
    const first = items.find((i) => i.id === selectedItems[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  return { handleBulkDelete, handleBulkArchive, bulkArchiveLabel };
};

export default useBulkActions;
