import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, X, Sparkles, MapPin, Phone, Mail, 
  Home, Building, GraduationCap, Globe, CheckCircle, 
  Settings, Save, Eye, Send, MessageSquare, ChevronRight
} from "lucide-react";
import Logo from "./components/Logo";

// Types
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface Content {
  hero: { title: string; subtitle: string };
  services: Service[];
  team: TeamMember[];
  contact: { address: string; phone: string; email: string };
  testimonials: { text: string; author: string; title: string }[];
}

export default function App() {
  const [content, setContent] = useState<Content | null>(null);
  const [theme, setTheme] = useState<"luxury" | "modern">("luxury");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      setContent(data);
    } catch (error) {
      console.error("Failed to load content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContent = async (newContent: Content) => {
    try {
      await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContent),
      });
      setContent(newContent);
    } catch (error) {
      console.error("Failed to update content:", error);
    }
  };

  if (isLoading || !content) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-2xl font-serif"
        >
          ETC
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "luxury" ? "theme-luxury" : "theme-modern"} selection:bg-luxury-accent/30`}>
      <Nav 
        theme={theme} 
        setTheme={setTheme} 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
        setIsAdminModalOpen={setIsAdminModalOpen}
      />
      
      <main>
        <Hero content={content} isAdmin={isAdmin} onUpdate={handleUpdateContent} theme={theme} />
        <Services content={content} isAdmin={isAdmin} onUpdate={handleUpdateContent} theme={theme} />
        <Team content={content} isAdmin={isAdmin} onUpdate={handleUpdateContent} theme={theme} />
        <ContactForm theme={theme} />
        <Contact content={content} theme={theme} />
      </main>

      <Footer content={content} />
      
      <AIConcierge theme={theme} />

      <AdminLoginModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
        onSuccess={() => setIsAdmin(true)} 
      />

      {isAdmin && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
          <button 
            onClick={() => setIsAdmin(false)}
            className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xs shadow-xl uppercase tracking-widest"
          >
            Logout Admin
          </button>
          <div className="bg-luxury-accent text-slate-950 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-xl animate-pulse">
            <Settings size={18} /> ADMIN MODE
          </div>
        </div>
      )}

      {/* Hidden trigger for admin login: Ctrl + Shift + A */}
      <AdminTrigger onTrigger={() => setIsAdminModalOpen(true)} />
    </div>
  );
}

function AdminTrigger({ onTrigger }: { onTrigger: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        onTrigger();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTrigger]);
  return null;
}

function AdminLoginModal({ isOpen, onClose, onSuccess }: any) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
        setCode("");
        setError("");
      } else {
        setError("Invalid access code");
      }
    } catch (err) {
      setError("System error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-luxury-accent/30 p-8 rounded-3xl w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-white">Admin Protocol</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-50 block mb-2">Access Key</label>
            <input 
              type="password"
              autoFocus
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-1 focus:ring-luxury-accent outline-none text-white"
              placeholder="Enter secret code..."
            />
          </div>
          {error && <div className="text-red-400 text-xs">{error}</div>}
          <button 
            type="submit"
            className="w-full bg-luxury-accent text-slate-950 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform"
          >
            Authenticate
          </button>
        </form>
        <p className="text-[10px] text-center mt-6 opacity-30 italic">Unauthorized access is logged and monitored.</p>
      </motion.div>
    </div>
  );
}

// Components
function Nav({ theme, setTheme, isAdmin, setIsAdmin, setIsAdminModalOpen }: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled 
            ? "h-16 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl" 
            : "h-24 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-10">
              {['Home', 'Services', 'Team', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-xs uppercase tracking-widest font-medium opacity-60 hover:opacity-100 hover:text-luxury-accent transition-all relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-luxury-accent transition-all group-hover:w-full" />
                </a>
              ))}
            </div>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative z-50 w-12 h-12 flex flex-col items-center justify-center gap-1.5 focus:outline-none group"
            >
              <motion.span 
                animate={isMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="w-6 h-0.5 bg-current transition-colors group-hover:bg-luxury-accent"
              />
              <motion.span 
                animate={isMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                className="w-4 h-0.5 bg-current transition-colors group-hover:bg-luxury-accent self-end"
              />
              <motion.span 
                animate={isMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="w-6 h-0.5 bg-current transition-colors group-hover:bg-luxury-accent"
              />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <FullMenu 
            onClose={() => setIsMenuOpen(false)} 
            theme={theme} 
            setTheme={setTheme}
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
            setIsAdminModalOpen={setIsAdminModalOpen}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function FullMenu({ onClose, theme, setTheme, isAdmin, setIsAdmin, setIsAdminModalOpen }: any) {
  const menuItems = [
    { title: "Home", subtitle: "Return to beginning", icon: Home },
    { title: "Services", subtitle: "What we offer", icon: Building },
    { title: "Team", subtitle: "Cultural bridge", icon: GraduationCap },
    { title: "Life in Kuwait", subtitle: "Local insights", icon: Globe },
    { title: "Contact", subtitle: "Get in touch", icon: Mail },
  ];

  return (
    <motion.div
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 100 }}
      className="fixed inset-0 z-[60] bg-slate-950 text-white flex flex-col overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#c5a059_0%,transparent_50%)]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_80%_70%,#c5a059_0%,transparent_50%)]" />
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col justify-center relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-4">
            {menuItems.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                className="group cursor-pointer"
                onClick={onClose}
              >
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-mono text-luxury-accent/50 group-hover:text-luxury-accent transition-colors">0{idx + 1}</span>
                  <div className="relative overflow-hidden">
                    <h2 className="text-5xl md:text-7xl font-serif font-bold group-hover:text-luxury-accent group-hover:translate-x-4 transition-all duration-500">
                      {item.title}
                    </h2>
                  </div>
                </div>
                <p className="ml-16 text-sm uppercase tracking-widest opacity-30 mt-2 group-hover:opacity-60 group-hover:translate-x-4 transition-all duration-500">
                  {item.subtitle}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="hidden lg:block space-y-12 border-l border-white/5 pl-20">
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.3em] text-luxury-accent font-bold">Preferences</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setTheme(theme === "luxury" ? "modern" : "luxury")}
                  className="flex flex-col gap-4 p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-luxury-accent/30 transition-all text-left"
                >
                  <Settings className="text-luxury-accent" size={24} />
                  <div>
                    <div className="text-sm font-bold">Aesthetic Architecture</div>
                    <div className="text-[10px] opacity-40 uppercase mt-1">{theme === 'luxury' ? 'Midnight Luxury' : 'Nordic Clarity'}</div>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    if (isAdmin) {
                      setIsAdmin(false);
                    } else {
                      setIsAdminModalOpen(true);
                      onClose();
                    }
                  }}
                  className={`flex flex-col gap-4 p-6 rounded-2xl border transition-all text-left ${isAdmin ? "bg-luxury-accent text-slate-950 border-luxury-accent" : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-luxury-accent/30"}`}
                >
                  <Eye className={isAdmin ? "text-slate-950" : "text-luxury-accent"} size={24} />
                  <div>
                    <div className="text-sm font-bold">{isAdmin ? 'Sign Out' : 'Admin Login'}</div>
                    <div className="text-[10px] opacity-40 uppercase mt-1">{isAdmin ? 'Live Session Active' : 'Restricted Access'}</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.3em] text-luxury-accent font-bold">Relocation Expert</h3>
              <div className="flex gap-6 items-center p-6 rounded-2xl bg-luxury-accent/5 border border-luxury-accent/10">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" 
                  className="w-16 h-16 rounded-xl object-cover grayscale"
                  alt="Reem Taka"
                />
                <div>
                  <div className="font-serif text-lg">Reem Taka</div>
                  <div className="text-xs opacity-50">German-Iraqi Cultural Bridge</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-12 border-t border-white/5 bg-slate-950/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] uppercase tracking-[0.5em] opacity-30">
          <div>ETC / KUWAIT / 2026</div>
          <div className="flex gap-10">
            <a href="#" className="hover:text-luxury-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-luxury-accent transition-colors">Digital Identity</a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Hero({ content, isAdmin, onUpdate, theme }: any) {
  const updateTitle = (val: string) => onUpdate({ ...content, hero: { ...content.hero, title: val } });
  const updateSubtitle = (val: string) => onUpdate({ ...content, hero: { ...content.hero, subtitle: val } });
  const updateImage = (val: string) => onUpdate({ ...content, hero: { ...content.hero, image: val } });

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 ${theme === 'luxury' ? 'bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950' : 'bg-gradient-to-b from-white via-white/80 to-slate-50'}`} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-luxury-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <EditableText 
            value={content.hero.title} 
            onChange={updateTitle} 
            isAdmin={isAdmin}
            className="text-6xl md:text-8xl font-serif mb-8 leading-[1.1]"
            as="h1"
          />
          <EditableText 
            value={content.hero.subtitle} 
            onChange={updateSubtitle} 
            isAdmin={isAdmin}
            className="text-lg md:text-xl opacity-70 mb-10 max-w-xl leading-relaxed"
          />
          <div className="flex flex-wrap gap-4">
            <button className={`${theme === 'luxury' ? 'bg-luxury-accent text-slate-950' : 'bg-slate-900 text-white'} px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform`}>
              Explore Services <ChevronRight size={18} />
            </button>
            <button className="border border-white/20 px-8 py-4 rounded-full font-medium hover:bg-white/5 transition-colors">
              Talk to AI Concierge
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative aspect-square lg:aspect-auto h-[600px] rounded-3xl overflow-hidden shadow-2xl"
        >
          <EditableImage 
            src={content.hero.image || "https://images.unsplash.com/photo-1540910419892-f0c962a5836d?auto=format&fit=crop&q=80&w=1200"} 
            alt="Kuwait Skyline"
            isAdmin={isAdmin}
            onChange={updateImage}
            className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}

function Services({ content, isAdmin, onUpdate, theme }: any) {
  const icons: any = { Home, Building, GraduationCap, Globe, CheckCircle };

  const updateService = (id: string, field: string, value: string) => {
    const nextServices = content.services.map((s: Service) => 
      s.id === id ? { ...s, [field]: value } : s
    );
    onUpdate({ ...content, services: nextServices });
  };

  return (
    <section id="services" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl mb-6">Our Services</h2>
          <div className="w-24 h-1 bg-luxury-accent" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.services.map((service: Service, idx: number) => {
            const Icon = icons[service.icon] || Sparkles;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group p-8 rounded-3xl border border-white/5 ${theme === 'luxury' ? 'bg-slate-900/50' : 'bg-slate-50'} hover:border-luxury-accent/30 transition-all duration-300 shadow-sm`}
              >
                <div className="w-16 h-16 rounded-2xl bg-luxury-accent/10 flex items-center justify-center text-luxury-accent mb-8 group-hover:scale-110 transition-transform">
                  <Icon size={32} />
                </div>
                <EditableText 
                  value={service.title} 
                  onChange={(val) => updateService(service.id, 'title', val)} 
                  isAdmin={isAdmin}
                  className="text-2xl mb-4"
                  as="h3"
                />
                <EditableText 
                  value={service.description} 
                  onChange={(val) => updateService(service.id, 'description', val)} 
                  isAdmin={isAdmin}
                  className="opacity-70 leading-relaxed"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Team({ content, isAdmin, onUpdate, theme }: any) {
  const updateMember = (index: number, field: string, value: string) => {
    const nextTeam = [...content.team];
    nextTeam[index] = { ...nextTeam[index], [field]: value };
    onUpdate({ ...content, team: nextTeam });
  };

  return (
    <section id="team" className={`py-32 px-6 ${theme === 'luxury' ? 'bg-slate-950/50' : 'bg-slate-100'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1">
            <h2 className="text-4xl md:text-5xl mb-8">The Cultural Bridge</h2>
            <p className="text-lg opacity-70 mb-10 leading-relaxed">
              Our team brings a wealth of industry expertise and local knowledge to facilitate your transition to Kuwait.
            </p>
            <div className="p-8 rounded-3xl border border-luxury-accent/20 bg-luxury-accent/5 italic opacity-90">
              "{content.testimonials[0].text}"
              <div className="mt-4 font-bold not-italic">{content.testimonials[0].author}</div>
              <div className="text-sm opacity-60 not-italic">{content.testimonials[0].title}</div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-12">
            {content.team.map((member: TeamMember, idx: number) => (
              <motion.div 
                key={member.name}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="w-48 h-48 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-all">
                  <EditableImage 
                    src={member.image} 
                    alt={member.name} 
                    isAdmin={isAdmin}
                    onChange={(val) => updateMember(idx, 'image', val)}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <EditableText 
                    value={member.name} 
                    onChange={(val) => updateMember(idx, 'name', val)} 
                    isAdmin={isAdmin}
                    className="text-3xl mb-1"
                    as="h3"
                  />
                  <EditableText 
                    value={member.role} 
                    onChange={(val) => updateMember(idx, 'role', val)} 
                    isAdmin={isAdmin}
                    className="text-luxury-accent font-medium uppercase tracking-widest text-sm mb-4"
                  />
                  <EditableText 
                    value={member.bio} 
                    onChange={(val) => updateMember(idx, 'bio', val)} 
                    isAdmin={isAdmin}
                    className="opacity-70 leading-relaxed max-w-2xl"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact({ content, theme }: any) {
  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-luxury-accent/10 flex items-center justify-center text-luxury-accent">
            <MapPin size={24} />
          </div>
          <div>
            <div className="font-bold mb-2 uppercase tracking-tight text-sm">Location</div>
            <div className="opacity-70">{content.contact.address}</div>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-luxury-accent/10 flex items-center justify-center text-luxury-accent">
            <Phone size={24} />
          </div>
          <div>
            <div className="font-bold mb-2 uppercase tracking-tight text-sm">Call Us</div>
            <div className="opacity-70">{content.contact.phone}</div>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-luxury-accent/10 flex items-center justify-center text-luxury-accent">
            <Mail size={24} />
          </div>
          <div>
            <div className="font-bold mb-2 uppercase tracking-tight text-sm">Email</div>
            <div className="opacity-70">{content.contact.email}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ content }: any) {
  return (
    <footer className="py-12 px-6 border-t border-white/5 opacity-50 text-xs tracking-widest uppercase">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>ETC Relocation Company © 2026</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-luxury-accent">Privacy</a>
          <a href="#" className="hover:text-luxury-accent">Terms</a>
        </div>
      </div>
    </footer>
  );
}

function AIConcierge({ theme }: { theme: "luxury" | "modern" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Welcome to ETC Relocation. I'm your AI Concierge. How can I assist with your move to Kuwait today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", text: "Connection error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "Tell me about Babel Restaurant",
    "How are the schools in Kuwait?",
    "Best way to find an apartment?",
    "Cultural norms for expats"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`absolute bottom-20 right-0 w-[400px] h-[600px] ${theme === 'luxury' ? 'bg-slate-900 border-luxury-accent/30' : 'bg-white border-slate-200'} border rounded-3xl shadow-2xl flex flex-col overflow-hidden`}
          >
            <div className={`p-6 border-b ${theme === 'luxury' ? 'border-white/10 bg-luxury-accent/5' : 'border-slate-100 bg-slate-50'} flex justify-between items-center`}>
              <div>
                <div className="font-serif font-bold text-lg">AI Concierge</div>
                <div className="text-[10px] uppercase tracking-widest opacity-50">24/7 Expert Support</div>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-luxury-accent text-slate-950 rounded-tr-none' 
                      : (theme === 'luxury' ? 'bg-white/5 rounded-tl-none' : 'bg-slate-100 rounded-tl-none')
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none animate-pulse text-xs">Concierge is typing...</div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 space-y-4">
              <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
                {suggestions.map(s => (
                  <button 
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-[10px] whitespace-nowrap px-3 py-1.5 rounded-full border border-white/10 hover:border-luxury-accent/50 transition-colors opacity-70 hover:opacity-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about Kuwait, schooling, clinics..." 
                  className={`flex-1 ${theme === 'luxury' ? 'bg-white/5' : 'bg-slate-50'} border-none rounded-2xl px-4 py-3 text-sm focus:ring-1 focus:ring-luxury-accent outline-none`}
                />
                <button 
                  onClick={() => handleSend()}
                  className="w-12 h-12 bg-luxury-accent text-slate-950 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 ${theme === 'luxury' ? 'bg-luxury-accent text-slate-950' : 'bg-slate-900 text-white'} rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}

function ContactForm({ theme }: { theme: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1500);
  };

  return (
    <section id="contact-us" className="py-32 px-6 bg-slate-950/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-serif mb-6">Start Your Journey</h2>
          <p className="opacity-60">Whether you're moving yourself, your family, or your entire team, we're here to make it effortless.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className={`p-8 md:p-12 rounded-3xl border border-white/5 ${theme === 'luxury' ? 'bg-slate-900 shadow-2xl' : 'bg-white shadow-xl'}`}
        >
          {status === 'sent' ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-luxury-accent/20 text-luxury-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-serif mb-2">Message Received</h3>
              <p className="opacity-60">A relocation expert will contact you within 2 hours.</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-8 text-luxury-accent uppercase tracking-widest text-xs font-bold hover:underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold block mb-2">Full Name</label>
                  <input required type="text" className="w-full bg-slate-500/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-1 focus:ring-luxury-accent outline-none text-white" placeholder="Ahmed Al-Fahad" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold block mb-2">Email Identity</label>
                  <input required type="email" className="w-full bg-slate-500/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-1 focus:ring-luxury-accent outline-none text-white" placeholder="relocation@etc.com" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold block mb-2">Phone Structure</label>
                  <input type="tel" className="w-full bg-slate-500/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-1 focus:ring-luxury-accent outline-none text-white" placeholder="+965 9XXX XXXX" />
                </div>
              </div>
              <div className="space-y-6 flex flex-col">
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold block mb-2">Relocation Requirements</label>
                  <textarea required className="w-full h-full bg-slate-500/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-1 focus:ring-luxury-accent outline-none resize-none" placeholder="Briefly describe your needs..." />
                </div>
                <button 
                  disabled={status === 'sending'}
                  className="w-full bg-luxury-accent text-slate-950 py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {status === 'sending' ? 'Transmitting...' : 'Initialize Consultation'} <ChevronRight size={16} />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function EditableText({ value, onChange, isAdmin, className, as = "p" }: any) {
  const Component = as;
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value);

  if (!isAdmin) return <Component className={className}>{value}</Component>;

  if (editing) {
    return (
      <div className="relative inline-block w-full">
        <textarea
          autoFocus
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          onBlur={() => {
            setEditing(false);
            onChange(localVal);
          }}
          className={`${className} outline-none border-b-2 border-luxury-accent bg-transparent w-full resize-none`}
          rows={3}
        />
      </div>
    );
  }

  return (
    <div 
      className={`${className} cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-luxury-accent/50 relative group`}
      onClick={() => setEditing(true)}
    >
      {value}
      <div className="absolute -top-6 right-0 text-[10px] bg-luxury-accent text-slate-950 px-1 rounded opacity-0 group-hover:opacity-100 uppercase font-bold">Edit</div>
    </div>
  );
}

function EditableImage({ src, alt, isAdmin, onChange, className }: any) {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState(src);

  if (!isAdmin) return <img src={src} alt={alt} className={className} />;

  return (
    <div className={`relative group ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <button 
          onClick={() => setEditing(true)}
          className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
        >
          Replace Image
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-0 left-0 w-full p-4 z-20"
          >
            <div className="bg-slate-900 border border-luxury-accent shadow-2xl p-4 rounded-2xl flex flex-col gap-4">
              <input 
                autoFocus
                value={localVal}
                onChange={e => setLocalVal(e.target.value)}
                placeholder="Enter Unsplash URL..."
                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-[10px] outline-none text-white"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    onChange(localVal);
                    setEditing(false);
                  }}
                  className="flex-1 bg-luxury-accent text-slate-950 py-2 rounded-lg font-bold text-[10px] uppercase"
                >
                  Apply
                </button>
                <button 
                  onClick={() => {
                    setEditing(false);
                    setLocalVal(src);
                  }}
                  className="px-3 bg-white/10 text-white rounded-lg font-bold text-[10px] uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

