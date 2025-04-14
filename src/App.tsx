import React from "react";
import { ReactFlowProvider } from "reactflow";

import FlowCanvas from "./components/FlowCanvas"; // Import the new component
import "./styles/main.css";

function App() {
  return (
    // ReactFlowProvider needs to wrap the component using useReactFlow
    <ReactFlowProvider>
      <div className="app-container">
        <FlowCanvas /> {/* Render the component containing flow logic */}
      </div>
    </ReactFlowProvider>
  );
}

export default App;
