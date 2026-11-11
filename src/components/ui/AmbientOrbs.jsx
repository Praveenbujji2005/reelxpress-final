// Ambient organic background orbs creating subtle warm dusk glow
// Optimized for iOS WebKit GPU compositing: zero contain:paint, lightweight mobile fallback
export default function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full max-w-full" aria-hidden="true">
      {/* Mobile-optimized static gradients: zero heavy blur filters, zero GPU tile memory explosion */}
      <div className="md:hidden absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,109,41,0.12),transparent_70%),radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(255,109,41,0.06),transparent_70%),radial-gradient(ellipse_70%_40%_at_50%_100%,rgba(255,109,41,0.08),transparent_70%)]" />

      {/* Desktop rich ambient floating orbs */}
      <div className="hidden md:block absolute inset-0 overflow-hidden">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] h-[800px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff6d29]/10 via-[#2e1c15]/08 to-transparent blur-[110px] animate-orb-1" />
        <div className="absolute top-[8%] -right-[10%] w-[min(700px,90vw)] h-[700px] rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#ff6d29]/06 via-[#352018]/08 to-transparent blur-[110px] animate-orb-2" />
        <div className="absolute top-[20%] -left-[10%] w-[min(850px,90vw)] h-[850px] rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#ff6d29]/08 via-[#2e1c15]/08 to-transparent blur-[110px] animate-orb-3" />
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[min(900px,100vw)] h-[750px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ffb599]/05 via-[#ff6d29]/06 to-transparent blur-[110px] animate-orb-1" />
        <div className="absolute top-[46%] -right-[12%] w-[min(950px,90vw)] h-[950px] rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#ff6d29]/08 via-[#2e1c15]/08 to-transparent blur-[110px] animate-orb-2" />
        <div className="absolute top-[62%] -left-[8%] w-[min(850px,90vw)] h-[850px] rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#ff6d29]/07 via-[#352018]/08 to-transparent blur-[110px] animate-orb-3" />
        <div className="absolute top-[74%] right-[5%] w-[min(850px,90vw)] h-[850px] rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#ffb599]/05 via-[#ff6d29]/06 to-transparent blur-[110px] animate-orb-1" />
        <div className="absolute top-[85%] left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] h-[850px] rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#ff6d29]/08 via-[#2e1c15]/08 to-transparent blur-[110px] animate-orb-1" />
      </div>
    </div>
  );
}
