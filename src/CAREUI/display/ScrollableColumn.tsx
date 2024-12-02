// src/CAREUI/display/ScrollableColumn.tsx
import React from "react";

interface ScrollableColumnProps {
  title: string;
  children: React.ReactNode;
}

const ScrollableColumn: React.FC<ScrollableColumnProps> = ({
  title,
  children,
}) => {
  return (
    <div
      style={{
        height: "400px",
        overflowY: "auto",
        border: "1px solid #ccc",
        margin: "10px",
      }}
    >
      <h3>{title}</h3>
      {children}
    </div>
  );
};

export default ScrollableColumn;
