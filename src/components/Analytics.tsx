import { useState } from "react";
import Overview from "../context/Overview";

type analyticTab = "Overview" | "All Items";

export default function Analytics() {
    const [currentTab, setCurrentTab] = useState<analyticTab>("Overview");

    const renderOverview = ()=>{
        return Overview();
    }
    const renderAllItems = () =>{
        return "All Items"
    }

    const renderContent = ()=>{
        switch(currentTab){
            case("All Items"):
                return renderAllItems();
            default:
                return renderOverview();
        }
    }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Analytics</h2>

      <div className="flex w-full">
        <nav className="flex w-full">
            <button
            onClick={() => setCurrentTab("Overview")}
            className={`flex w-full justify-center px-3 py-2 rounded-t-lg ${
              currentTab === "Overview"
                ? "text-gray border-b-2 shadow-lg border-blue-500"
                : "hover:bg-gray-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentTab("All Items")}
            className={`flex w-full justify-center px-3 py-2 rounded-t-lg ${
              currentTab === "All Items"
                ? "text-gray border-b-2 shadow-lg border-blue-500"
                : "hover:bg-gray-200"
            }`}
          >
            All Items
          </button>
        </nav>
      </div>

      <div>
        {renderContent()}
      </div>
    </div>
  );
}
