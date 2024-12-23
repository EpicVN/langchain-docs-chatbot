"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { BotMessageSquare } from "lucide-react";
import { AIChatBox } from "./AIChatBox";
import { cn } from "@/lib/utils";

export const AIChatBoxButton = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);

  return (
    <>
      <div className={cn("z-100 fixed bottom-4 right-4 hover:scale-110 duration-500", chatbotOpen ? "hidden" : "fixed")}>
        <Button className="py-6 rounded-full justify-center items-center" onClick={() => setChatbotOpen(true)}>
          <BotMessageSquare size={30}/>
        </Button>
      </div>

      <AIChatBox open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </>
  );
};
