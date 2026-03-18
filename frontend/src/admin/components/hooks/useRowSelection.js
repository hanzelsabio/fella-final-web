import { useState } from "react";

export const useRowSelection = () => {
  const [selected, setSelected] = useState([]);

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectAll = (items) => {
    setSelected(items.map((item) => item.id));
  };

  const clearSelection = () => setSelected([]);

  return {
    selected,
    setSelected,
    toggleOne,
    selectAll,
    clearSelection,
    hasSelection: selected.length > 0,
  };
};
