"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { BotMessageSquare } from "lucide-react";
import { AIChatBox } from "./AIChatBox";

export const AIChatBoxButton = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);

  return (
    <>
      <div className="z-100 fixed bottom-4 right-4">
        <Button className="py-8 rounded-full justify-center items-center" onClick={() => setChatbotOpen(true)}>
          <BotMessageSquare size={36}/>
        </Button>
      </div>

      <AIChatBox open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </>
  );
};
