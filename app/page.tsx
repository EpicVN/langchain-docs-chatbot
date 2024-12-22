import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PageRoutes } from "@/lib/pageroutes";

export default function Home() {
  return (
    <div className="flex min-h-[86.5vh] flex-col items-center justify-center px-2 py-8 text-center">
      <h1 className="mb-4 text-4xl font-bold sm:text-7xl">
        LangChain
      </h1>
      <p className="mb-8 max-w-[600px] text-foreground sm:text-base">
        Build context-aware, reasoning applications with LangChain’s flexible
        framework that leverages your company’s data and APIs. Future-proof your
        application by making vendor optionality part of your LLM infrastructure
        design.
      </p>
      <div className="flex items-center gap-5">
        <Link
          href={`/docs${PageRoutes[0].href}`}
          className={buttonVariants({ className: "px-6", size: "lg" })}
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
