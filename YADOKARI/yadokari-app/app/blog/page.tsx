import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { BLOG_POSTS } from "@/lib/data/blogPosts";

export const metadata: Metadata = {
  title: "民泊コラム | YADOKARI",
  description: "民泊の始め方・法規制・エリア別投資ガイドなど、民泊投資に役立つコラムを掲載しています。住宅宿泊事業法・特区民泊・旅館業の解説から収益シミュレーションまで。",
  openGraph: {
    title: "民泊コラム | YADOKARI",
    description: "民泊投資に役立つ法規制解説・エリアガイド・収益シミュレーション記事を掲載。",
    type: "website",
  },
};

const blogListJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "YADOKARI 民泊コラム",
  url: "https://yadokari.jp/blog",
  description: "民泊投資・法規制・エリアガイドに関するコラム",
  blogPost: BLOG_POSTS.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `https://yadokari.jp/blog/${post.slug}`,
    datePublished: post.publishedAt,
  })),
};

const CATEGORIES = Array.from(new Set(BLOG_POSTS.map((p) => p.category))).sort();

type PageProps = { searchParams: Promise<{ category?: string }> };

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const activeCategory = CATEGORIES.includes(category ?? "") ? (category as string) : null;

  const sortedPosts = [...BLOG_POSTS]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .filter((p) => !activeCategory || p.category === activeCategory);

  return (
    <main className="bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListJsonLd) }}
      />

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-teal-600">トップ</Link>
            <span>/</span>
            <span className="text-gray-700">民泊コラム</span>
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            <BookOpen size={13} />
            Column
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            民泊コラム
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
            民泊の始め方・法規制・エリア別投資ガイドなど、民泊投資に役立つ情報をまとめています。
          </p>

          {/* Category filter */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/blog"
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                !activeCategory
                  ? "bg-teal-600 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-teal-200 hover:text-teal-700"
              }`}
            >
              すべて
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeCategory === cat
                    ? "bg-teal-600 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-teal-200 hover:text-teal-700"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {sortedPosts.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">該当する記事がありません。</p>
        ) : (
          <div className="space-y-6">
            {sortedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
              >
                {post.imageUrl && (
                  <div className="relative hidden h-auto w-48 shrink-0 overflow-hidden sm:block">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      sizes="192px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} />
                      {post.readingMinutes}分で読める
                    </span>
                    <span className="text-xs text-gray-400">{post.publishedAt}</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-teal-700">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-teal-600 group-hover:text-teal-800">
                    続きを読む <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
