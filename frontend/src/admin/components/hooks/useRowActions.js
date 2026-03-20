/**
 * useRowActions
 * Provides row-level delete and archive/restore handlers with confirm + alert.
 * Eliminates the identical handleDelete / handleArchive blocks repeated in every table.
 *
 * Usage:
 *   const { handleDelete, handleArchive } = useRowActions({
 *     items: products,
 *     actions: { delete: deleteProduct, archive: archiveProduct, restore: restoreProduct },
 *     labels: { singular: "product" },
 *   });
 */
const useRowActions = ({ items, actions, labels }) => {
  const { singular } = labels;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${singular}?`)) return;
    const result = await actions.delete(id);
    alert(
      result.success
        ? `${cap(singular)} deleted successfully`
        : "Failed: " + result.message,
    );
  };

  const handleArchive = async (id) => {
    const item = items.find((i) => i.id === id);
    const isArchived = item?.status === "archived";
    const verb = isArchived ? "Restore" : "Archive";
    if (!window.confirm(`${verb} this ${singular}?`)) return;
    const fn = isArchived ? actions.restore : actions.archive;
    const result = await fn(id);
    alert(
      result.success
        ? `${cap(singular)} ${isArchived ? "restored" : "archived"} successfully`
        : "Failed: " + result.message,
    );
  };

  return { handleDelete, handleArchive };
};

export default useRowActions;
