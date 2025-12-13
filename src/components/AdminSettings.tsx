import { useState, useEffect } from "react";
import { supabase, StoreSettings } from "../lib/supabase";
import { Save, Loader2, X } from "lucide-react";
import toaster from "../ui/toaster";

interface AdminSettingsProps {
  onClose: () => void;
}

export default function AdminSettings({ onClose }: AdminSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    id: 1, // Default ID
    zelle_id: "",
    paypal_id: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .single(); // Assumes single row

      if (error) {
        // If no row found, we might need to handle it, but table init should handle it
        if (error.code !== "PGRST116") {
          // PGRST116 is no rows
          console.error("Error fetching settings:", error);
        }
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Upsert to ensure row 1 exists
      const { error } = await supabase.from("store_settings").upsert({
        id: 1, // Enforce single row
        zelle_id: settings.zelle_id,
        paypal_id: settings.paypal_id,
      });

      if (error) throw error;

      toaster({ type: "success", message: "Settings saved successfully!" });
      onClose();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toaster({
        type: "error",
        message: `Failed to save: ${error.message || "Unknown error"}`,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-brand-dark" size={32} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Store Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Admin Zelle ID / Number
            </label>
            <input
              type="text"
              value={settings.zelle_id}
              onChange={(e) =>
                setSettings({ ...settings, zelle_id: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-light focus:border-transparent outline-none transition-all font-medium"
              placeholder="(555) 123-4567"
            />
            <p className="text-xs text-gray-500 mt-1">
              Displayed to customers choosing Zelle.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Admin PayPal Email / ID
            </label>
            <input
              type="text"
              value={settings.paypal_id}
              onChange={(e) =>
                setSettings({ ...settings, paypal_id: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-light focus:border-transparent outline-none transition-all font-medium"
              placeholder="payments@store.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Displayed to customers choosing PayPal.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-brand-dark to-brand-light text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
