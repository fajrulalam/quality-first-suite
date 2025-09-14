import React from 'react';

interface ModeToggleProps {
  mode: "qa" | "testcase";
  onChange: (mode: "qa" | "testcase") => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
  return (
    <div className="flex space-x-2 justify-center mb-2">
      <button
        onClick={() => onChange("qa")}
        className={`px-3 py-1 text-xs rounded-full transition-colors ${
          mode === "qa"
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Q&A Mode
      </button>
      <button
        onClick={() => onChange("testcase")}
        className={`px-3 py-1 text-xs rounded-full transition-colors ${
          mode === "testcase"
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Test Case Mode
      </button>
    </div>
  );
};
