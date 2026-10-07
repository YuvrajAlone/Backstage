import { Link } from "react-router";
import { Target, Coffee, Users, Check } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

const FEATURES = [
  {
    icon: Target,
    title: "Premium Snooker Tables",
    text: "Precision-kept tables designed for every frame.",
    tone: "text-[#4F8A70]",
    ring: "bg-[#4F8A70]/8 border-[#4F8A70]/30",
  },
  {
    icon: Coffee,
    title: "Café",
    text: "A relaxed space for great drinks, good food, and longer evenings.",
    tone: "text-[#B87555]",
    ring: "bg-[#B87555]/8 border-[#B87555]/30",
  },
  {
    icon: Users,
    title: "Friendly Vibe",
    text: "A place to enjoy the game together.",
    tone: "text-[#71869A]",
    ring: "bg-[#71869A]/8 border-[#71869A]/30",
  },
];

function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-12.5 items-center justify-center rounded-full">
        <Link to="/">
          <img src="/clublogo.png" alt="" />
        </Link>
      </div>
      <div className="leading-tight">
        <p
          className={`font-display ${compact ? "text-lg" : "text-xl"} font-bold text-white/80`}
        >
          Backstage Snooker Club <span className="text-gold">&amp;</span> Café
        </p>
        <p className="text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
          Play • Eat • Relax
        </p>
      </div>
    </div>
  );
}

function PrimaryButton({ children, className = "" }) {
  return (
    <button
      type="button"
      className={`w-fit min-h-11 inline-flex text-[#F5F2EA] items-center justify-center gap-2 rounded-4xl bg-[#6F5630]/70 px-5 text-sm font-semibold transition-all duration-300 hover:bg-[#6F5630]/70 ${className}`}
    >
      {children}
    </button>
  );
}

const CHECKLIST = [
  "2 Premium Snooker Tables",
  "Cozy Café with Great Food & Drinks",
  "Clean, Modern & Comfortable Ambience",
];

function InfoRow({ label, value, children }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
        {label}
      </p>

      <p className="mt-1 text-zinc-400">{children || value}</p>
    </div>
  );
}

function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Brand compact />
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src="/hero-lounge.jpg"
          alt="Premium snooker club interior with warm lighting"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-background/60" />

        <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 pb-24 pt-10 sm:px-6 sm:py-32 lg:min-h-[86vh] lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="mt-6 font-display text-4xl leading-[1.05] font-bold sm:text-6xl lg:text-7xl">
              Where Every Frame
              <br />
              <span className="text-gold/50">Matters</span>
            </h1>
            <p className="mt-3 max-w-lg text-base text-muted-foreground sm:text-lg">
              Premium snooker, great food & drinks,
              <br />
              and a space to enjoy it all.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton className="w-fit px-8">
                <Link to="/signup">Sign Up</Link>
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-border/60 bg-[#0b1210]/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:gap-8 lg:px-8 lg:py-16">
          {FEATURES.map(({ icon: Icon, title, text, tone, ring }) => (
            <div key={title} className="group flex flex-col items-start gap-4">
              <div
                className={`flex size-12 items-center justify-center rounded-full border ${ring} transition-transform duration-300 group-hover:-translate-y-1`}
              >
                <Icon className={`size-5 ${tone}`} />
              </div>
              <div>
                <h3 className="text-base font-semibold sm:text-lg">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="relative isolate overflow-hidden mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <img
          src="/balls.jpg"
          alt="Premium snooker balls"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-background via-background/90 to-background/50" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-background/60" />

        <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="mt-6 font-display text-3xl font-bold sm:text-5xl">
              What <span className="text-gold/50">We Offer</span>
            </h2>
            <p className="mt-5 max-w-xl text-[#D0CAC0]">
              Whether you're here for a serious game of snooker, a casual
              hangout, or just a great meal — we've got you covered.
            </p>
            <ul className="mt-8 space-y-4">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[#B87555]/40 bg-[#B87555]/10">
                    <Check className="size-3.5 text-[#C98A68]" />
                  </span>
                  <span className="text-sm p-1 text-[#D8D2C8] sm:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CAFÉ */}
      <section className="border-t border-border/60 bg-[#0b1210]/40">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2">
              <h2 className="mt-6 font-display text-3xl font-bold sm:text-5xl">
                Refuel Between <span className="text-gold/50">Frames.</span>
              </h2>
              <p className="mt-5 max-w-xl text-muted-foreground">
                Good food, great drinks, and a relaxed break before the next
                frame.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="px-5 py-5 sm:py-28 bg-[#0b1210]/40">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-white/10 bg-[#0b1210] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
              About Us
            </p>

            <div className="mt-8 space-y-5 ">
              <InfoRow label="Owner" value="Afyaz Khan" />

              <InfoRow
                label="Address"
                value="Opp. Axis Bank, Behind Nasir Khan's Office,Ballarpur"
              />

              <InfoRow label="Hours" value="11:00 AM — 11:00 PM" />

              <InfoRow label="Phone" value="+91 9356896541, 7498389426" />

              <div className="flex items-center gap-5 justify-center pt-2">
                <a
                  href="https://www.instagram.com/backstagesnooker_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-zinc-500 transition-colors hover:text-white"
                >
                  <FaInstagram size={30} />
                </a>

                <a
                  href="https://chat.whatsapp.com/KkpMgXPGB7oCBz95fGhD07"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="text-zinc-500 transition-colors hover:text-white"
                >
                  <FaWhatsapp size={30} />
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-linear-to-br bg-[#0b1210] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                Player Area
              </p>

              <h3 className="mt-4 text-3xl font-bold text-white/70">
                Track what you owe.
              </h3>

              <p className="mt-3 text-zinc-400 leading-relaxed">
                Players can sign in and check their own payment history and
                current balance.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="h-12 px-5 rounded-xl bg-white/50 text-black font-semibold flex items-center justify-center"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="h-12 px-5 rounded-xl border border-white/10 text-white font-semibold flex items-center justify-center"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-5 py-8 bg-[#0b1210]/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">Backstage Snooker Club & Café</p>
            <p className="text-xs text-zinc-600 mt-1">
              Snooker • Café • Good Times
            </p>
          </div>

          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Backstage. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
