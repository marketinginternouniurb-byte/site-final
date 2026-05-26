import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SectionHeader from "../shared/SectionHeader";
import { fmtDate } from "@/lib/format";

export default function BlogPreview() {
  const { data: posts = [] } = useQuery({
    queryKey: ["public-blog-preview"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
  });

  if (posts.length === 0) return null;

  return (
    <section className="py-24 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <SectionHeader
            label="Blog & Notícias"
            title="Fique por Dentro do Mercado"
            subtitle="Dicas, tendências e novidades do universo imobiliário capixaba."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              {post.image && (
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {post.category && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-secondary text-xs font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                  )}
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="w-3.5 h-3.5" /> {post.published_at ? fmtDate(post.published_at) : ""}
                </div>
                <h3 className="font-poppins font-bold text-lg text-foreground mb-2 leading-snug group-hover:text-secondary transition">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-secondary font-semibold text-sm">
                  Leia mais <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
