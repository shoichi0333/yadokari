import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ArrowRight, Shield, Building2 } from "lucide-react";
import { BLOG_POSTS, getBlogPost } from "@/lib/data/blogPosts";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "記事が見つかりません | YADOKARI" };
  return {
    title: `${post.title} | YADOKARI`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      ...(post.imageUrl ? { images: [{ url: post.imageUrl, width: 800, alt: post.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(post.imageUrl ? { images: [post.imageUrl] } : {}),
    },
  };
}

function renderMarkdown(body: string): string {
  const lines = body.split("\n");
  const output: string[] = [];
  let tableRows: string[] = [];
  let listItems: string[] = [];

  function flushTable() {
    if (tableRows.length === 0) return;
    const [header, ...rest] = tableRows;
    const headerHtml = header.replace(/<td /g, '<th ').replace(/<\/td>/g, '</th>').replace(/class="border border-gray-200 px-4 py-2 text-sm"/g, 'class="border border-gray-200 px-4 py-2 text-sm font-semibold bg-gray-50"');
    output.push(`<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-gray-200 rounded-lg">${headerHtml}${rest.join("")}</table></div>`);
    tableRows = [];
  }

  function flushList() {
    if (listItems.length === 0) return;
    output.push(`<ul class="my-4 space-y-2">${listItems.join("")}</ul>`);
    listItems = [];
  }

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flushTable(); flushList();
      output.push(`<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4">${line.slice(3)}</h2>`);
    } else if (line.startsWith("### ")) {
      flushTable(); flushList();
      output.push(`<h3 class="text-xl font-bold text-gray-800 mt-8 mb-3">${line.slice(4)}</h3>`);
    } else if (line === "---") {
      flushTable(); flushList();
      output.push('<hr class="my-8 border-gray-200" />');
    } else if (/^\| .+ \|$/.test(line)) {
      flushList();
      const cells = line.slice(1, -1).split("|").map((c) => c.trim());
      if (cells.every((c) => /^-+$/.test(c))) continue;
      const row = cells.map((c) => `<td class="border border-gray-200 px-4 py-2 text-sm">${c}</td>`).join("");
      tableRows.push(`<tr>${row}</tr>`);
    } else if (line.startsWith("- ")) {
      flushTable();
      const content = line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
      listItems.push(`<li class="flex items-start gap-2 text-gray-700"><span class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500"></span><span>${content}</span></li>`);
    } else if (/^\d+\. /.test(line)) {
      flushTable(); flushList();
      output.push(`<li class="text-gray-700 list-decimal list-inside">${line.replace(/^\d+\. /, "")}</li>`);
    } else if (line.trim() === "") {
      flushTable(); flushList();
    } else {
      flushTable(); flushList();
      const text = line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
      output.push(`<p class="text-gray-700 leading-relaxed my-4">${text}</p>`);
    }
  }
  flushTable();
  flushList();
  return output.join("\n");
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const otherPosts = (() => {
    const samePrefecturePosts = BLOG_POSTS.filter(
      (p) => post.prefecture && p.prefecture === post.prefecture && p.slug !== post.slug,
    ).slice(0, 2);
    const sameCategoryPosts = BLOG_POSTS.filter(
      (p) =>
        p.category === post.category &&
        p.slug !== post.slug &&
        !samePrefecturePosts.some((selectedPost) => selectedPost.slug === p.slug),
    ).slice(0, 2 - samePrefecturePosts.length);
    const fallbackPosts = BLOG_POSTS.filter(
      (p) =>
        p.slug !== post.slug &&
        !samePrefecturePosts.some((selectedPost) => selectedPost.slug === p.slug) &&
        !sameCategoryPosts.some((selectedPost) => selectedPost.slug === p.slug),
    ).slice(0, 2 - samePrefecturePosts.length - sameCategoryPosts.length);

    return [...samePrefecturePosts, ...sameCategoryPosts, ...fallbackPosts];
  })();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: "https://yadokari.jp" },
          { "@type": "ListItem", position: 2, name: "民泊コラム", item: "https://yadokari.jp/blog" },
          { "@type": "ListItem", position: 3, name: post.title, item: `https://yadokari.jp/blog/${post.slug}` },
        ],
      },
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        url: `https://yadokari.jp/blog/${post.slug}`,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        author: { "@type": "Organization", name: "YADOKARI" },
        publisher: {
          "@type": "Organization",
          name: "YADOKARI",
          logo: { "@type": "ImageObject", url: "https://yadokari.jp/opengraph-image" },
        },
      },
    ],
  };

  return (
    <main className="bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          {post.imageUrl && (
            <div className="relative mb-8 h-64 overflow-hidden rounded-2xl sm:h-80">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                sizes="(min-width: 1024px) 768px, 100vw"
                className="rounded-2xl object-cover"
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-teal-600">トップ</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-teal-600">民泊コラム</Link>
            <span>/</span>
            <span className="truncate text-gray-700">{post.title}</span>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={11} />
              {post.readingMinutes}分で読める
            </span>
            <time className="text-xs text-gray-400" dateTime={post.publishedAt}>
              {post.publishedAt}
            </time>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            {post.description}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        <article
          className="prose-sm max-w-none rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
        />

        {/* CTA */}
        <section className="rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-600 p-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Shield size={18} />
                実際の住所で民泊可否を確認する
              </h2>
              <p className="mt-1 text-sm text-teal-100">
                住所を入力するだけで住宅宿泊・特区民泊・旅館業の可否と収益試算を表示します。
              </p>
            </div>
            <Link
              href="/check"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
            >
              可否チェッカーへ
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Property suggestions */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Building2 size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">おすすめ民泊物件を探す</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  YADOKARIで民泊対応物件をキーワード・エリア・タグで絞り込み
                </p>
              </div>
            </div>
            <Link
              href={post.prefecture ? `/properties?prefecture=${encodeURIComponent(post.prefecture)}` : "/properties"}
              className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-100 px-5 py-3 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50"
            >
              {post.prefecture ? `${post.prefecture}の民泊物件を探す` : "民泊物件を探す"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* エリアガイドへの誘導（prefecture記事のみ） */}
        {post.prefecture && (
          <section className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-700">
              {post.prefecture}のエリア別民泊可否ガイド
            </p>
            <Link
              href={`/area/${encodeURIComponent(post.prefecture)}`}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100"
            >
              エリアガイドを見る
              <ArrowRight size={14} />
            </Link>
          </section>
        )}

        {/* 関連記事 */}
        {otherPosts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">関連コラム</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {otherPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
                >
                  <span className="mb-2 inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                    {related.category}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-gray-900 group-hover:text-teal-700 line-clamp-2">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          <ArrowLeft size={14} />
          コラム一覧に戻る
        </Link>
      </div>
    </main>
  );
}
