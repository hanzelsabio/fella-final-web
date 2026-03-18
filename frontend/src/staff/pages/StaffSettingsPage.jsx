import { useState } from "react";
import { Bell, Monitor, User, Save } from "lucide-react";
import Breadcrumb from "../../admin/components/common/Breadcrumb";

const StaffSettingsPage = () => {
  // Account settings
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("Asia/Manila");

  // Notification preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inquiryAlerts, setInquiryAlerts] = useState(true);
  const [invoiceAlerts, setInvoiceAlerts] = useState(true);

  // System preferences
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save to localStorage for now
    localStorage.setItem(
      "staff_settings",
      JSON.stringify({
        language,
        timezone,
        emailNotifs,
        inquiryAlerts,
        invoiceAlerts,
        darkMode,
        compactView,
      }),
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-black" : "bg-gray-300"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );

  return (
    <div className="pb-6">
      <Breadcrumb title="Settings" />

      {saved && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-600 font-medium">
          Settings saved successfully!
        </div>
      )}

      {/* Account Settings */}
      <div className="border border-gray-200 rounded-lg bg-white p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-gray-600" />
          <h2 className="text-md font-bold">Account Settings</h2>
        </div>
        <p className="text-xs text-gray-500 mb-6">
          Manage your language and timezone preferences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm bg-white"
            >
              <option value="en">English</option>
              <option value="fil">Filipino</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm bg-white"
            >
              <option value="Asia/Manila">Asia/Manila (PHT)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="border border-gray-200 rounded-lg bg-white p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-gray-600" />
          <h2 className="text-md font-bold">Notification Preferences</h2>
        </div>
        <p className="text-xs text-gray-500 mb-6">
          Choose what notifications you want to receive.
        </p>

        <div className="space-y-4">
          {[
            {
              label: "Inquiry Alerts",
              desc: "Get alerted on new or high-priority inquiries",
              value: inquiryAlerts,
              onChange: setInquiryAlerts,
            },
            {
              label: "Invoice Alerts",
              desc: "Get alerted on unpaid or overdue invoices",
              value: invoiceAlerts,
              onChange: setInvoiceAlerts,
            },
          ].map(({ label, desc, value, onChange }) => (
            <div
              key={label}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* System Preferences */}
      <div className="border border-gray-200 rounded-lg bg-white p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Monitor className="w-4 h-4 text-gray-600" />
          <h2 className="text-md font-bold">System Preferences</h2>
        </div>
        <p className="text-xs text-gray-500 mb-6">
          Customize how the dashboard looks and feels.
        </p>

        <div className="space-y-4">
          {[
            {
              label: "Dark Mode",
              desc: "Switch to a dark color scheme",
              value: darkMode,
              onChange: setDarkMode,
            },
          ].map(({ label, desc, value, onChange }) => (
            <div
              key={label}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="border border-gray-200 rounded-lg bg-white p-6">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-6 py-3 rounded-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffSettingsPage;
