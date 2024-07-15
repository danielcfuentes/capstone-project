import React from "react";

const RunContext = React.createContext(null);

export const RunProvider = ({ children, value }) => (
  <RunContext.Provider value={value}>{children}</RunContext.Provider>
);

export const useRunContext = () => {
  const context = React.useContext(RunContext);
  if (context === undefined) {
    throw new Error("useRunContext must be used within a RunProvider");
  }
  return context;
};
