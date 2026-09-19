import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects, visibleProjects } from "@/data/projects";
import { site } from "@/data/site";
import CaseStudy from "@/components/CaseStudy";

export function generateStaticParams() {
  return visibleProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: `${p.title} — ${site.name}`, description: p.summary };
}

export default async function Page({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const index = visibleProjects.findIndex((x) => x.slug === slug);
  if (index < 0) notFound();
  const project = visibleProjects[index];
  const next = visibleProjects[(index + 1) % visibleProjects.length];
  return <CaseStudy project={project} index={index} next={next} />;
}
