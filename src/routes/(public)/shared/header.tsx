import { Shield } from "lucide-react";

const Header = () => {
  return (
    <div className="w-full max-w-[1400px] px-1.5 bg-black mx-auto">
      {/* BRAND HEADER BAR */}
      <div className="bg-stone-900 text-stone-100 px-6 py-6 border-b-[6px] border-stone-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-400 text-stone-950 font-mono text-[9px] font-black tracking-widest px-2 py-0.5 uppercase border border-stone-950">
              CORE SYSTEM MODULE 01
            </span>
            <span className="font-mono text-[10px] text-stone-400">
              CLASSIC EDITORIAL DIVISION
            </span>
          </div>
          <h1 className="font-sans font-black text-3xl md:text-4xl uppercase tracking-tighter leading-none text-white">
            OPERATIONS & CLIENT LIFE CYCLE
          </h1>
          <p className="font-mono text-zinc-400 text-[11px] mt-1 max-w-xl">
            Clean, Spacious Swiss-designed business manager. Unified
            single-column sections preserve extreme text readability.
          </p>
        </div>

        {/* Dynamic RBAC Badge widget */}
        <div className="bg-stone-800 border-2 border-stone-700 p-3 flex items-center gap-3">
          <Shield className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="font-mono text-[10px] space-y-0.5">
            <div className="text-stone-300 font-bold uppercase">
              SECURITY PRIVILEGE:
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span className="text-white font-extrabold uppercase">
                ADMIN/USER LEVEL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SWISS BUSINESS STATS METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-b-[6px] border-stone-900 bg-white">
        <div className="p-6 border-stone-900 md:border-r-[6px] flex flex-col justify-between">
          <span className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
            CONTRACT PORTFOLIOS
          </span>
          <span className="font-sans font-black text-4xl block mt-2">
            99 Active
          </span>
          <span className="font-mono text-[10px] text-stone-400 mt-2">
            Validated business references
          </span>
        </div>
        <div className="p-6 border-stone-900 md:border-r-[6px] flex flex-col justify-between">
          <span className="font-mono text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            PAID BUSINESS VOLUME
          </span>
          <span className="font-sans font-black text-4xl text-emerald-600 block mt-2">
            $999
          </span>
          <span className="font-mono text-[10px] text-stone-400 mt-2">
            Settled cash-in transaction logs
          </span>
        </div>
        <div className="p-6 border-stone-900 md:border-r-[6px] flex flex-col justify-between bg-amber-50/40">
          <span className="font-mono text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            OUTSTANDING REMITTANCE
          </span>
          <span className="font-sans font-black text-4xl text-amber-600 block mt-2">
            $999
          </span>
          <span className="font-mono text-[10px] text-stone-400 mt-2">
            Awaiting wire clearing schedules
          </span>
        </div>
        <div className="p-6 flex flex-col justify-between bg-rose-50/40">
          <span className="font-mono text-[10px] font-bold text-red-600 uppercase tracking-wider block">
            OVERDUE DECEIT GAP
          </span>
          <span className="font-sans font-black text-4xl text-red-500 block mt-2">
            $999
          </span>
          <span className="font-mono text-[10px] text-red-400 mt-2">
            Active escalations targeted
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
