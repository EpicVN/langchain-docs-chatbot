import { PageRoutes } from "@/lib/pageroutes";

export const Navigations = [
  {
    title: "Docs",
    href: `/docs${PageRoutes[0].href}`,
  },
  {
    title: "Home",
    href: "https://js.langchain.com/docs/introduction/",
    external: true,
  }
];

export const GitHubLink = {
  href: "https://github.com/langchain-ai/langchain",
};