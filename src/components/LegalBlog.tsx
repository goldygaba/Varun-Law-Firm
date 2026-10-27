import { useState } from 'react';
import { BookOpen, Clock, Calendar, ArrowRight, X, FileText, Scale } from 'lucide-react';
import { BLOG_POSTS } from '../data/legalData';
import { BlogPost } from '../types';

interface LegalBlogProps {
  onOpenBooking: () => void;
}

export default function LegalBlog({ onOpenBooking }: LegalBlogProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="py-24 bg-[#070d1e] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d8be98] font-semibold mb-3">
            <span>Jurisprudential Insights</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Legal Analysis & Guides</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Legal Articles & Statutory Commentary
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            In-depth analysis of emerging judicial precedents, procedural rights, and statutory compliance under Indian jurisprudence.
          </p>
        </div>

        {/* 4 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group rounded-2xl bg-gradient-to-b from-[#0e1a38] to-[#070f24] border border-[#c5a880]/20 hover:border-[#c5a880]/60 p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-[#c5a880]/10 glass-panel-hover"
            >
              <div>
                {/* Clean Unboxed Metadata with Typographic Separator (NO PILL BOXES) */}
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <span className="text-[#d8be98] font-medium">{post.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.publishedDate}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime}</span>
                </div>

                {/* Article Title */}
                <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#ebd8ba] transition-colors mb-3 leading-snug">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-light">
                  {post.excerpt}
                </p>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#d8be98] font-semibold">
                <span>Read Full Legal Analysis</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Full Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#09122a] border border-[#c5a880]/40 rounded-2xl p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close article"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Clean Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
              <span className="text-[#d8be98] font-semibold uppercase tracking-wider">{selectedPost.category}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedPost.publishedDate}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedPost.readTime}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">By Adv. Varun Aggarwal (LL.M)</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-6 leading-tight">
              {selectedPost.title}
            </h3>

            {/* Applicable Statutes */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Statutes:</span>
              {selectedPost.applicableLaws.map((law, idx) => (
                <span key={idx} className="text-xs text-[#d8be98] bg-[#060b18] px-2.5 py-1 rounded border border-white/10 font-mono">
                  {law}
                </span>
              ))}
            </div>

            {/* Article Paragraphs */}
            <div className="space-y-4 text-sm text-slate-200 leading-relaxed font-light mb-8">
              {selectedPost.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Key Legal Takeaways Callout */}
            <div className="p-5 rounded-xl bg-[#060b18] border border-[#c5a880]/30 mb-8">
              <h4 className="text-xs uppercase tracking-wider text-[#d8be98] font-semibold mb-3 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#c5a880]" />
                Key Strategic Takeaways
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {selectedPost.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] mt-1.5 shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Modal CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
              <span className="text-xs text-slate-400">
                Facing a similar issue? Seek tailored counsel.
              </span>

              <button
                onClick={() => {
                  setSelectedPost(null);
                  onOpenBooking();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#070d1e] bg-gradient-to-r from-[#d8be98] to-[#c5a880] rounded-lg hover:from-white hover:to-[#ebd8ba] shadow-lg transition-all"
              >
                <span>Schedule Case Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
