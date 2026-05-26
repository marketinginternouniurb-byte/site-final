import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 140, damping: 14 }}
      className="fixed bottom-5 right-3 z-50 flex items-end gap-2 sm:bottom-6 sm:right-6 sm:gap-3"
    >
      <div className="mb-16 hidden max-w-[230px] rounded-2xl rounded-br-sm border border-[#FFD700]/35 bg-[#123AAA] px-4 py-3 text-white shadow-2xl shadow-black/25 sm:block">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFD700]">
          lotti
        </p>
        <p className="text-xs font-bold leading-snug">
          E aí, pronto pra encontrar o seu lote ideal?
        </p>
      </div>

      <motion.a
        href="https://wa.me/552728880001"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="group flex items-end gap-0"
        aria-label="Conversar com o UniBot pelo WhatsApp"
      >
        <motion.img
          src="/mascote-universal.png"
          alt="Mascote UniBot da Universal Urbanismo"
          initial={{ y: 0 }}
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="-mr-4 h-24 w-auto max-w-[92px] origin-bottom object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.32)] transition-transform duration-300 group-hover:-translate-y-1 sm:-mr-5 sm:h-36 sm:max-w-[138px]"
          loading="lazy"
          decoding="async"
        />

        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/40 ring-4 ring-white transition group-hover:bg-green-600 sm:h-16 sm:w-16">
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-[#FFD700]" />
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
        </span>
      </motion.a>
    </motion.div>
  );
}
