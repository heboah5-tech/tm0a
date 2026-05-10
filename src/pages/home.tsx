"use client"
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Menu,
  MessageCircle,
  Lightbulb,
  Star,
  Shield,
  Users,
  CheckCircle,
  Heart,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  Sparkles,
  Award,
  Clock,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function Page() {
  const router = useRouter()
  const redirectToStart = () => {
    router.replace('/home-new')
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/70">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="/Bcare-logo.svg"
                alt="BeCare"
                className="h-9 sm:h-10 w-auto"
              />
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">مرخصة من البنك المركزي</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#0a4a68]/70 hover:bg-[#0a4a68]/5 hover:text-[#0a4a68] transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
              <button className="w-10 h-10 rounded-full text-[#0a4a68] hover:bg-[#0a4a68]/5 transition-colors flex items-center justify-center">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#062f44] via-[#0a4a68] to-[#1c7396]" />
        <div className="absolute inset-0 opacity-[0.18]">
          <div className="absolute inset-0 bg-[url('/bg.svg')] bg-cover bg-right" />
          <div className="absolute inset-0 bg-[url('/ledt.svg')] bg-cover bg-left" />
        </div>
        {/* Glow orbs */}
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[480px] h-[480px] rounded-full bg-cyan-300/15 blur-3xl" />

        <div className="relative container mx-auto px-4 sm:px-6 pt-20 pb-28 md:pt-28 md:pb-36">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.12 } },
            }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-xs sm:text-sm font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-300" />
              <span>منصة التأمين الذكية الأولى في المملكة</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-[1.15] tracking-tight"
            >
              <span className="block">خطوات أمنة نحو</span>
              <span className="block bg-gradient-to-l from-orange-300 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                مستقبل آمن
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-white/80"
            >
              قدمت شركة بي كير منذ الأزمان ولعدة عقود وإنجازات
              <br className="hidden sm:block" />
              تاريخية والقابلية العالية في الريادة والمجتمعات
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={redirectToStart}
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-l from-orange-500 to-amber-500 text-white font-bold text-base sm:text-lg rounded-full transition-all duration-300 shadow-[0_15px_35px_-10px_rgba(251,146,60,0.6)] hover:shadow-[0_20px_40px_-10px_rgba(251,146,60,0.8)] hover:-translate-y-0.5"
              >
                <span>ابدأ الآن</span>
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </button>
              <a
                href="tel:920010050"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-white/90 font-semibold rounded-full border border-white/25 hover:bg-white/10 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span dir="ltr">920 010 050</span>
              </a>
            </motion.div>

            {/* Trust pills */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-14 grid grid-cols-3 gap-4 sm:gap-6 max-w-xl mx-auto"
            >
              {[
                { icon: Shield, k: "+10", label: "سنوات خبرة" },
                { icon: Users, k: "+200K", label: "عميل سعيد" },
                { icon: Award, k: "24/7", label: "دعم فوري" },
              ].map(({ icon: Icon, k, label }, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 px-3 py-4 text-center"
                >
                  <Icon className="w-5 h-5 mx-auto mb-2 text-orange-300" />
                  <div className="text-xl sm:text-2xl font-extrabold text-white">{k}</div>
                  <div className="text-[10px] sm:text-xs text-white/70 mt-1">{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Wave separator */}
        <svg
          className="absolute bottom-0 left-0 w-full h-12 sm:h-16 text-[#f7f9fc]"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path d="M0,30 C360,90 1080,-30 1440,30 L1440,60 L0,60 Z" fill="currentColor" />
        </svg>
      </section>

      {/* About Section */}
      <section className="py-20 md:py-28 bg-[#f7f9fc]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <span className="inline-block text-xs font-bold tracking-widest text-orange-500 uppercase mb-3">
                من نحن
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a4a68] mb-4">عن بي كير</h2>
              <div className="w-20 h-1.5 bg-gradient-to-l from-orange-400 to-amber-500 mx-auto rounded-full" />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="relative bg-white p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_-25px_rgba(10,74,104,0.25)] border border-slate-100 mb-8"
            >
              <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0a4a68] to-[#1e7a9e] flex items-center justify-center text-white shadow-lg shadow-[#0a4a68]/20">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-lg md:text-xl leading-loose text-slate-700 text-center max-w-3xl mx-auto pt-4">
                تقدمت شركة بي كير منذ عام 2014 وحتى الآن بأفضل الخدمات التي تهدف إلى المساعدة في الحفاظ على الصحة
                والوقاية من الأمراض وتحقيق أفضل مستوى من الرعاية الطبية والصحية
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                {
                  icon: Award,
                  title: "خبرة موثوقة",
                  text: "تعتمد الشركة على خبراء ومتخصصين في المجال الطبي والصحي مع أحدث التقنيات والأساليب المبتكرة لتقديم خدمات عالية الجودة تلبي احتياجات عملائنا في المجال الصحي وتوفر لهم أفضل مستوى من الرعاية",
                },
                {
                  icon: Heart,
                  title: "حلول صحية شاملة",
                  text: "نسعى في بي كير لأن نكون الخيار الأمثل للأفراد والمؤسسات الباحثة عن حلول صحية شاملة ومتكاملة، ونعمل جاهدين على تطوير خدماتنا بشكل مستمر لضمان تقديم أفضل النتائج والخدمات لعملائنا",
                },
              ].map(({ icon: Icon, title, text }, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group bg-white p-7 rounded-2xl border border-slate-200/70 hover:border-[#0a4a68]/20 hover:shadow-xl hover:shadow-[#0a4a68]/5 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0a4a68] mb-3">{title}</h3>
                  <p className="leading-relaxed text-slate-600 text-right">{text}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden bg-gradient-to-l from-[#0a4a68] to-[#1e7a9e] p-8 md:p-10 rounded-3xl text-white"
            >
              <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-orange-400/20 blur-3xl" />
              <div className="relative flex items-start gap-5">
                <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/15 border border-white/20 items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-orange-300" />
                </div>
                <p className="leading-loose text-white/95 text-lg">
                  مع بي كير، أنت في أيدٍ أمينة. نحن نؤمن بأن الصحة هي أغلى ما يملك الإنسان، ولذلك نعمل بكل جهدنا لتوفير
                  أفضل الحلول الصحية المبتكرة والمتطورة التي تساعد على الحفاظ على صحتك وصحة عائلتك
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white via-[#f7f9fc] to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center mb-14"
          >
            <span className="inline-block text-xs font-bold tracking-widest text-orange-500 uppercase mb-3">
              ما يحركنا
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a4a68] mb-4">رسالتنا ورؤيتنا وقيمنا</h2>
            <div className="w-20 h-1.5 bg-gradient-to-l from-orange-400 to-amber-500 mx-auto rounded-full" />
          </motion.div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {/* Mission */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="group relative bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_40px_-20px_rgba(10,74,104,0.15)] hover:shadow-[0_20px_50px_-20px_rgba(10,74,104,0.3)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute top-0 right-8 -translate-y-1/2 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a4a68] to-[#1e7a9e] flex items-center justify-center shadow-lg shadow-[#0a4a68]/30">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="pt-6">
                <h3 className="text-xl font-extrabold text-[#0a4a68] mb-3">رسالة الشركة</h3>
                <p className="text-slate-600 leading-relaxed">
                  رعاية صحية بجودة وشفافية من خلال خدمات ومنصات ذكية
                </p>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative bg-white rounded-3xl p-8 border border-orange-200/80 shadow-[0_10px_40px_-20px_rgba(251,146,60,0.25)] hover:shadow-[0_20px_50px_-20px_rgba(251,146,60,0.45)] hover:-translate-y-1 transition-all duration-300 md:scale-[1.03] md:-mt-2"
            >
              <div className="absolute top-0 right-8 -translate-y-1/2 w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <div className="pt-6">
                <h3 className="text-xl font-extrabold text-[#0a4a68] mb-3">رؤيتنا</h3>
                <p className="text-slate-600 leading-relaxed">
                  تقديم خدمة صحية متميزة للأفراد والمؤسسات والمساهمة في تطوير منظومة الصحية المتكاملة وتحقيق هدف أمة
                  الصحة للشركة
                </p>
              </div>
            </motion.div>

            {/* Values */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_40px_-20px_rgba(10,74,104,0.15)] hover:shadow-[0_20px_50px_-20px_rgba(10,74,104,0.3)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute top-0 right-8 -translate-y-1/2 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-[#0a4a68] flex items-center justify-center shadow-lg shadow-[#0a4a68]/30">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div className="pt-6">
                <h3 className="text-xl font-extrabold text-[#0a4a68] mb-5">قيمنا</h3>
                <ul className="space-y-3">
                  {[
                    { icon: Shield, label: "الهوية والإبتكار" },
                    { icon: Heart, label: "ارتباط بالمجتمع والمسؤولية الاجتماعية" },
                    { icon: CheckCircle, label: "الجودة والتميز" },
                    { icon: Users, label: "الشفافية والمصداقية" },
                  ].map(({ icon: Icon, label }, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0a4a68]/10 to-[#0a4a68]/5 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[#0a4a68]" />
                      </span>
                      <span className="text-slate-700 text-sm">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="container mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#062f44] via-[#0a4a68] to-[#1c7396] p-8 md:p-12"
        >
          <div className="absolute -top-20 left-10 w-72 h-72 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="absolute -bottom-20 right-10 w-72 h-72 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                ابدأ رحلتك مع بي كير اليوم
              </h3>
              <p className="text-white/75 text-base md:text-lg">
                احصل على عرض تأمينك في دقائق — بدون تعقيد، بدون انتظار
              </p>
            </div>
            <button
              onClick={redirectToStart}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0a4a68] font-extrabold text-base rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all whitespace-nowrap"
            >
              <span>ابدأ الآن</span>
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#062f44] text-white pt-16 pb-8 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute inset-0 bg-[url('/sa-map-grey.svg')] bg-no-repeat bg-center bg-contain" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-10 mb-12 text-right">
              {/* Brand */}
              <div>
                <div className="mb-4 inline-flex items-center bg-white/95 rounded-2xl px-4 py-3 shadow-lg">
                  <img src="/Bcare-logo.svg" alt="BeCare" className="h-10 w-auto" />
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  منصة التأمين الذكية الأولى في المملكة العربية السعودية. حلول تأمين شاملة وموثوقة لكل أسرة سعودية.
                </p>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-sm font-extrabold mb-5 tracking-wide text-orange-300 uppercase">تواصل معنا</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="tel:920010050" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </span>
                      <span dir="ltr" className="font-bold">920 010 050</span>
                    </a>
                  </li>
                  <li>
                    <a href="mailto:info@bcare.com.sa" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </span>
                      <span>info@bcare.com.sa</span>
                    </a>
                  </li>
                  <li className="flex items-start gap-3 text-white/80">
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <span className="leading-relaxed">
                      طريق الملك عبدالله - الرياض - المملكة العربية السعودية
                      <br />
                      المملكة العربية السعودية
                      <br />
                      12345 الرياض
                    </span>
                  </li>
                </ul>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-sm font-extrabold mb-5 tracking-wide text-orange-300 uppercase">روابط سريعة</h4>
                <ul className="space-y-2.5 text-sm">
                  {[
                    "الشروط والأحكام",
                    "سياسة الخصوصية",
                    "قواعد ومنهج العمل",
                    "شروط وطرق الدفع",
                  ].map((label, i) => (
                    <li key={i}>
                      <a href="#" className="text-white/75 hover:text-orange-300 transition-colors inline-flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-orange-300/60 group-hover:bg-orange-300 transition-colors" />
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Social + copyright */}
            <div className="pt-8 border-t border-white/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/50">جميع الحقوق محفوظة لشركة بي كير 2025©</p>
              <div className="flex items-center gap-2">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-orange-500 border border-white/10 hover:border-orange-500 flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
