import React from "react";

// Matches the table's spinner: blue ring with gray bottom + spin
export default function Spinner({ size = "8" }) {
  const sizeClass =
    size === "6" ? "w-6 h-6"
    : size === "10" ? "w-10 h-10"
    : "w-8 h-8"; // default 8
  return (
    <div
      className={`${sizeClass} border-4 border-solid border-blue rounded-full border-b-gray-200 animate-spin`}
      role="status"
    />
  );
}