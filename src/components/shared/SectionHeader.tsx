import { motion } from "framer-motion";

interface Props {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export default function SectionHeader({ label, title, subtitle, align = "center" }: Props) {
  const alignClass = align === "left" ? "text-left" : "text-center mx-auto";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`max-w-3xl mb-12 ${alignClass}`}
    >
      {label && (
        <span className="inline-block px-4 py-1.5 bg-primary/15 text-secondary font-semibold text-xs tracking-widest uppercase rounded-full mb-4">
          {label}
        </span>
      )}
      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">{title}</h2>
      {subtitle && <p className="text-lg text-muted-foreground leading-relaxed">{subtitle}</p>}
    </motion.div>
  );
}
