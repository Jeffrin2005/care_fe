import React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

interface ScrollableColumnProps {
  title: string;
  children: React.ReactNode;
}

const ScrollableColumn: React.FC<ScrollableColumnProps> = ({
  title,
  children,
}) => {
  return (
    <div className="border border-gray-300 m-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ScrollArea className="h-[400px] overflow-hidden">
        <div className="flex flex-col">{children}</div>
      </ScrollArea>
    </div>
  );
};

export default ScrollableColumn;
