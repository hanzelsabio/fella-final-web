import { createContext, useContext, useState, useEffect } from "react";
import { invoiceAPI } from "../services/invoiceAPI";

const InvoiceContext = createContext();

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");
      try {
        const res = await invoiceAPI.getAll();
        if (res.data.success) setInvoices(res.data.data || []);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setInvoices([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error in fetchAllData:", err);
      setError("Failed to load data");
      setLoading(false);
    }
  };

  const optimisticStatusUpdate = (invoiceId, newStatus) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: newStatus } : i)),
    );
  };

  const createInvoice = async (data) => {
    try {
      const response = await invoiceAPI.create(data);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, data: response.data.data };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to create invoice",
      };
    }
  };

  const updateInvoice = async (invoiceId, data) => {
    try {
      const response = await invoiceAPI.update(invoiceId, data);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update invoice",
      };
    }
  };

  const deleteInvoice = async (invoiceId) => {
    try {
      const response = await invoiceAPI.delete(invoiceId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete invoice",
      };
    }
  };

  const archiveInvoice = async (invoiceId) => {
    try {
      const response = await invoiceAPI.archive(invoiceId);
      if (response.data.success) {
        optimisticStatusUpdate(invoiceId, "archived");
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to archive invoice",
      };
    }
  };

  const restoreInvoice = async (invoiceId) => {
    try {
      const response = await invoiceAPI.restore(invoiceId);
      if (response.data.success) {
        optimisticStatusUpdate(invoiceId, "unpaid");
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to restore invoice",
      };
    }
  };

  const markAsPaid = async (invoiceId) => {
    try {
      const response = await invoiceAPI.markAsPaid(invoiceId);
      if (response.data.success) {
        optimisticStatusUpdate(invoiceId, "paid");
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to mark as paid",
      };
    }
  };

  const markAsUnpaid = async (invoiceId) => {
    try {
      const response = await invoiceAPI.markAsUnpaid(invoiceId);
      if (response.data.success) {
        optimisticStatusUpdate(invoiceId, "unpaid");
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to mark as unpaid",
      };
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        loading,
        error,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        archiveInvoice,
        restoreInvoice,
        markAsPaid,
        markAsUnpaid,
        refreshData: fetchAllData,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => useContext(InvoiceContext);
