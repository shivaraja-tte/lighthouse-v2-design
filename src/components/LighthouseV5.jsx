import { useState, useEffect, useRef } from "react";

// LIGHTHOUSE v5 — ITERATION 3
// Dashboard: 2 program cards (no progress bars)
// Program: Hero → Centers → Exercises
// Proctored: Immersive pre-check page with consent → sys check → launch

export default function LighthouseScrolly() {
  const [dk, setDk] = useState(false);
  const [designMode, setDesignMode] = useState("scrolly"); // "scrolly"|"bento"|"editorial"|"notion"|"m3"
  const [primaryColor, setPrimaryColor] = useState("#002C77"); // brand primary — drives navy
  const [accentColor, setAccentColor] = useState("#008575"); // brand accent — drives teal
  const [pg, setPg] = useState("dash");
  const [sbOpen, setSbOpen] = useState(true);
  const [sbHidden, setSbHidden] = useState(false); // fully hides sidebar
  const [mob, setMob] = useState(false);
  const [notif, setNotif] = useState(false);
  const [prof, setProf] = useState(false);
  const [langO, setLangO] = useState(false);
  const [selLang, setSelLang] = useState("EN");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatMsgs, setChatMsgs] = useState([{from:"bot",text:"Hi Kshitij! How can I help you today?"}]);

  // Program state
  const [selProgram, setSelProgram] = useState(null);
  const [consentGiven, setConsentGiven] = useState({}); // {programId: true}
  const [videoWatched, setVideoWatched] = useState({}); // {programId: true}
  const [instrOpen, setInstrOpen] = useState(false); // inline instructions panel on tasks page

  // Pre-check flow (immersive proctored page)
  const [checkTarget, setCheckTarget] = useState(null); // {id, name, type:"assessment"|"center"}
  const [preCheckConsent, setPreCheckConsent] = useState(false);
  const [checks, setChecks] = useState({});
  const [running, setRunning] = useState(false);
  const [checksDone, setChecksDone] = useState(false);

  // Center detail
  const [selCenter, setSelCenter] = useState(null);

  // Video Assessment flow
  const [vaStep, setVaStep] = useState("journey"); // journey|syscheck|ready|question|complete
  const [vaSysChecks, setVaSysChecks] = useState({internet:null,device:null,camera:null,mic:null});
  const [vaSysIdx, setVaSysIdx] = useState(-1);
  const [vaCurQ, setVaCurQ] = useState(0);
  const [vaRecording, setVaRecording] = useState(false);
  const [vaRecTime, setVaRecTime] = useState(0);
  const [vaAnswers, setVaAnswers] = useState({});
  const [vaTimer, setVaTimer] = useState(35*60);
  const [vaTimerActive, setVaTimerActive] = useState(false);
  const [vaPrepCount, setVaPrepCount] = useState(0);

  // Hero banner
  const [heroCompact, setHeroCompact] = useState(false);

  // IDP Development Flow
  const [idpOpen, setIdpOpen] = useState(false);
  const [idpStep, setIdpStep] = useState(0); // 0=intro,1=skillgap,2=chat,3=summary,4=loading,5=plan
  const [chatMsgsIdp, setChatMsgsIdp] = useState([]);
  const [chatQ, setChatQ] = useState(0); // current question index in chat
  const [chatInput, setChatInput] = useState("");
  const [chatTyping, setChatTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loadProgress, setLoadProgress] = useState(0);

  // IDP Plan management
  const [planSkills, setPlanSkills] = useState(null); // null = not generated yet
  const [planExpanded, setPlanExpanded] = useState(null); // expanded skill index
  const [planTipExpanded, setPlanTipExpanded] = useState(null); // expanded tip id for AI insights
  const [planModal, setPlanModal] = useState(null); // "addSkill"|"addTip"|"aiGen"|"library"|"submit"|null
  const [planModalSkill, setPlanModalSkill] = useState(null); // skill index for add tip
  const [planEditing, setPlanEditing] = useState(true);
  const [planExpandAll, setPlanExpandAll] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReference, setShowReference] = useState(false); // skill gap + chat summary panel
  const [planStatus, setPlanStatus] = useState("draft"); // "draft"|"under-review"|"approved"
  const [planComments, setPlanComments] = useState({
    "skill-0":[{from:"manager",name:"Sarah Chen",text:"Great focus area. I'd prioritize the cross-functional initiative — there's an opportunity with the Q3 product launch.",ts:"Feb 18"},{from:"user",name:"Kshitij",text:"That makes sense. I'll align this with the product launch timeline.",ts:"Feb 19"},{from:"manager",name:"Sarah Chen",text:"Perfect. Let's sync on this in our next 1:1.",ts:"Feb 19"}],
    "t1":[{from:"manager",name:"Sarah Chen",text:"Suggest partnering with Ops team on the data migration project — perfect opportunity.",ts:"Feb 18"},{from:"user",name:"Kshitij",text:"Good call — I've already been talking to Priya about this. Will formalize it.",ts:"Feb 19"}],
    "t5":[{from:"manager",name:"Sarah Chen",text:"I can connect you with our L&D team to fast-track enrollment.",ts:"Feb 19"},{from:"user",name:"Kshitij",text:"That would be great, thanks! I'll reach out this week.",ts:"Feb 20"},{from:"manager",name:"Sarah Chen",text:"Done — Maria from L&D will email you by Thursday.",ts:"Feb 20"}],
    "skill-1":[{from:"manager",name:"Sarah Chen",text:"This is your biggest growth lever. Let's discuss delegation candidates in our next 1:1.",ts:"Feb 18"},{from:"user",name:"Kshitij",text:"Agreed. I've been thinking about giving Arjun the analytics dashboard project.",ts:"Feb 19"},{from:"manager",name:"Sarah Chen",text:"Arjun's a great choice. He's ready for that stretch.",ts:"Feb 19"}],
    "t4":[{from:"user",name:"Kshitij",text:"Should I start with delegation before or after the coaching sessions begin?",ts:"Feb 20"},{from:"manager",name:"Sarah Chen",text:"Start delegating now — the coaching will reinforce what you learn from the experience.",ts:"Feb 21"}],
    "t7":[{from:"manager",name:"Sarah Chen",text:"I've been doing a decision journal for 2 years — happy to share my template.",ts:"Feb 20"},{from:"user",name:"Kshitij",text:"Yes please! That would save me setup time.",ts:"Feb 21"}],
  });
  const [commentDraft, setCommentDraft] = useState({});
  const [tipProgress, setTipProgress] = useState({}); // {tipId: {start, end, pct}}
  const [tipOpen, setTipOpen] = useState({}); // {skillIdx: tipId} — which tip is expanded per skill
  const [idpSettingsOpen, setIdpSettingsOpen] = useState(false);

  // Scheduling state
  const [schedView, setSchedView] = useState(null); // null=list | centerId
  const [bookedSlots, setBookedSlots] = useState({}); // {slotId: true}
  const [schedConfirm, setSchedConfirm] = useState(null); // slot being confirmed
  const [schedCancel, setSchedCancel] = useState(null); // slot being cancelled
  const [schedCalView, setSchedCalView] = useState(false); // false=list, true=calendar
  const [schedCalMonth, setSchedCalMonth] = useState(2); // 0-indexed month (2=March)

  const mainRef = useRef(null);

  useEffect(() => { if (mainRef.current) mainRef.current.scrollTop = 0; }, [pg, selProgram, checkTarget]);
  useEffect(() => {
    const c = () => { if (window.innerWidth < 769) setSbOpen(false); };
    c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c);
  }, []);
  useEffect(() => {
    const h = () => { setNotif(false); setProf(false); setLangO(false); };
    window.addEventListener("click", h); return () => window.removeEventListener("click", h);
  }, []);

  // Video assessment timer effects
  useEffect(() => { if (!vaTimerActive || vaTimer<=0) return; const t=setInterval(()=>setVaTimer(p=>p>0?p-1:0),1000); return ()=>clearInterval(t); }, [vaTimerActive,vaTimer]);
  useEffect(() => { if (!vaRecording) return; const t=setInterval(()=>setVaRecTime(p=>p+1),1000); return ()=>clearInterval(t); }, [vaRecording]);
  useEffect(() => { if (vaPrepCount<=0) return; const t=setTimeout(()=>setVaPrepCount(p=>p-1),1000); return ()=>clearTimeout(t); }, [vaPrepCount]);

  const vaQuestions = [
    {id:0,title:"Introduction",prompt:"Introduce yourself — your name, current role, and what excites you about leadership.",prepTime:30,maxRecord:120,
      context:"Helps assessors understand your background and communication style.",tips:["Keep it 60–90 seconds","Mention one key achievement","Show enthusiasm"],
      keyPoints:["Name & role","What drives you","Brief career context"],competency:"Communication",difficulty:"Warm-up"},
    {id:1,title:"Critical Decision",prompt:"Describe a time you made a difficult decision with incomplete information. What happened?",prepTime:30,maxRecord:180,
      context:"Assesses your ability to operate under uncertainty and own outcomes.",tips:["Use the STAR method","Be specific about missing info","Explain your reasoning"],
      keyPoints:["Situation & constraints","Decision process","Outcome & learning"],competency:"Decision Making",difficulty:"Medium"},
    {id:2,title:"Team Conflict",prompt:"Tell us about resolving a disagreement between team members.",prepTime:30,maxRecord:180,
      context:"Evaluates interpersonal skills, empathy, and team dynamics navigation.",tips:["Show you listened to both sides","Describe your framework","Highlight team outcome"],
      keyPoints:["Nature of conflict","Mediation approach","Resolution & impact"],competency:"Team Development",difficulty:"Medium"},
    {id:3,title:"Strategic Thinking",prompt:"Walk us through evaluating a new market opportunity for a product.",prepTime:30,maxRecord:180,
      context:"Shows structured, analytical thinking and how you break down ambiguity.",tips:["Start with your framework","Discuss data sources","Balance quant and qual"],
      keyPoints:["Evaluation framework","Key metrics","Decision criteria"],competency:"Strategic Thinking",difficulty:"Hard"},
    {id:4,title:"Self-Reflection",prompt:"What leadership skill are you actively improving, and what steps are you taking?",prepTime:30,maxRecord:120,
      context:"Self-awareness and growth mindset are key leadership indicators.",tips:["Be genuine","Describe concrete actions","Connect to career goals"],
      keyPoints:["The skill","Actions taken","Expected impact"],competency:"Self-Awareness",difficulty:"Medium"},
  ];

  const vaFmt = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  const vaStartSysCheck = () => {
    setVaSysIdx(0);
    ["internet","device","camera","mic"].forEach((c,i) => {
      setTimeout(()=>{setVaSysChecks(p=>({...p,[c]:"checking"}));setVaSysIdx(i);},i*2000);
      setTimeout(()=>setVaSysChecks(p=>({...p,[c]:"pass"})),i*2000+1500);
    });
    setTimeout(()=>setVaSysIdx(4),8000);
  };

  const vaStartAssess = () => {
    setVaStep("question"); setVaCurQ(0); setVaAnswers({}); setVaTimer(35*60); setVaTimerActive(true); setVaPrepCount(vaQuestions[0].prepTime);
  };

  const vaStartRec = () => { setVaRecording(true); setVaRecTime(0); };
  const vaStopRec = () => { setVaRecording(false); setVaAnswers(p=>({...p,[vaCurQ]:true})); };
  const vaNextQ = () => {
    if (vaCurQ<vaQuestions.length-1) { const n=vaCurQ+1; setVaCurQ(n); setVaRecording(false); setVaRecTime(0); setVaPrepCount(vaQuestions[n].prepTime); }
    else { setVaStep("complete"); setVaTimerActive(false); }
  };
  const openVideoAssess = () => {
    setPg("videoassess"); setVaStep("journey"); setVaSysChecks({internet:null,device:null,camera:null,mic:null}); setVaSysIdx(-1);
    setVaCurQ(0); setVaRecording(false); setVaRecTime(0); setVaAnswers({}); setVaPrepCount(0);
  };

  // ═══════════ BRAND + DESIGN TOKENS ═══════════
  const navy = primaryColor, teal = accentColor, purple = "#7B61FF";
  const colorPresets = [
    {label:"Lighthouse",navy:"#002C77",teal:"#008575"},
    {label:"Ocean",navy:"#0F4C81",teal:"#00B4D8"},
    {label:"Midnight",navy:"#1B1464",teal:"#6C63FF"},
    {label:"Forest",navy:"#1B4332",teal:"#52B788"},
    {label:"Crimson",navy:"#8B0000",teal:"#D4A017"},
    {label:"Slate",navy:"#334155",teal:"#F59E0B"},
    {label:"Plum",navy:"#581C87",teal:"#E879F9"},
    {label:"Espresso",navy:"#3E2723",teal:"#A1887F"},
    {label:"Teal",navy:"#004D40",teal:"#00BFA5"},
    {label:"Rose",navy:"#880E4F",teal:"#F06292"},
    {label:"Charcoal",navy:"#212121",teal:"#FF6D00"},
    {label:"Nordic",navy:"#1A237E",teal:"#80DEEA"},
  ];

  // Mode-dependent surface colors
  const isS = designMode==="scrolly", isB = designMode==="bento", isE = designMode==="editorial", isN = designMode==="notion", isM = designMode==="m3";
  const bg = {editorial:dk?"#0C0F1A":"#FAFAFA",notion:dk?"#191919":"#FFFFFF",m3:dk?"#1C1B1F":"#FFFBFE",bento:dk?"#0C0F1A":"#F4F5F7"}[designMode]||(dk?"#0c1220":"#fafbfc");
  const bg2 = {editorial:dk?"#151a28":"#F0F0F0",notion:dk?"#252525":"#F7F6F3",m3:dk?"#2B2930":"#F3EDF7"}[designMode]||(dk?"#111a2b":"#EEF6FA");
  const sbBg = {editorial:dk?"#0f1724":"#F5F5F5",notion:dk?"#202020":"#F7F6F3",m3:dk?"#1C1B1F":"#FFFBFE"}[designMode]||(dk?"#0f1724":"#f2f6f9");
  const card = {notion:dk?"#2C2C2C":"#FFFFFF",m3:dk?"#2B2930":"#FFFBFE"}[designMode]||(dk?"#141e30":"#ffffff");
  const tx = dk ? "#e8eef6" : "#0f1a2e";
  const ts = dk ? "#96a8be" : "#3d5070";
  const tm = dk ? "#748da6" : "#6b7f96";
  const navyBg = dk ? `${navy}22` : `${navy}0D`;
  const tealBg = dk ? `${teal}24` : `${teal}14`;
  const purpleBg = dk ? "rgba(123,97,255,.16)" : "rgba(123,97,255,.08)";
  const green = "#1a8a42", red = "#c5303f", orange = "#c96d10", warn = "#c98a00";

  // Typography
  // Typography — editorial uses same font but with distinct sizing/spacing (matching v4)
  const f = "'DM Sans',sans-serif";
  const fh = "'DM Sans',sans-serif";
  const fb = "'DM Sans',sans-serif";

  // Geometry
  const cr = isB?20:isE?4:isN?8:isM?16:14;       // card radius
  const br = isB?12:isE?4:isN?6:isM?24:10;        // button radius
  const sr = isB?14:isE?4:isN?6:isM?12:10;         // small element radius
  const ir = isB?10:isE?3:isN?6:isM?20:8;          // input radius
  const mr = isB?20:isE?4:isN?8:isM?20:16;         // modal radius
  const csh = isM?`0 1px 3px rgba(0,0,0,.08),0 4px 12px rgba(0,0,0,.04)`:isB?`0 1px 4px rgba(0,0,0,.03)`:"none";
  const bsh = isM?`0 2px 8px ${navy}15`:"none";
  const bd = {editorial:dk?"rgba(255,255,255,.05)":"rgba(0,0,0,.08)",notion:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",m3:dk?"rgba(255,255,255,.08)":"rgba(0,0,0,.03)"}[designMode]||(dk?"rgba(255,255,255,.07)":`${navy}0D`);
  const bdw = isB?"1.5px":"1px";

  // Editorial: content-first separators, not cards
  const eSep = isE ? {borderTop:`1px solid ${bd}`,paddingTop:24,marginBottom:32} : {};
  // Notion: subtle hover, left-accent
  const nHov = isN ? (dk?"rgba(255,255,255,.04)":"#F7F7F5") : bg2;
  const nAccent = isN ? `3px solid ${teal}` : "none";

  const mLabel = {scrolly:"Scrollytelling",bento:"Bento Grid",editorial:"Editorial",notion:"Notion / Block",m3:"Material 3"};

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    @keyframes tfade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes tspin{to{transform:rotate(360deg)}}
    .an{animation:tfade .4s ease both}.an2{animation:tfade .4s ease .08s both}.an3{animation:tfade .4s ease .16s both}.an4{animation:tfade .4s ease .24s both}.td{animation:tfade .2s ease both}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${dk?"rgba(255,255,255,.08)":`${navy}14`};border-radius:3px}
    *:focus-visible{outline:2px solid ${teal};outline-offset:2px;border-radius:${ir}px}
    .skip-link{position:absolute;top:-60px;left:8px;background:${navy};color:#fff;padding:8px 16px;border-radius:8px;z-index:10000;font-size:14px;font-weight:700;text-decoration:none}.skip-link:focus{top:8px}
    @media(max-width:768px){.t-m{display:block!important}}
    @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
    button,a{min-height:34px}
  `;

  // ═══════════ ICONS ═══════════
  const I={
    Home:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    Book:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    Cal:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Bell:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    Gear:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    Down:()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
    Check:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    Arrow:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    Back:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    Menu:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    Collapse:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="11 17 6 12 11 7"/><line x1="18" y1="12" x2="6" y2="12"/></svg>,
    Expand:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="13 7 18 12 13 17"/><line x1="6" y1="12" x2="18" y2="12"/></svg>,
    Moon:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
    Sun:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/></svg>,
    Globe:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/></svg>,
    Out:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    Clock:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    Clip:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    Chart:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    Monitor:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    Wifi:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    Cam:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    Mic:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>,
    Upload:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    Spin:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:"tspin 1s linear infinite"}}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>,
    Lock:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    Play:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polygon points="5 3 19 12 5 21" fill="currentColor"/></svg>,
    FileText:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    X:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    Help:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    ChevR:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
    Info:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    Download:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    Eye:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    Shield:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Users:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    Bulb:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg>,
    Target:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    Rocket:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 3 0 3 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-3 0-3"/></svg>,
    Layers:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 2 7 12 12 22 7"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    Ext:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
    Plus:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Flag:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    Msg:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    Gear:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    Sun:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    Moon:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
    Globe:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  };

  // ═══════════ SHARED COMPONENTS ═══════════

  const Btn = ({children, primary, secondary, small, disabled, onClick, style:s}) => (
    <button onClick={disabled?undefined:onClick} disabled={disabled} aria-disabled={disabled||undefined}
      style={{padding:small?"7px 14px":"12px 24px",minHeight:small?32:44,borderRadius:br,
        border:disabled?`${bdw} solid ${tm}40`:primary||secondary?"none":isM?"none":isN?`${bdw} solid ${bd}`:`${bdw} solid ${bd}`,
        background:disabled?"transparent":primary?navy:secondary?teal:isM?(dk?"rgba(255,255,255,.04)":`${navy}0A`):isN?(dk?"rgba(255,255,255,.04)":"#F3F3F3"):"transparent",
        color:disabled?tm:primary||secondary?"#fff":tx,fontWeight:isE?600:700,fontSize:small?12:14,
        cursor:disabled?"not-allowed":"pointer",fontFamily:fb,display:"inline-flex",alignItems:"center",gap:6,
        opacity:disabled?.5:1,boxShadow:primary&&!disabled?`0 4px 12px ${navy}18`:bsh,transition:"all .2s",
        letterSpacing:isE?".02em":"0",...s}}>
      {children}
    </button>
  );

  const ProgressBar = ({pct, color, height=6}) => (
    <div style={{width:"100%",height,background:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",borderRadius:height/2,overflow:"hidden"}}>
      <div style={{width:`${Math.max(pct,2)}%`,height:"100%",background:color||navy,borderRadius:height/2,transition:"width .5s ease"}}/>
    </div>
  );

  const BackBtn = ({onClick, label="Back"}) => (
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:6,color:ts,fontSize:13,fontWeight:600,fontFamily:f,background:"none",border:"none",cursor:"pointer",padding:"4px 0",marginBottom:16}}>
      <I.Back/> {label}
    </button>
  );

  // ═══════════ PROGRAM DATA ═══════════

  const programs = {
    leadership: {
      id:"leadership",icon:"chart",accent:navy,name:"Leadership Assessment 2026",status:"progress",due:"Mar 5, 2026",daysLeft:12,pct:35,
      desc:"Comprehensive leadership evaluation across strategic thinking, influence, and team development competencies.",
      video:"https://picsum.photos/seed/video-assessment/640/360",
      instructions:[
        "This program includes individual exercises and Assessment Centers (live, multi-phase simulations with assessors).",
        "Some exercises must be completed in order (sequential). Others can be taken at any time.",
        "Timed exercises cannot be paused once started. Ensure a quiet, distraction-free environment.",
        "Proctored exercises will require a system check before launch — your camera, microphone, and internet will be tested.",
        "Your responses are confidential. Only aggregated scores are shared with your program administrator.",
        "You may retake the Thriving Index once. All other exercises are single-attempt.",
      ],
      centers:[
        {id:"sim",name:"Business Simulation Center",desc:"Strategic decision-making: market analysis, presentation, and crisis response.",time:"90 min",status:"notstarted",color:navy,proctored:true,
          activities:[
            {id:"pre",name:"Pre-work: Case Brief",desc:"Read the scenario document before the simulation.",time:"15 min",status:"complete",pct:100},
            {id:"s1",name:"Phase 1: Market Analysis",desc:"Analyze market data and identify opportunities.",time:"20 min",status:"progress",pct:60},
            {id:"s2",name:"Phase 2: Strategy Presentation",desc:"Present strategic recommendations to the panel.",time:"20 min",status:"locked",pct:0},
            {id:"s3",name:"Phase 3: Crisis Response",desc:"Handle an unexpected market disruption.",time:"20 min",status:"locked",pct:0},
          ]},
        {id:"lac",name:"Leadership Assessment Center",desc:"Group exercises, role plays, and case study presentations with live observers.",time:"120 min",status:"locked",color:purple,proctored:true,
          activities:[
            {id:"brief",name:"Participant Briefing",desc:"Welcome and orientation.",time:"10 min",status:"locked",pct:0},
            {id:"group",name:"Group Discussion",desc:"Collaborate on a business challenge.",time:"30 min",status:"locked",pct:0},
            {id:"roleplay",name:"Role Play",desc:"Navigate a stakeholder interaction.",time:"20 min",status:"locked",pct:0},
            {id:"case",name:"Case Study",desc:"Prepare and deliver a recommendation.",time:"30 min",status:"locked",pct:0},
          ]},
      ],
      seqExercises:[
        {id:"hogan",name:"Hogan Assessment",desc:"Leadership personality profiling.",time:"40 min",status:"complete",pct:100,color:purple,proctored:false,hasReport:true},
        {id:"cognitive",name:"Cognitive Ability Test",desc:"Verbal, numerical, and abstract reasoning.",time:"35 min",status:"progress",pct:30,color:navy,proctored:true,hasReport:false},
        {id:"interview",name:"Video Interview",desc:"Structured behavioural interview with AI analysis.",time:"30 min",status:"locked",pct:0,color:purple,proctored:true,hasReport:false},
      ],
      openExercises:[
        {id:"thriving",name:"Thriving Index",desc:"Measure wellbeing, resilience, and engagement.",time:"25 min",status:"complete",pct:100,color:teal,proctored:false,hasReport:true},
        {id:"self",name:"Self-Assessment Survey",desc:"Rate yourself on leadership competencies.",time:"15 min",status:"notstarted",pct:0,color:navy,proctored:false,hasReport:false},
        {id:"sjt",name:"Situational Judgement Test",desc:"Respond to realistic workplace scenarios.",time:"20 min",status:"notstarted",pct:0,color:teal,proctored:false,hasReport:false},
      ],
    },
    "360": {
      id:"360",icon:"users",accent:purple,name:"360° Perspective Feedback",status:"progress",due:"Mar 20, 2026",daysLeft:27,pct:20,
      desc:"Multi-rater feedback from peers, direct reports, and managers for a complete picture of your leadership impact.",
      video:"https://picsum.photos/seed/video-360/640/360",
      instructions:[
        "You will first complete a self-assessment rating yourself on leadership competencies.",
        "Then nominate raters — your manager, 3–5 peers, and 2–3 direct reports.",
        "Raters receive an anonymous survey. You can track response progress but not individual answers.",
        "A consolidated feedback report is generated once minimum responses are collected.",
        "Individual rater responses are never revealed — only aggregated category scores.",
      ],
      centers:[],
      seqExercises:[
        {id:"self360",name:"Self Assessment",desc:"Rate yourself on leadership competencies.",time:"15 min",status:"complete",pct:100,color:teal,proctored:false,hasReport:false},
        {id:"nominate",name:"Nominate Raters",desc:"Select manager, peers, and reports as raters.",time:"10 min",status:"progress",pct:60,color:navy,proctored:false,hasReport:false},
        {id:"track",name:"Track Responses",desc:"Monitor rater completion (min 5 needed).",time:"—",status:"locked",pct:0,color:purple,proctored:false,hasReport:false},
      ],
      openExercises:[],
    },
  };

  const curProg = selProgram ? programs[selProgram] : null;

  // Preview state for insights
  const [previewReport, setPreviewReport] = useState(null);

  // ═══════════ REPORTS DATA ═══════════

  const reports = [
    {id:"hogan-report",name:"Hogan Leadership Profile",desc:"Comprehensive personality profiling covering ambition, sociability, interpersonal sensitivity, prudence, and learning approach scales.",
      program:"leadership",assessments:["hogan"],available:true,pages:12,
      thumbnail:"https://picsum.photos/seed/report-personality/300/400"},
    {id:"thriving-report",name:"Thriving Index Report",desc:"Personal wellbeing, resilience, and engagement scores with benchmarks against your industry and role level.",
      program:"leadership",assessments:["thriving"],available:true,pages:8,
      thumbnail:"https://picsum.photos/seed/report-cognitive/300/400"},
    {id:"cognitive-report",name:"Cognitive Ability Summary",desc:"Verbal, numerical, and abstract reasoning scores with percentile rankings and development recommendations.",
      program:"leadership",assessments:["cognitive"],available:false,pages:6,
      thumbnail:"https://picsum.photos/seed/report-wellbeing/300/400"},
    {id:"integrated-report",name:"Integrated Leadership Report",desc:"Holistic view combining Hogan personality, cognitive ability, and video interview data into a single leadership potential score.",
      program:"leadership",assessments:["hogan","cognitive","interview"],available:false,pages:24,
      thumbnail:"https://picsum.photos/seed/report-simulation/300/400"},
    {id:"sim-report",name:"Business Simulation Debrief",desc:"Detailed assessor feedback on strategic thinking, communication, and crisis management performance during the simulation.",
      program:"leadership",assessments:["sim"],available:false,pages:10,
      thumbnail:"https://picsum.photos/seed/report-leadership/300/400"},
    {id:"360-report",name:"360° Feedback Report",desc:"Consolidated multi-rater feedback with self-other comparison, blind spots, and strengths across leadership competencies.",
      program:"360",assessments:["self360","nominate","track"],available:false,pages:18,
      thumbnail:"https://picsum.photos/seed/report-360/300/400"},
  ];

  // System check
  const runChecks = () => {
    setRunning(true); setChecks({});
    ["browser","internet","camera","mic","upload"].forEach((c,i) => {
      setTimeout(() => {
        setChecks(p => ({...p, [c]: c === "internet" ? "warning" : "pass"}));
        if (i === 4) { setRunning(false); setChecksDone(true); }
      }, 700*(i+1));
    });
  };

  // Navigate into a program
  const openProgram = (id) => { setSelProgram(id); setPg(consentGiven[id] ? "tasks" : "instructions"); setInstrOpen(false); };

  // Start proctored check flow
  const startPreCheck = (item, type) => {
    setCheckTarget({...item, type});
    setPreCheckConsent(false);
    setChecks({});
    setChecksDone(false);
    setRunning(false);
    setPg("precheck");
  };

  // ═══════════════════════════════════════
  //  DEVELOPMENT FLOW DATA
  // ═══════════════════════════════════════

  const idpCompetencies = [
    {label:"Strategic Thinking",score:85,color:navy,type:"behavioral"},
    {label:"Influence & Communication",score:72,color:teal,type:"behavioral"},
    {label:"Team Development",score:68,color:purple,type:"behavioral"},
    {label:"Resilience",score:91,color:green,type:"behavioral"},
    {label:"Decision Making",score:76,color:navy,type:"behavioral"},
    {label:"Data & Analytics",score:64,color:teal,type:"technical"},
    {label:"Product & Platform Fluency",score:70,color:purple,type:"technical"},
  ];

  const chatQuestions = [
    {q:"What do you enjoy most about your current role?", suggestions:["Strategic planning and big-picture thinking","Leading and mentoring my team","Solving complex problems","Cross-functional collaboration","Building stakeholder relationships"]},
    {q:"What aspects of your role do you find most challenging or less enjoyable?", suggestions:["Navigating organizational politics","Managing conflicting priorities","Difficult conversations with direct reports","Data-heavy reporting and analysis","Keeping up with rapid change"]},
    {q:"Are you looking to grow in your current role, or considering a transition?", suggestions:["Deepen expertise in my current role","Grow into a more senior leadership position","Transition to a different function","Explore a broader cross-functional scope","I'm open — help me figure it out"]},
    {q:"What skills do you feel are your strongest and most transferable?", suggestions:["Analytical thinking and problem solving","Communication and storytelling","People management and coaching","Strategic planning","Data analysis and technical tools"]},
    {q:"What skills would you most like to develop or improve?", suggestions:["Executive presence and influence","Coaching and developing others","Decision making under ambiguity","Data analytics and dashboards","Technical platform knowledge"]},
    {q:"What's your ideal timeline for this development plan?", suggestions:["3 months — focused sprint","6 months — steady progress","12 months — comprehensive growth","Flexible — I'll go at my own pace"]},
    {q:"How do you prefer to learn?", suggestions:["Online courses and videos","Reading books and articles","Hands-on practice and stretch assignments","Coaching and mentoring","Peer learning and group workshops"]},
  ];

  const chatFileStep = chatQuestions.length; // index 7 = file upload step

  const handleChatAnswer = (answer, qIdx) => {
    const newMsgs = [...chatMsgsIdp, {from:"user", text:answer}];
    setChatMsgsIdp(newMsgs);
    setUserAnswers(prev => ({...prev, [qIdx]: answer}));
    setChatInput("");
    setChatTyping(true);

    setTimeout(() => {
      setChatTyping(false);
      const nextQ = qIdx + 1;
      if (nextQ < chatQuestions.length) {
        setChatQ(nextQ);
        setChatMsgsIdp(prev => [...prev, {from:"bot", text:chatQuestions[nextQ].q}]);
      } else if (nextQ === chatFileStep) {
        setChatQ(chatFileStep);
        setChatMsgsIdp(prev => [...prev, {from:"bot", text:"Great insights! One last thing — do you have any external documents to share? These could be manager feedback, performance reviews, 360° comments, or self-assessments. They help me create a more personalized plan."}]);
      }
    }, 800);
  };

  const handleFileUpload = (name) => {
    setUploadedFiles(prev => [...prev, name]);
    setChatMsgsIdp(prev => [...prev, {from:"user", text:`📄 Uploaded: ${name}`}, {from:"bot", text:`Got it, I've received "${name}". Upload more or continue when ready.`}]);
  };

  const finishChat = () => {
    setChatMsgsIdp(prev => [...prev, {from:"bot", text:"Thank you! I now have everything I need. Let me analyze your responses and assessment data to build your personalized development plan."}]);
    setTimeout(() => setIdpStep(3), 1200);
  };

  const generatePlanData = () => {
    return [
      {
        name:"Influence & Communication",desc:"Strengthen ability to persuade, align stakeholders, and communicate with impact across organizational levels.",
        private:false, skillType:"behavioral",
        tips:[
          {id:"t1",type:"70",title:"Lead a Cross-Functional Initiative",desc:"Volunteer to lead a project spanning 2+ departments. Practice influencing without direct authority by building coalitions and aligning competing priorities.",source:"ai",startDate:"Mar 2026",endDate:"Jun 2026",
            success:"Successfully deliver cross-functional project with measurable stakeholder satisfaction improvement.",
            insight:"Your assessment showed strong analytical skills but lower scores in lateral influence. This experiential assignment directly targets that gap.",category:"experience"},
          {id:"t2",type:"20",title:"Executive Mentoring Program",desc:"Pair with a senior leader known for stakeholder management excellence. Shadow their key meetings and debrief on influence strategies used.",source:"library",startDate:"Mar 2026",endDate:"Aug 2026",
            success:"Complete 6 mentoring sessions with documented learnings and at least 2 strategies applied in own work.",
            insight:"You mentioned wanting to grow into a more senior role. Learning from executives who've mastered influence accelerates this path.",category:"social"},
          {id:"t3",type:"10",title:"Stakeholder Influence Masterclass",desc:"Build techniques for persuading and aligning diverse stakeholders across organizational levels.",source:"library",startDate:"Apr 2026",endDate:"Apr 2026",
            success:"Complete course and apply RACI framework to at least one active project.",
            insight:"Based on your preference for structured learning and online courses, this highly-rated program fits your style.",
            category:"course",courseImg:"https://picsum.photos/seed/course-strategy/320/180",courseLink:"https://coursera.org",provider:"Coursera",duration:"4 hrs",seats:23},
        ]
      },
      {
        name:"Team Development",desc:"Build capability in coaching, delegating, and developing team members to reach their full potential.",
        private:false, skillType:"behavioral",
        tips:[
          {id:"t4",type:"70",title:"Delegate a High-Visibility Deliverable",desc:"Identify a key deliverable you normally own and delegate it fully to a direct report. Provide coaching support but resist taking it back.",source:"ai",startDate:"Mar 2026",endDate:"May 2026",
            success:"Direct report delivers the project independently with quality meeting or exceeding standards.",
            insight:"Deliberate delegation builds the team while freeing your capacity for strategic work. Your chat preferences indicated a desire to grow coaching skills.",category:"experience"},
          {id:"t5",type:"20",title:"Coaching Skills for Leaders",desc:"Structured coaching program with Internal L&D focused on active listening, powerful questions, and development conversations.",source:"library",startDate:"Apr 2026",endDate:"Jul 2026",
            success:"Complete all 6 coaching sessions and demonstrate measurable improvement in 360° feedback on coaching behaviors.",
            insight:"This internal program was selected because you indicated interest in hands-on practice and peer learning formats.",
            category:"course",courseImg:"https://picsum.photos/seed/course-leadership/320/180",courseLink:"#",provider:"Internal L&D",duration:"6 sessions",seats:8},
          {id:"t6",type:"10",title:"Radical Candor — Kim Scott",desc:"Framework for caring personally while challenging directly. Learn the practical methodology for giving feedback that drives growth.",source:"ai",startDate:"Apr 2026",endDate:"May 2026",
            success:"Read and apply the SBI feedback model in at least 3 development conversations with direct reports.",
            insight:"Reading complements your experiential learning. This book directly addresses the feedback skills gap identified in your assessment.",category:"reading"},
        ]
      },
      {
        name:"Decision Making",desc:"Improve speed and quality of decisions under ambiguity, and strengthen stakeholder buy-in on tough calls.",
        private:false, skillType:"behavioral",
        tips:[
          {id:"t7",type:"70",title:"Decision Journal Practice",desc:"Document key decisions weekly: the context, options considered, reasoning, assumptions, and expected outcomes. Review monthly to identify patterns.",source:"ai",startDate:"Mar 2026",endDate:"Aug 2026",
            success:"Maintain journal for 6 months with monthly review entries showing bias pattern identification.",
            insight:"Journaling builds metacognition. Your analytical strengths make you well-suited for this reflective practice.",category:"experience"},
          {id:"t8",type:"20",title:"Peer Decision Review Circle",desc:"Form a small group of 3–4 peers to present real decisions monthly. Get diverse perspectives before committing to major calls.",source:"ai",startDate:"Apr 2026",endDate:"Aug 2026",
            success:"Participate in 5 peer review sessions and apply feedback to at least 2 real decisions.",
            insight:"You indicated enjoying cross-functional collaboration. This social learning format leverages that preference.",category:"social"},
          {id:"t9",type:"10",title:"Data-Driven Decision Making",desc:"Frameworks for combining quantitative analysis with qualitative judgment in complex situations. Case-study intensive.",source:"library",startDate:"May 2026",endDate:"Jun 2026",
            success:"Complete certification and present a case study application to your team.",
            insight:"This HBS program matches your analytical strengths and preference for structured online learning.",
            category:"course",courseImg:"https://picsum.photos/seed/course-analytics/320/180",courseLink:"https://hbs.edu",provider:"HBS Online",duration:"6 hrs",seats:15},
        ]
      },
      {
        name:"Data & Analytics",desc:"Develop proficiency in data visualization, dashboard design, and using analytics platforms to drive product and business decisions.",
        private:false, skillType:"technical",
        tips:[
          {id:"t10",type:"70",title:"Build a Live Product Dashboard",desc:"Design and ship a real-time dashboard tracking key product metrics (adoption, engagement, NPS) using your team's analytics stack. Present insights to leadership monthly.",source:"ai",startDate:"Mar 2026",endDate:"Jun 2026",
            success:"Dashboard adopted by team with 3+ stakeholders using it weekly for decision-making.",
            insight:"Your assessment showed strong strategic thinking but a gap in translating data into actionable visuals. Hands-on dashboard building closes this gap fast.",category:"experience"},
          {id:"t11",type:"20",title:"Analytics Community of Practice",desc:"Join or start a cross-team analytics CoP. Share techniques, review each other's dashboards, and learn advanced SQL/visualization patterns from data engineers.",source:"ai",startDate:"Apr 2026",endDate:"Aug 2026",
            success:"Attend 6 sessions and contribute at least 2 dashboard templates or analysis frameworks to the group.",
            insight:"Social learning with data practitioners accelerates technical fluency faster than solo study.",category:"social"},
          {id:"t12",type:"10",title:"Google Analytics & Looker Certification",desc:"Structured certification covering data collection, reporting, and dashboard creation in Google's analytics ecosystem.",source:"library",startDate:"Apr 2026",endDate:"May 2026",
            success:"Pass certification exam and apply learnings to at least one product analytics workflow.",
            insight:"Certification provides structured foundations. Your preference for online learning makes this a natural fit.",
            category:"course",courseImg:"https://picsum.photos/seed/course-data/320/180",courseLink:"https://grow.google",provider:"Google",duration:"8 hrs",seats:null},
        ]
      },
      {
        name:"Product & Platform Architecture",desc:"Deepen understanding of platform architecture, API design patterns, and technical trade-offs to bridge PM-engineering communication and make better technical decisions.",
        private:false, skillType:"technical",
        tips:[
          {id:"t13",type:"70",title:"Co-Design a Technical Spec",desc:"Partner with a senior engineer to co-author a technical design document for an upcoming feature. Attend architecture reviews and contribute to trade-off discussions.",source:"ai",startDate:"Mar 2026",endDate:"May 2026",
            success:"Co-authored spec approved by architecture review board with your contributions cited in trade-off analysis.",
            insight:"Your platform management role requires stronger technical fluency. Co-authoring specs builds this while strengthening engineering relationships.",category:"experience"},
          {id:"t14",type:"20",title:"Engineering Pair Sessions",desc:"Schedule bi-weekly pair sessions with engineers working on your platform. Observe code reviews, deployment processes, and debugging workflows to build technical empathy.",source:"ai",startDate:"Apr 2026",endDate:"Jul 2026",
            success:"Complete 8 pair sessions covering frontend, backend, and infrastructure. Document key learnings in a PM technical playbook.",
            insight:"Pairing sessions build the shared language needed for your GTM & AI Solutions PM role bridging product and engineering.",category:"social"},
          {id:"t15",type:"10",title:"System Design for Product Managers",desc:"Intensive course covering APIs, microservices, databases, and scalability patterns — tailored for non-engineers making technical product decisions.",source:"library",startDate:"May 2026",endDate:"Jun 2026",
            success:"Complete course and apply system design framework to evaluate one platform architecture decision.",
            insight:"This fills the technical vocabulary gap identified in your assessment, enabling more effective platform management conversations.",
            category:"course",courseImg:"https://picsum.photos/seed/course-platform/320/180",courseLink:"https://educative.io",provider:"Educative",duration:"10 hrs",seats:null},
        ]
      },
    ];
  };

  const startIdpGeneration = () => {
    setIdpStep(4);
    setLoadProgress(0);
    setPlanStatus("draft");
    setPlanEditing(true);
    const steps = [12, 28, 45, 62, 78, 90, 100];
    steps.forEach((p, i) => {
      setTimeout(() => setLoadProgress(p), 700 * (i + 1));
    });
    setTimeout(() => { setPlanSkills(generatePlanData()); setIdpStep(5); }, 5600);
  };

  // Skill library for "Add Skill" modal
  const skillLibrary = {
    behavioral:[
      {name:"Emotional Intelligence",desc:"Recognize and manage own emotions and those of others.",skillType:"behavioral"},
      {name:"Conflict Resolution",desc:"Navigate and resolve interpersonal and team conflicts constructively.",skillType:"behavioral"},
      {name:"Adaptability",desc:"Adjust approach effectively in response to changing circumstances.",skillType:"behavioral"},
      {name:"Executive Presence",desc:"Project confidence, credibility, and composure in senior settings.",skillType:"behavioral"},
    ],
    technical:[
      {name:"Data Analytics",desc:"Leverage data tools and methods to drive evidence-based decisions.",skillType:"technical"},
      {name:"Financial Acumen",desc:"Understand financial statements, budgets, and business metrics.",skillType:"technical"},
      {name:"Digital Fluency",desc:"Navigate emerging technologies and digital transformation tools.",skillType:"technical"},
      {name:"Project Management",desc:"Plan, execute, and close projects using structured methodologies.",skillType:"technical"},
    ],
    other:[
      {name:"Work-Life Balance",desc:"Build sustainable work habits and personal resilience.",skillType:"behavioral"},
      {name:"Personal Branding",desc:"Develop and communicate a compelling professional identity.",skillType:"behavioral"},
      {name:"Networking",desc:"Build and maintain strategic professional relationships.",skillType:"behavioral"},
      {name:"Public Speaking",desc:"Deliver compelling presentations to diverse audiences.",skillType:"behavioral"},
    ]
  };

  // AI-generated tip suggestions for "Generate with AI" modal
  const aiTipSuggestions = (skillName) => [
    {id:"ai1",type:"70",title:`Apply ${skillName} in a Stretch Project`,desc:`Take on a challenging assignment that forces you to practice ${skillName.toLowerCase()} in a real-world context.`,source:"ai",category:"experience"},
    {id:"ai2",type:"70",title:`Shadow a Senior Leader`,desc:`Observe how an experienced leader demonstrates ${skillName.toLowerCase()} and debrief after key meetings.`,source:"ai",category:"experience"},
    {id:"ai3",type:"20",title:`Join a Peer Learning Group`,desc:`Form or join a group focused on ${skillName.toLowerCase()}. Share challenges and strategies bi-weekly.`,source:"ai",category:"social"},
    {id:"ai4",type:"20",title:`Find a Mentor in ${skillName}`,desc:`Connect with someone known for excellence in this area for monthly coaching conversations.`,source:"ai",category:"social"},
    {id:"ai5",type:"10",title:`Online Certification: ${skillName}`,desc:`Complete a structured certification program to build foundational and advanced ${skillName.toLowerCase()} skills.`,source:"library",category:"course",duration:"8 hrs",provider:"LinkedIn Learning"},
    {id:"ai6",type:"10",title:`Read: Key Framework for ${skillName}`,desc:`Study the foundational research and practical models for developing ${skillName.toLowerCase()}.`,source:"ai",category:"reading"},
  ];

  // Library tips for "Pick from Library" modal
  const libraryTips = {
    "70":[
      {id:"l1",type:"70",title:"Lead an Innovation Sprint",desc:"Facilitate a week-long innovation sprint with your team to solve a real business challenge.",source:"library",category:"experience"},
      {id:"l2",type:"70",title:"Rotate into Adjacent Function",desc:"Spend 2-4 weeks embedded in a different department to broaden perspective.",source:"library",category:"experience"},
      {id:"l3",type:"70",title:"Present to Executive Committee",desc:"Prepare and deliver a strategic recommendation to senior leadership.",source:"library",category:"experience"},
    ],
    "20":[
      {id:"l4",type:"20",title:"Reverse Mentoring",desc:"Pair with a junior employee to exchange perspectives and learn emerging trends.",source:"library",category:"social"},
      {id:"l5",type:"20",title:"Coaching Circles",desc:"Join a facilitated group coaching program with cross-functional peers.",source:"library",category:"social"},
      {id:"l6",type:"20",title:"360° Feedback Debrief",desc:"Schedule a facilitated debrief of your 360° feedback with a certified coach.",source:"library",category:"social"},
    ],
    "10":[
      {id:"l7",type:"10",title:"Leadership Essentials Certificate",desc:"Foundational leadership program covering core competencies.",source:"library",category:"course",provider:"Coursera",duration:"12 hrs"},
      {id:"l8",type:"10",title:"Emotional Intelligence Workshop",desc:"Interactive workshop on self-awareness, empathy, and social skills.",source:"library",category:"course",provider:"Internal L&D",duration:"1 day"},
      {id:"l9",type:"10",title:"Harvard ManageMentor",desc:"On-demand modules across 40+ leadership topics.",source:"library",category:"course",provider:"Harvard Business Publishing",duration:"Self-paced"},
    ],
  };

  // Plan helper functions
  const addSkillToPlan = (skill) => {
    setPlanSkills(prev => [...(prev||[]), {...skill,private:false,tips:[]}]);
    setPlanModal(null);
  };

  const removeSkillFromPlan = (idx) => {
    setPlanSkills(prev => prev.filter((_,i)=>i!==idx));
    if (planExpanded === idx) setPlanExpanded(null);
  };

  const toggleSkillPrivate = (idx) => {
    setPlanSkills(prev => prev.map((s,i) => i===idx ? {...s, private:!s.private} : s));
  };

  const addTipToSkill = (skillIdx, tip) => {
    const newTip = {...tip, id:`t${Date.now()}`, startDate:tip.startDate||"TBD", endDate:tip.endDate||"TBD", success:tip.success||"To be defined"};
    setPlanSkills(prev => prev.map((s,i) => i===skillIdx ? {...s, tips:[...s.tips, newTip]} : s));
    setPlanModal(null);
  };

  const removeTipFromSkill = (skillIdx, tipId) => {
    setPlanSkills(prev => prev.map((s,i) => i===skillIdx ? {...s, tips:s.tips.filter(t=>t.id!==tipId)} : s));
  };

  const addComment = (key, text) => {
    if (!text.trim()) return;
    setPlanComments(prev => ({...prev, [key]:[...(prev[key]||[]), {from:"user",name:"Kshitij",text:text.trim(),ts:"Just now"}]}));
    setCommentDraft(prev => ({...prev, [key]:""}));
  };

  const getCommentCount = (key) => (planComments[key]||[]).length;

  const toggleExpandAll = () => {
    if (planExpandAll) { setPlanExpanded(null); setPlanExpandAll(false); }
    else { setPlanExpandAll(true); setPlanExpanded("all"); }
  };

  // ═══════════════════════════════════════
  //  DASHBOARD
  // ═══════════════════════════════════════

  const programOrder = [programs.leadership, programs["360"]];

  const DashboardPage = () => (
    <div className="an" style={{maxWidth:isE?780:isB?900:720,margin:"0 auto",padding:isE?"40px 0 60px":isB?"28px 0":"32px 0"}}>
      {/* Hero — mode-specific greetings */}
      {isE ? <>
        <p style={{fontSize:13,fontWeight:600,color:teal,fontFamily:fb,letterSpacing:.5,marginBottom:12}}>Welcome back</p>
        <h1 style={{fontSize:44,fontWeight:800,color:dk?"#fff":navy,fontFamily:fh,letterSpacing:-1.5,lineHeight:1.08,marginBottom:16}}>Good afternoon,<br/>Kshitij.</h1>
        <p style={{fontSize:17,color:ts,fontFamily:fb,lineHeight:1.7,maxWidth:500}}>You have <span style={{color:teal,fontWeight:600}}>2 active programs</span> and <span style={{color:green,fontWeight:600}}>2 reports ready</span> for review.</p>
      </> : isN ? <>
        <h1 style={{fontSize:34,fontWeight:700,color:tx,fontFamily:f,letterSpacing:-.5,lineHeight:1.15,marginBottom:8}}>Good afternoon, Kshitij</h1>
        <p style={{fontSize:15,color:ts,fontFamily:f,lineHeight:1.6}}>2 active programs · 2 reports ready</p>
      </> : isS ? <>
        <h1 style={{fontSize:36,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-.8,lineHeight:1.1,marginBottom:8}}>Welcome back, Kshitij</h1>
        <p style={{fontSize:16,color:ts,fontFamily:f,lineHeight:1.6,marginBottom:24}}>You have <span style={{color:teal,fontWeight:700}}>2 active programs</span> and <span style={{color:green,fontWeight:700}}>2 reports ready</span>.</p>
      </> : isB ? <>
        <h1 style={{fontSize:26,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-.4,marginBottom:6}}>Good afternoon, Kshitij</h1>
        <p style={{fontSize:14,color:ts,fontFamily:f,marginBottom:20}}>Your assessment overview at a glance.</p>
      </> : <>
        <h1 style={{fontSize:28,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>Welcome back, Kshitij</h1>
        <p style={{fontSize:15,color:ts,fontFamily:f,marginBottom:20}}>Here's an overview of your assessment activity.</p>
      </>}

      {/* Summary stats */}
      <div className="an2" style={{display:"flex",gap:isE?48:10,marginBottom:28,...(isE?{borderTop:`1px solid ${bd}`,paddingTop:28,marginTop:32}:isN?{marginTop:20}:{}),...(isE?{flexWrap:"wrap"}:{})}}>
        {[
          {label:"Active Programs",value:"2",icon:I.Clip,color:navy,bg:navyBg},
          {label:"Reports Ready",value:"2",icon:I.Chart,color:teal,bg:tealBg},
          {label:"Upcoming Deadlines",value:"1",icon:I.Cal,color:red,bg:`${red}10`},
        ].map((s,i)=>(
          isE ? <div key={i}>
            <div style={{fontSize:34,fontWeight:800,color:s.color,fontFamily:fb,lineHeight:1,marginBottom:4}}>{s.value}</div>
            <div style={{fontSize:13,fontWeight:500,color:ts,fontFamily:fb}}>{s.label}</div>
          </div>
          : <div key={i} style={{flex:1,background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:"14px 14px",
              ...(isN?{transition:"all .1s",cursor:"default"}:{})
            }}
            {...(isN?{onMouseEnter:e=>e.currentTarget.style.background=nHov,onMouseLeave:e=>e.currentTarget.style.background=card}:{})}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{width:30,height:30,borderRadius:ir,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",color:s.color,flexShrink:0}}><s.icon/></div>
            </div>
            <div style={{fontSize:22,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>{s.value}</div>
            <div style={{fontSize:11,color:tm,fontFamily:f,marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {isE ? <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:fb,letterSpacing:1.5,textTransform:"uppercase",marginBottom:20,...eSep}}>Your Programs</p>
       : isB ? <h2 style={{fontSize:13,fontWeight:700,color:tm,fontFamily:f,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>Programs</h2>
       : isS ? <h2 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:16}}>Your Programs</h2>
       : <h2 style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:12}}>Your Programs</h2>}

      <div style={{...(isB?{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}:{})}}>
      {programOrder.map((prog,i) => {
        const ProgIcon = prog.icon === "users" ? I.Users : I.Chart;
        return isE ? (
          <div key={prog.id} className={i===0?"an3":"an4"} style={{borderTop:`1px solid ${bd}`,paddingTop:24,marginBottom:32}}>
            <p style={{fontSize:13,fontWeight:600,color:prog.accent,fontFamily:fb,marginBottom:6}}>{prog.daysLeft} days left</p>
            <h2 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:fh,letterSpacing:-.4,lineHeight:1.2,marginBottom:8,cursor:"pointer"}} onClick={()=>openProgram(prog.id)}>{prog.name}</h2>
            <p style={{fontSize:15,color:ts,fontFamily:fb,lineHeight:1.7,marginBottom:16}}>{prog.desc}</p>
            <Btn primary onClick={() => openProgram(prog.id)}>
              {consentGiven[prog.id] ? "Continue Program" : "Get Started"} <I.Arrow/>
            </Btn>
          </div>
        ) : isB ? (
          <div key={prog.id} className={i===0?"an3":"an4"} onClick={()=>openProgram(prog.id)} style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:18,cursor:"pointer",transition:"all .15s",display:"flex",flexDirection:"column"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=prog.accent;e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=bd;e.currentTarget.style.transform="none";}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:36,height:36,borderRadius:cr,background:`${prog.accent}12`,display:"flex",alignItems:"center",justifyContent:"center",color:prog.accent,flexShrink:0}}><ProgIcon/></div>
              <span style={{fontSize:10,fontWeight:700,color:orange,background:`${orange}12`,padding:"3px 8px",borderRadius:sr,fontFamily:f}}>In Progress</span>
              <span style={{fontSize:10,color:prog.daysLeft<=14?red:tm,fontWeight:700,fontFamily:f,marginLeft:"auto"}}>{prog.daysLeft}d left</span>
            </div>
            <h2 style={{fontSize:16,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>{prog.name}</h2>
            <p style={{fontSize:12,color:ts,fontFamily:f,lineHeight:1.5,marginBottom:12,flex:1}}>{prog.desc}</p>
            <ProgressBar pct={prog.pct} color={prog.accent} height={4}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontSize:11,color:tm,fontFamily:f}}>{prog.pct}% complete</span>
              <span style={{fontSize:11,fontWeight:700,color:prog.accent,fontFamily:f}}>{consentGiven[prog.id] ? "Continue →" : "Start →"}</span>
            </div>
          </div>
        ) : isS ? (
          <div key={prog.id} className={i===0?"an3":"an4"} style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:28,marginBottom:18}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
              <div style={{width:52,height:52,borderRadius:cr,background:`${prog.accent}10`,display:"flex",alignItems:"center",justifyContent:"center",color:prog.accent,flexShrink:0,marginTop:2}}><ProgIcon/></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{fontSize:11,fontWeight:700,color:orange,background:`${orange}12`,padding:"3px 10px",borderRadius:sr,fontFamily:f}}>In Progress</span>
                  <span style={{fontSize:12,color:prog.daysLeft<=14?red:tm,fontWeight:700,fontFamily:f}}>{prog.daysLeft} days left</span>
                </div>
                <h2 style={{fontSize:20,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:6}}>{prog.name}</h2>
                <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.6,marginBottom:16}}>{prog.desc}</p>
                <div style={{marginBottom:16}}>
                  <ProgressBar pct={prog.pct} color={prog.accent} height={5}/>
                  <span style={{fontSize:12,color:tm,fontFamily:f,marginTop:4,display:"block"}}>{prog.pct}% complete</span>
                </div>
                <Btn primary onClick={() => openProgram(prog.id)}>
                  {consentGiven[prog.id] ? "Continue Program" : "Get Started"} <I.Arrow/>
                </Btn>
              </div>
            </div>
          </div>
        ) : (
        <div key={prog.id} className={i===0?"an3":"an4"} style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:isN?"18px 20px":22,marginBottom:isN?10:14,
          ...(isN?{borderLeft:nAccent,transition:"all .1s"}:{})
        }}
        {...(isN?{onMouseEnter:e=>e.currentTarget.style.background=nHov,onMouseLeave:e=>e.currentTarget.style.background=card}:{})}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
            <div style={{width:44,height:44,borderRadius:cr,background:`${prog.accent}10`,display:"flex",alignItems:"center",justifyContent:"center",color:prog.accent,flexShrink:0,marginTop:2}}><ProgIcon/></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:700,color:orange,background:`${orange}12`,padding:"3px 10px",borderRadius:sr,fontFamily:f}}>In Progress</span>
                <span style={{fontSize:12,color:prog.daysLeft<=14?red:tm,fontWeight:700,fontFamily:f}}>{prog.daysLeft} days left</span>
              </div>
              <h2 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>{prog.name}</h2>
              <p style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.5,marginBottom:14}}>{prog.desc}</p>
              <Btn primary onClick={() => openProgram(prog.id)}>
                {consentGiven[prog.id] ? "Continue Program" : "Get Started"} <I.Arrow/>
              </Btn>
            </div>
          </div>
        </div>
        );
      })}
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  PROGRAM INSTRUCTIONS (per program)
  // ═══════════════════════════════════════

  const InstructionsPage = () => {
    if (!curProg) return null;
    const pid = curProg.id;
    const watched = videoWatched[pid];
    const acked = consentGiven[pid];

    return (
      <div className="an" style={{maxWidth:isE?780:isB?900:720,margin:"0 auto",padding:isE?"40px 0 60px":"32px 0"}}>
        <BackBtn onClick={() => {setSelProgram(null);setPg("dash");}} label="Back to programs"/>
        {isE ? <>
          <p style={{fontSize:11,fontWeight:700,color:teal,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:12}}>Instructions</p>
          <h1 style={{fontSize:36,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-1,lineHeight:1.08,marginBottom:8}}>Assessment Instructions</h1>
          <p style={{fontSize:16,color:ts,fontFamily:f,lineHeight:1.7,marginBottom:32}}>{curProg.name}</p>
        </> : <>
          <h1 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>Assessment Instructions</h1>
          <p style={{fontSize:14,color:ts,fontFamily:f,marginBottom:24}}>{curProg.name}</p>
        </>}

        <div className="an2" onClick={() => setVideoWatched(p=>({...p,[pid]:true}))}
          style={{position:"relative",width:"100%",paddingBottom:isE?"50%":"56.25%",borderRadius:cr,overflow:"hidden",background:"#111",marginBottom:24,cursor:"pointer"}}>
          <img src={curProg.video} alt="Instruction video" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:watched?.35:.65,transition:"opacity .3s"}}/>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
            {!watched?(
              <><div style={{width:56,height:56,borderRadius:28,background:"rgba(255,255,255,.92)",display:"flex",alignItems:"center",justifyContent:"center",color:navy,boxShadow:"0 4px 20px rgba(0,0,0,.2)"}}><I.Play/></div>
              <span style={{color:"#fff",fontSize:13,fontWeight:600,fontFamily:f,textShadow:"0 1px 6px rgba(0,0,0,.6)"}}>Watch introduction video (2:30)</span></>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(26,138,66,.9)",padding:"8px 16px",borderRadius:ir}}><I.Check/><span style={{color:"#fff",fontSize:13,fontWeight:700,fontFamily:f}}>Video watched ✓</span></div>
            )}
          </div>
        </div>

        <div className="an3" style={{...(isE?{...eSep,padding:0}:{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:24}),...(isN?{borderLeft:nAccent}:{}),marginBottom:24}}>
          {isE ? <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:16}}>Before You Begin</p>
           : <h3 style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:16}}>Before You Begin</h3>}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {curProg.instructions.map((pt,i) => (
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{width:24,height:24,borderRadius:cr,background:navyBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,fontWeight:700,color:navy,fontFamily:f}}>{i+1}</div>
                <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.6,flex:1}}>{pt}</p>
              </div>
            ))}
          </div>
        </div>

        {!acked ? (
          <div className="an4">
            <Btn primary onClick={() => {setConsentGiven(p=>({...p,[pid]:true}));setPg("tasks");setInstrOpen(false);}} disabled={!watched} style={{width:"100%",justifyContent:"center"}}>
              {watched?"I've read the instructions & watched the video — Continue":"Watch the video first to continue"}
            </Btn>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 16px",background:`${green}10`,border:`1px solid ${green}20`,borderRadius:sr}}>
            <I.Check/><span style={{fontSize:14,color:green,fontWeight:600,fontFamily:f}}>Instructions acknowledged.</span>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  COUNTDOWN COMPONENTS (isolated state — no parent re-render)
  // ═══════════════════════════════════════

  const useCountdown = (dueDate) => {
    const [cd, setCd] = useState({d:0,h:0,m:0,s:0});
    useEffect(() => {
      const deadline = new Date(dueDate + " 23:59:59");
      const tick = () => {
        const diff = Math.max(0, deadline - new Date());
        setCd({d:Math.floor(diff/86400000),h:Math.floor((diff%86400000)/3600000),m:Math.floor((diff%3600000)/60000),s:Math.floor((diff%60000)/1000)});
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }, [dueDate]);
    return cd;
  };

  const CountdownBoxes = ({dueDate, deadline}) => {
    const cd = useCountdown(dueDate);
    const urgent = cd.d <= 14;
    return (
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {[{v:cd.d,l:"days"},{v:cd.h,l:"hrs"},{v:cd.m,l:"min"},{v:cd.s,l:"sec"}].map((t,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:48,padding:"8px 0",background:card,border:`1px solid ${urgent?`${red}16`:bd}`,borderRadius:ir}}>
            <span style={{fontSize:20,fontWeight:800,fontFamily:f,lineHeight:1,color:urgent?red:dk?"#fff":navy,fontVariantNumeric:"tabular-nums"}}>{String(t.v).padStart(2,"0")}</span>
            <span style={{fontSize:9,fontWeight:600,color:urgent?red:tm,fontFamily:f,marginTop:2,textTransform:"uppercase",letterSpacing:.3}}>{t.l}</span>
          </div>
        ))}
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
          <span style={{fontSize:12,color:tm,fontFamily:f}}>Deadline: <strong style={{color:dk?"#fff":navy}}>{deadline}</strong></span>
        </div>
      </div>
    );
  };

  const CountdownInline = ({dueDate}) => {
    const cd = useCountdown(dueDate);
    const urgent = cd.d <= 14;
    return (
      <div style={{display:"flex",gap:4}}>
        {[{v:cd.d,l:"d"},{v:cd.h,l:"h"},{v:cd.m,l:"m"},{v:cd.s,l:"s"}].map((t,i)=>(
          <span key={i} style={{fontSize:13,fontWeight:700,color:urgent?red:dk?"#fff":navy,fontFamily:f,fontVariantNumeric:"tabular-nums"}}>
            {String(t.v).padStart(2,"0")}{t.l}{i<3?" : ":""}
          </span>
        ))}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PROGRAM TASKS (#3 hero card + centers + exercises)
  // ═══════════════════════════════════════

  const TasksPage = () => {
    if (!curProg) return null;
    const p = curProg;
    const seqIdx = p.seqExercises.findIndex(e=>e.status==="progress"||e.status==="notstarted");
    const totalDone = [...p.seqExercises,...p.openExercises].filter(e=>e.status==="complete").length;
    const totalAll = p.seqExercises.length + p.openExercises.length + p.centers.length;

    return (
      <div className="an" style={{padding:"0"}}>

        {/* ── HERO BANNER — solid dark, metrics, collapsible ── */}
        <div className="an2" style={{background:dk?`${navy}`:navy,borderBottom:`${bdw} solid ${dk?"rgba(255,255,255,.08)":"transparent"}`,padding:heroCompact?"10px 24px":"20px 24px",transition:"padding .2s",position:"relative",overflow:"hidden"}}>
          <div style={{maxWidth:isE?780:isB?900:720,margin:"0 auto",position:"relative"}}>
            {/* Top row: back + title + collapse toggle */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:heroCompact?0:12}}>
              <button onClick={() => {setSelProgram(null);setPg("dash");}} style={{display:"flex",alignItems:"center",justifyContent:"center",width:30,height:30,borderRadius:ir,background:"rgba(255,255,255,.12)",border:"none",cursor:"pointer",color:"#fff",flexShrink:0,padding:0}}><I.Back/></button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <h1 style={{fontSize:heroCompact?15:isE?22:18,fontWeight:800,color:"#fff",fontFamily:f,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",transition:"font-size .2s"}}>{p.name}</h1>
                  <span style={{fontSize:10,fontWeight:700,color:"#fff",background:orange,padding:"2px 8px",borderRadius:sr,fontFamily:f,flexShrink:0}}>In Progress</span>
                </div>
              </div>
              <button onClick={() => setHeroCompact(!heroCompact)} style={{display:"flex",alignItems:"center",justifyContent:"center",width:30,height:30,borderRadius:ir,background:"rgba(255,255,255,.12)",border:"none",cursor:"pointer",color:"#fff",flexShrink:0,padding:0,transform:heroCompact?"rotate(180deg)":"none",transition:"transform .2s"}}>
                <I.Down/>
              </button>
            </div>

            {/* Expanded content */}
            {!heroCompact && (
              <div style={{marginTop:2}}>
                {/* Metrics row */}
                <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                  {[
                    {label:"Assigned",value:totalAll,color:"#fff",icon:I.FileText},
                    {label:"In Progress",value:[...p.seqExercises,...p.openExercises,...p.centers].filter(e=>e.status==="progress").length,color:orange,icon:I.Clock},
                    {label:"Completed",value:totalDone,color:green,icon:I.Check},
                  ].map((m,i)=>(
                    <div key={i} style={{flex:1,minWidth:90,display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(255,255,255,.08)",borderRadius:cr,border:"1px solid rgba(255,255,255,.10)"}}>
                      <div style={{width:28,height:28,borderRadius:ir,background:`${m.color}20`,display:"flex",alignItems:"center",justifyContent:"center",color:m.color,flexShrink:0}}><m.icon/></div>
                      <div>
                        <div style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:f,lineHeight:1}}>{m.value}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.55)",fontFamily:f,fontWeight:600}}>{m.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div style={{marginBottom:12}}>
                  <ProgressBar pct={p.pct} color={teal} height={5}/>
                  <span style={{fontSize:11,color:"rgba(255,255,255,.5)",fontFamily:f,marginTop:4,display:"block"}}>{p.pct}% complete · {totalDone}/{totalAll} tasks</span>
                </div>

                {/* Instructions toggle */}
                <button onClick={() => setInstrOpen(!instrOpen)}
                  style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 12px",background:instrOpen?`${teal}25`:"rgba(255,255,255,.08)",borderRadius:ir,border:`1px solid ${instrOpen?`${teal}40`:"rgba(255,255,255,.10)"}`,cursor:"pointer",textAlign:"left",fontFamily:f,transition:"all .2s"}}>
                  <div style={{width:26,height:26,borderRadius:ir,background:teal,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}><I.Info/></div>
                  <span style={{flex:1,fontSize:13,fontWeight:600,color:"#fff"}}>View Instructions & Video</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"rgba(255,255,255,.5)",transition:"transform .2s",transform:instrOpen?"rotate(180deg)":"rotate(0)"}}><polyline points="6 9 12 15 18 9"/></svg>
                </button>

                {/* Inline expanded instructions */}
                {instrOpen && (
                  <div className="td" style={{marginTop:8,background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,overflow:"hidden"}}>
                    {/* Video */}
                    <div onClick={() => setVideoWatched(prev=>({...prev,[curProg.id]:true}))}
                      style={{position:"relative",width:"100%",paddingBottom:"50%",background:"#111",cursor:"pointer"}}>
                      <img src={curProg.video} alt="Instruction video" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:videoWatched[curProg.id]?.35:.65,transition:"opacity .3s"}}/>
                      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                        {!videoWatched[curProg.id] ? (
                          <><div style={{width:48,height:48,borderRadius:24,background:"rgba(255,255,255,.92)",display:"flex",alignItems:"center",justifyContent:"center",color:navy,boxShadow:"0 4px 16px rgba(0,0,0,.2)"}}><I.Play/></div>
                          <span style={{color:"#fff",fontSize:12,fontWeight:600,fontFamily:fb,textShadow:"0 1px 6px rgba(0,0,0,.6)"}}>Watch introduction (2:30)</span></>
                        ) : (
                          <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(26,138,66,.9)",padding:"6px 14px",borderRadius:ir}}><I.Check/><span style={{color:"#fff",fontSize:12,fontWeight:700,fontFamily:fb}}>Video watched ✓</span></div>
                        )}
                      </div>
                    </div>
                    {/* Instructions list */}
                    <div style={{padding:"16px 18px"}}>
                      <h4 style={{fontSize:13,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:12}}>Before You Begin</h4>
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        {curProg.instructions.map((pt,idx) => (
                          <div key={idx} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                            <div style={{width:20,height:20,borderRadius:cr,background:navyBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:700,color:navy,fontFamily:fb}}>{idx+1}</div>
                            <p style={{fontSize:13,color:ts,fontFamily:fb,lineHeight:1.55,flex:1}}>{pt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Compact: timer + progress inline */}
            {heroCompact && (
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:6}}>
                <div style={{flex:1}}><ProgressBar pct={p.pct} color={navy} height={4}/></div>
                <span style={{fontSize:11,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>{totalDone}/{totalAll}</span>
                <span style={{fontSize:11,color:tm,fontFamily:f}}>{p.pct}%</span>
              </div>
            )}
          </div>
        </div>

        <div style={{maxWidth:isE?780:isB?900:720,margin:"0 auto",padding:"24px 0"}}>

        {/* ── ASSESSMENT CENTERS (#4 shown first) ── */}
        {p.centers.length > 0 && (
          <div className="an3" style={{marginBottom:32,...(isE?eSep:{})}}>
            {isE ? <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:12}}>Assessment Centers</p>
             : isB ? <h2 style={{fontSize:13,fontWeight:700,color:tm,fontFamily:f,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>Assessment Centers</h2>
             : isS ? <h2 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:14}}>Assessment Centers</h2>
             : <h2 style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:12}}>Assessment Centers</h2>}
            <div style={{display:isB?"grid":"flex",gridTemplateColumns:isB?"1fr 1fr":"",gap:isB?10:10,flexDirection:isB?"":"column"}}>
              {p.centers.map(c => {
                const locked = c.status === "locked";
                const donePh = c.activities.filter(a=>a.status==="complete").length;
                return (
                  <div key={c.id} onClick={locked?undefined:()=>{
                    if(c.proctored){startPreCheck(c,"center");}else{setSelCenter(c.id);setPg("center");}
                  }}
                    style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,cursor:locked?"default":"pointer",fontFamily:f,opacity:locked?.5:1,
                      ...(isN&&!locked?{borderLeft:`3px solid ${c.color}`,transition:"all .1s"}:{})
                    }}
                    {...(isN&&!locked?{onMouseEnter:e=>e.currentTarget.style.background=nHov,onMouseLeave:e=>e.currentTarget.style.background=card}:{})}>
                    <div style={{width:42,height:42,borderRadius:cr,background:`${c.color}10`,display:"flex",alignItems:"center",justifyContent:"center",color:c.color,flexShrink:0}}><I.Monitor/></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:15,fontWeight:700,color:locked?tm:dk?"#fff":navy}}>{c.name}</div>
                      <div style={{fontSize:13,color:ts,marginTop:2,lineHeight:1.4}}>{c.desc}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5,flexWrap:"wrap"}}>
                        <span style={{fontSize:12,color:tm,display:"inline-flex",alignItems:"center",gap:3}}><I.Clock/> {c.time}</span>
                        {c.proctored&&<span style={{fontSize:10,fontWeight:700,color:purple,background:purpleBg,padding:"2px 7px",borderRadius:4}}>Proctored</span>}
                        {!locked&&donePh>0&&<span style={{fontSize:11,color:ts,fontWeight:600}}>{donePh}/{c.activities.length} phases</span>}
                        {locked&&<span style={{fontSize:11,color:tm,fontWeight:600}}>Locked</span>}
                      </div>
                    </div>
                    {!locked?<I.ChevR/>:<I.Lock/>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SEQUENTIAL EXERCISES ── */}
        {p.seqExercises.length > 0 && (
          <div className="an3" style={{marginBottom:32,...(isE?eSep:{})}}>
            {isE ? <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>Sequential Exercises</p>
             : isB ? <h2 style={{fontSize:13,fontWeight:700,color:tm,fontFamily:f,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Sequential Exercises</h2>
             : isS ? <h2 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>Sequential Exercises</h2>
             : <h2 style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>Sequential Exercises</h2>}
            <p style={{fontSize:12,color:tm,fontFamily:f,marginBottom:14}}>Complete in order — each unlocks the next.</p>
            <div style={{display:"flex",flexDirection:"column"}}>
              {p.seqExercises.map((ex,i)=>{
                const done=ex.status==="complete";
                const active=ex.status==="progress"||(ex.status==="notstarted"&&i===seqIdx);
                const locked=ex.status==="locked";
                return(
                  <div key={ex.id} style={{display:"flex",gap:14}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:30,flexShrink:0}}>
                      <div style={{width:28,height:28,borderRadius:cr,display:"flex",alignItems:"center",justifyContent:"center",background:done?green:active?ex.color:dk?"#1e2a3e":"#e2e6ec",color:done||active?"#fff":tm,fontSize:12,fontWeight:700,fontFamily:f}}>
                        {done?<I.Check/>:locked?<I.Lock/>:i+1}
                      </div>
                      {i<p.seqExercises.length-1&&<div style={{width:2,flex:1,background:done?`${green}40`:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",margin:"3px 0"}}/>}
                    </div>
                    <div style={{flex:1,paddingBottom:i<p.seqExercises.length-1?14:0}}>
                      <div style={{background:(active||done)?card:"transparent",border:(active||done)?`${bdw} solid ${bd}`:"none",borderRadius:cr,padding:(active||done)?16:0,opacity:locked?.5:1}}>
                        <div style={{fontSize:14,fontWeight:700,color:locked?tm:dk?"#fff":navy,fontFamily:f}}>{ex.name}</div>
                        <div style={{fontSize:13,color:ts,fontFamily:f,marginTop:2}}>{ex.desc}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4,flexWrap:"wrap"}}>
                          <span style={{fontSize:12,color:tm,display:"inline-flex",alignItems:"center",gap:3}}><I.Clock/> {ex.time}</span>
                          {ex.proctored&&<span style={{fontSize:10,fontWeight:700,color:purple,background:purpleBg,padding:"2px 7px",borderRadius:4}}>Proctored</span>}
                        </div>
                        {done&&(
                          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,flexWrap:"wrap"}}>
                            <span style={{fontSize:12,color:green,fontWeight:600}}>✓ Complete</span>
                            {ex.hasReport&&<>
                              <button onClick={()=>{setSelProgram(null);setPg("insights");}} style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,color:teal,fontFamily:f,background:tealBg,border:"none",cursor:"pointer",padding:"5px 12px",borderRadius:sr}}><I.Chart/> View Insights</button>
                            </>}
                          </div>
                        )}
                        {active&&ex.pct>0&&ex.pct<100&&<div style={{marginTop:10}}><ProgressBar pct={ex.pct} color={ex.color}/><span style={{fontSize:11,color:tm,fontFamily:f,marginTop:3,display:"block"}}>{ex.pct}%</span></div>}
                        {/* #5: Clear CTA based on proctored or not */}
                        {active&&(
                          <div style={{marginTop:10}}>
                            {ex.proctored
                              ? <Btn primary small onClick={()=>startPreCheck(ex,"assessment")}><I.Shield/> {ex.pct>0?"Continue":"Start"} (Proctored) <I.Arrow/></Btn>
                              : <Btn primary small>{ex.pct>0?"Continue":"Start"} <I.Arrow/></Btn>
                            }
                          </div>
                        )}
                        {locked&&<span style={{fontSize:12,color:tm,fontFamily:f,marginTop:6,display:"block"}}>Complete previous exercise to unlock</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── OPEN EXERCISES ── */}
        {p.openExercises.length > 0 && (
          <div className="an4" style={{...(isE?eSep:{})}}>
            {isE ? <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>Open Exercises</p>
             : isB ? <h2 style={{fontSize:13,fontWeight:700,color:tm,fontFamily:f,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Open Exercises</h2>
             : isS ? <h2 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>Open Exercises</h2>
             : <h2 style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>Open Exercises</h2>}
            <p style={{fontSize:12,color:tm,fontFamily:f,marginBottom:14}}>Complete in any order, at your own pace.</p>
            <div style={{display:isB?"grid":"flex",gridTemplateColumns:isB?"1fr 1fr":"",gap:isB?10:10,flexDirection:isB?"":"column"}}>
              {p.openExercises.map(ex=>{
                const done=ex.status==="complete";const active=ex.status==="progress"||ex.status==="notstarted";
                return(
                  <div key={ex.id} style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:16,
                    ...(isN?{borderLeft:`3px solid ${done?green:ex.color}`,transition:"all .1s"}:{})
                  }}
                  {...(isN?{onMouseEnter:e=>e.currentTarget.style.background=nHov,onMouseLeave:e=>e.currentTarget.style.background=card}:{})}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                      <div style={{width:32,height:32,borderRadius:sr,background:done?`${green}12`:`${ex.color}10`,display:"flex",alignItems:"center",justifyContent:"center",color:done?green:ex.color,flexShrink:0,marginTop:2}}>{done?<I.Check/>:<I.FileText/>}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>{ex.name}</div>
                        <div style={{fontSize:13,color:ts,fontFamily:f,marginTop:2}}>{ex.desc}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4,flexWrap:"wrap"}}>
                          <span style={{fontSize:12,color:tm,display:"inline-flex",alignItems:"center",gap:3}}><I.Clock/> {ex.time}</span>
                          {ex.proctored&&<span style={{fontSize:10,fontWeight:700,color:purple,background:purpleBg,padding:"2px 7px",borderRadius:4}}>Proctored</span>}
                        </div>
                        {done&&(
                          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,flexWrap:"wrap"}}>
                            <span style={{fontSize:12,color:green,fontWeight:600}}>✓ Complete</span>
                            {ex.hasReport&&<>
                              <button onClick={()=>{setSelProgram(null);setPg("insights");}} style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,color:teal,fontFamily:f,background:tealBg,border:"none",cursor:"pointer",padding:"5px 12px",borderRadius:sr}}><I.Chart/> View Insights</button>
                            </>}
                          </div>
                        )}
                        {active&&ex.pct>0&&ex.pct<100&&<div style={{marginTop:10}}><ProgressBar pct={ex.pct} color={ex.color}/></div>}
                        {active&&(
                          <div style={{marginTop:10}}>
                            {ex.proctored
                              ? <Btn primary small onClick={()=>startPreCheck(ex,"assessment")}><I.Shield/> Start (Proctored) <I.Arrow/></Btn>
                              : <Btn primary small>Start <I.Arrow/></Btn>
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PRE-CHECK PAGE (#6 #7 #8 immersive flow)
  // ═══════════════════════════════════════

  const PreCheckPage = () => {
    if (!checkTarget) return null;
    const sysItems = [{k:"browser",ic:I.Monitor,l:"Browser"},{k:"internet",ic:I.Wifi,l:"Internet"},{k:"camera",ic:I.Cam,l:"Camera"},{k:"mic",ic:I.Mic,l:"Microphone"},{k:"upload",ic:I.Upload,l:"Upload Speed"}];

    // Step: instructions → consent → running check → done → launch
    const step = !preCheckConsent ? "info" : !checksDone ? "check" : "ready";

    return (
      <div className="an" style={{maxWidth:isE?720:isB?900:660,margin:"0 auto",padding:isE?"40px 0 60px":"32px 0"}}>
        <BackBtn onClick={() => setPg("tasks")} label="Back to tasks"/>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
          <div style={{width:42,height:42,borderRadius:cr,background:purpleBg,display:"flex",alignItems:"center",justifyContent:"center",color:purple}}><I.Shield/></div>
          <div>
            {isE ? <>
              <p style={{fontSize:11,fontWeight:700,color:purple,fontFamily:f,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Proctored</p>
              <h1 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-.4}}>System Check</h1>
            </> : <h1 style={{fontSize:22,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>Proctored Assessment</h1>}
            <p style={{fontSize:13,color:ts,fontFamily:f}}>{checkTarget.name}</p>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{display:"flex",alignItems:"center",gap:0,margin:"20px 0 24px",padding:"0 2px"}}>
          {["Read Guidelines","System Check","Start Assessment"].map((label,i)=>{
            const stepDone = (i===0&&preCheckConsent)||(i===1&&checksDone);
            const stepActive = (i===0&&step==="info")||(i===1&&step==="check")||(i===2&&step==="ready");
            return(
              <div key={i} style={{display:"flex",alignItems:"center",flex:i<2?1:"none"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{width:24,height:24,borderRadius:cr,background:stepDone?green:stepActive?navy:dk?"#1e2a3e":"#e2e6ec",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:stepDone||stepActive?"#fff":tm,fontFamily:f}}>
                    {stepDone?<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>:i+1}
                  </div>
                  <span style={{fontSize:10,fontWeight:stepActive?700:500,color:stepActive?(dk?"#fff":navy):stepDone?ts:tm,fontFamily:f,whiteSpace:"nowrap"}}>{label}</span>
                </div>
                {i<2&&<div style={{flex:1,height:2,background:stepDone?`${green}40`:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",margin:"0 8px",marginBottom:16,minWidth:16}}/>}
              </div>
            );
          })}
        </div>

        {/* STEP 1: Guidelines (#6 proctoring info) */}
        {step === "info" && (
          <div className="td">
            <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:24,marginBottom:20}}>
              <h3 style={{fontSize:16,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:14}}>What happens next</h3>
              <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.6,marginBottom:16}}>
                This is a proctored assessment. We'll check your system readiness and then launch the assessment in a monitored environment.
              </p>

              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[
                  {ic:I.Cam,title:"Camera & video recording",desc:"Your camera will be active throughout. Ensure good lighting and a clear background."},
                  {ic:I.Mic,title:"Microphone monitoring",desc:"Audio will be monitored. Be in a quiet environment with no interruptions."},
                  {ic:I.Wifi,title:"Stable internet connection",desc:"A minimum of 2 Mbps upload speed is required. Use a wired connection if possible."},
                  {ic:I.Users,title:"Professional appearance",desc:"Dress presentably as if attending a professional assessment. Be camera-ready."},
                  {ic:I.Bulb,title:"Right mindset & focus",desc:"Close all other apps and tabs. Give this your full, undivided attention."},
                ].map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:34,height:34,borderRadius:sr,background:navyBg,display:"flex",alignItems:"center",justifyContent:"center",color:navy,flexShrink:0}}><item.ic/></div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>{item.title}</div>
                      <div style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.5}}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important notice */}
            <div style={{background:`${warn}08`,border:`1px solid ${warn}20`,borderRadius:cr,padding:16,marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
              <I.Info/>
              <p style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.5}}>
                <strong style={{color:dk?"#fff":navy}}>Important:</strong> Once you start, the timer begins and cannot be paused. Any suspicious activity (leaving the tab, multiple faces detected) will be flagged. Ensure you are fully prepared before proceeding.
              </p>
            </div>

            {/* #7: Consent button */}
            <Btn primary onClick={() => { setPreCheckConsent(true); runChecks(); }} style={{width:"100%",justifyContent:"center"}}>
              I understand — Proceed to System Check <I.Arrow/>
            </Btn>
          </div>
        )}

        {/* STEP 2: System Check running */}
        {step === "check" && (
          <div className="td">
            <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:20,marginBottom:20}}>
              <h3 style={{fontSize:16,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:14}}>Checking your system…</h3>
              {sysItems.map((itm,i)=>{const st=checks[itm.k];return(
                <div key={itm.k} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:i<sysItems.length-1?`${bdw} solid ${bd}`:"none"}}>
                  <div style={{width:34,height:34,borderRadius:9,background:st==="pass"?`${green}12`:st==="warning"?`${warn}12`:navyBg,display:"flex",alignItems:"center",justifyContent:"center",color:st==="pass"?green:st==="warning"?warn:navy,flexShrink:0}}><itm.ic/></div>
                  <span style={{flex:1,fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{itm.l}</span>
                  {!st&&<I.Spin/>}
                  {st==="pass"&&<span style={{fontSize:12,color:green,fontWeight:700,fontFamily:f}}>✓ Pass</span>}
                  {st==="warning"&&<span style={{fontSize:12,color:warn,fontWeight:700,fontFamily:f}}>⚠ Slow</span>}
                </div>
              );})}
            </div>
            {running && <p style={{fontSize:13,color:ts,fontFamily:f,textAlign:"center"}}>Please wait while we verify your setup…</p>}
          </div>
        )}

        {/* STEP 3: Ready to launch (#8) */}
        {step === "ready" && (
          <div className="td">
            <div style={{background:`${green}08`,border:`1px solid ${green}20`,borderRadius:cr,padding:24,marginBottom:20,textAlign:"center"}}>
              <div style={{width:48,height:48,borderRadius:24,background:green,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",color:"#fff"}}><I.Check/></div>
              <h3 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>System Check Passed</h3>
              <p style={{fontSize:14,color:ts,fontFamily:f}}>Your device is ready. Click below to enter the assessment.</p>
              {Object.values(checks).includes("warning") && (
                <p style={{fontSize:12,color:warn,fontFamily:f,marginTop:8}}>Note: Your internet speed is slow. Performance may be affected.</p>
              )}
            </div>

            <Btn primary onClick={() => { if(checkTarget.id==="cognitive"){openVideoAssess();setCheckTarget(null);}else{setPg("tasks");setCheckTarget(null);} }} style={{width:"100%",justifyContent:"center"}}>
              Launch {checkTarget.name} <I.Arrow/>
            </Btn>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  CENTER DETAIL
  // ═══════════════════════════════════════

  const CenterPage = () => {
    if (!curProg) return null;
    const center = curProg.centers.find(c=>c.id===selCenter);
    if (!center) return null;
    return (
      <div className="an" style={{maxWidth:isE?780:isB?900:720,margin:"0 auto",padding:isE?"40px 0 60px":"32px 0"}}>
        <BackBtn onClick={() => setPg("tasks")} label="Back to tasks"/>
        {isE ? <>
          <p style={{fontSize:11,fontWeight:700,color:center.color||navy,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>Assessment Center</p>
          <h1 style={{fontSize:28,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-.6,lineHeight:1.2,marginBottom:6}}>{center.name}</h1>
        </> : <h1 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>{center.name}</h1>}
        <p style={{fontSize:14,color:ts,fontFamily:f,marginBottom:6}}>{center.desc}</p>
        <div style={{display:"flex",gap:12,marginBottom:24}}>
          <span style={{fontSize:12,color:tm,fontFamily:f,display:"flex",alignItems:"center",gap:3}}><I.Clock/> {center.time}</span>
          <span style={{fontSize:12,color:tm,fontFamily:f}}>{center.activities.filter(a=>a.status==="complete").length}/{center.activities.length} phases</span>
        </div>
        <div className="an2" style={{display:"flex",flexDirection:"column"}}>
          {center.activities.map((act,i)=>{
            const done=act.status==="complete";const active=act.status==="progress";const locked=act.status==="locked";
            return(
              <div key={act.id} style={{display:"flex",gap:14}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:30,flexShrink:0}}>
                  <div style={{width:28,height:28,borderRadius:cr,display:"flex",alignItems:"center",justifyContent:"center",background:done?green:active?navy:dk?"#1e2a3e":"#e2e6ec",color:done||active?"#fff":tm,fontSize:12,fontWeight:700,fontFamily:f}}>{done?<I.Check/>:locked?<I.Lock/>:i+1}</div>
                  {i<center.activities.length-1&&<div style={{width:2,flex:1,background:done?`${green}40`:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",margin:"3px 0"}}/>}
                </div>
                <div style={{flex:1,paddingBottom:i<center.activities.length-1?14:0}}>
                  <div style={{background:active?card:"transparent",border:active?`${bdw} solid ${bd}`:"none",borderRadius:cr,padding:active?16:0,opacity:locked?.5:1}}>
                    <div style={{fontSize:14,fontWeight:active?700:600,color:locked?tm:dk?"#fff":navy,fontFamily:f}}>{act.name}</div>
                    <div style={{fontSize:13,color:ts,fontFamily:f,marginTop:2}}>{act.desc}</div>
                    <span style={{fontSize:12,color:tm,fontFamily:f,marginTop:3,display:"inline-flex",alignItems:"center",gap:3}}><I.Clock/> {act.time}</span>
                    {done&&<span style={{display:"block",fontSize:12,color:green,fontWeight:600,fontFamily:f,marginTop:6}}>✓ Complete</span>}
                    {active&&act.pct>0&&act.pct<100&&<div style={{marginTop:10}}><ProgressBar pct={act.pct} color={navy}/><span style={{fontSize:11,color:tm,fontFamily:f,marginTop:3,display:"block"}}>{act.pct}%</span></div>}
                    {active&&<div style={{marginTop:10}}><Btn primary small>{act.pct>0?"Continue":"Start"} <I.Arrow/></Btn></div>}
                    {locked&&<span style={{fontSize:12,color:tm,fontFamily:f,marginTop:6,display:"block"}}>Complete previous phase first</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  INSIGHTS PAGE
  // ═══════════════════════════════════════

  const InsightsPage = () => {
    const leadershipReports = reports.filter(r => r.program === "leadership");
    const report360 = reports.filter(r => r.program === "360");
    const availCount = reports.filter(r => r.available).length;

    const ReportCard = ({r}) => {
      const locked = !r.available;
      // Find assessment names for this report
      const allEx = [...(programs.leadership.seqExercises||[]),...(programs.leadership.openExercises||[]),...(programs.leadership.centers||[]),
        ...(programs["360"].seqExercises||[]),...(programs["360"].openExercises||[])];
      const linkedNames = r.assessments.map(aid => {
        const found = allEx.find(e => e.id === aid);
        return found ? found.name : aid;
      });
      const doneCount = r.assessments.filter(aid => {
        const found = allEx.find(e => e.id === aid);
        return found && found.status === "complete";
      }).length;

      return (
        <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,overflow:"hidden",opacity:locked?.7:1,transition:"all .2s"}}>
          {/* Thumbnail */}
          <div style={{position:"relative",width:"100%",height:140,overflow:"hidden",background:dk?"#1a2436":"#e8eef4"}}>
            <img src={r.thumbnail} alt={r.name} style={{width:"100%",height:"100%",objectFit:"cover",opacity:locked?.4:.85,filter:locked?"grayscale(60%)":"none",transition:"all .3s"}}/>
            {locked && (
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(0,0,0,.65)",padding:"6px 14px",borderRadius:ir}}>
                  <I.Lock/><span style={{color:"#fff",fontSize:12,fontWeight:700,fontFamily:f}}>Not yet available</span>
                </div>
              </div>
            )}
            {r.available && (
              <div style={{position:"absolute",top:10,right:10,background:green,color:"#fff",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:sr,fontFamily:f}}>Available</div>
            )}
          </div>

          {/* Content */}
          <div style={{padding:16}}>
            <h3 style={{fontSize:15,fontWeight:700,color:locked?tm:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>{r.name}</h3>
            <p style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.5,marginBottom:10}}>{r.desc}</p>

            {/* Linked assessments */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:600,color:tm,fontFamily:f,marginBottom:5}}>Based on {r.assessments.length === 1 ? "1 assessment" : `${r.assessments.length} assessments`}:</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {linkedNames.map((name,i) => {
                  const isDone = r.assessments[i] && allEx.find(e=>e.id===r.assessments[i])?.status === "complete";
                  return (
                    <span key={i} style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:5,fontFamily:f,
                      background:isDone?`${green}10`:dk?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",
                      color:isDone?green:tm}}>
                      {isDone&&"✓ "}{name}
                    </span>
                  );
                })}
              </div>
              {locked && <div style={{fontSize:11,color:tm,fontFamily:f,marginTop:5}}>{doneCount}/{r.assessments.length} assessments complete</div>}
            </div>

            {/* Meta */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:12,color:tm,fontFamily:f,display:"flex",alignItems:"center",gap:3}}><I.FileText/> {r.pages} pages</span>
            </div>

            {/* Actions */}
            {r.available ? (
              <div style={{display:"flex",gap:8}}>
                <Btn primary small onClick={() => setPreviewReport(r)}>Preview Report</Btn>
                <Btn small><I.Download/> Download PDF</Btn>
              </div>
            ) : (
              <div style={{padding:"8px 12px",background:dk?"rgba(255,255,255,.03)":"rgba(0,0,0,.02)",borderRadius:ir,fontSize:12,color:tm,fontFamily:f}}>
                Complete the required assessments to unlock this report.
              </div>
            )}
          </div>
        </div>
      );
    };

    const ProgramSection = ({label, reps}) => (
      <div style={{marginBottom:32,...(isE?eSep:{})}}>
        {isE ? <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>{label}</p>
         : <h2 style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:14}}>{label}</h2>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:14}}>
          {reps.map(r => <ReportCard key={r.id} r={r}/>)}
        </div>
      </div>
    );

    return (
      <div className="an" style={{maxWidth:isE?780:isB?900:720,margin:"0 auto",padding:isE?"40px 0 60px":"32px 0"}}>
        {isE ? <>
          <p style={{fontSize:13,fontWeight:600,color:teal,fontFamily:f,letterSpacing:.5,marginBottom:12}}>Insights</p>
          <h1 style={{fontSize:36,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-1,lineHeight:1.08,marginBottom:8}}>Your Assessment Reports</h1>
          <p style={{fontSize:16,color:ts,fontFamily:f,lineHeight:1.7,marginBottom:32}}>Review your personalized feedback and development insights.</p>
        </> : <>
          <h1 style={{fontSize:28,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>Insights</h1>
          <p style={{fontSize:15,color:ts,fontFamily:f,marginBottom:6}}>Your assessment reports and feedback.</p>
        </>}
        {!isE && <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:28}}>
          <span style={{fontSize:13,fontWeight:700,color:teal,background:tealBg,padding:"4px 10px",borderRadius:sr,fontFamily:f}}>{availCount} available</span>
          <span style={{fontSize:13,color:tm,fontFamily:f}}>{reports.length - availCount} pending</span>
        </div>}

        <ProgramSection label="Leadership Assessment 2026" reps={leadershipReports}/>
        {report360.length > 0 && <ProgramSection label="360° Perspective Feedback" reps={report360}/>}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  REPORT PREVIEW MODAL
  // ═══════════════════════════════════════

  const PreviewModal = () => {
    if (!previewReport) return null;
    const r = previewReport;
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
        onClick={() => setPreviewReport(null)}>
        <div className="td" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:780,height:"85vh",background:card,borderRadius:mr,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,.25)"}}>
          {/* Header */}
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:`${bdw} solid ${bd}`,flexShrink:0}}>
            <I.FileText/>
            <div style={{flex:1,minWidth:0}}>
              <h3 style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</h3>
              <span style={{fontSize:12,color:tm,fontFamily:f}}>{r.pages} pages</span>
            </div>
            <Btn small onClick={() => {}}><I.Download/> Download</Btn>
            <button onClick={() => setPreviewReport(null)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:6,borderRadius:ir}}><I.X/></button>
          </div>

          {/* Preview content — simulated */}
          <div style={{flex:1,overflow:"auto",padding:0}}>
            {/* Cover page */}
            <div style={{padding:"40px 32px",textAlign:"center",borderBottom:`${bdw} solid ${bd}`}}>
              <div style={{width:64,height:64,borderRadius:mr,background:navy,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2l2 8h-4l2-8z" fill="white" opacity=".9"/><rect x="10" y="10" width="4" height="10" rx="1" fill="white" opacity=".5"/></svg>
              </div>
              <h2 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:6}}>{r.name}</h2>
              <p style={{fontSize:14,color:ts,fontFamily:f,marginBottom:4}}>Prepared for Kshitij Lau</p>
              <p style={{fontSize:13,color:tm,fontFamily:f}}>Generated February 23, 2026 · Confidential</p>
            </div>

            {/* Simulated report pages */}
            <div style={{padding:"28px 32px"}}>
              <h3 style={{fontSize:16,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:12}}>Executive Summary</h3>
              <div style={{display:"flex",gap:12,marginBottom:20}}>
                {[{label:"Overall Score",val:"78",color:navy},{label:"Percentile",val:"82nd",color:teal},{label:"Risk Level",val:"Low",color:green}].map((m,i)=>(
                  <div key={i} style={{flex:1,background:dk?"rgba(255,255,255,.03)":"rgba(0,0,0,.02)",borderRadius:sr,padding:14,textAlign:"center"}}>
                    <div style={{fontSize:24,fontWeight:800,color:m.color,fontFamily:f}}>{m.val}</div>
                    <div style={{fontSize:11,color:tm,fontFamily:f,marginTop:2}}>{m.label}</div>
                  </div>
                ))}
              </div>

              <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.7,marginBottom:20}}>
                This report presents an integrated analysis of assessment results. The findings indicate strong performance across core leadership dimensions with specific development opportunities identified below.
              </p>

              <h3 style={{fontSize:16,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:12}}>Competency Breakdown</h3>
              {["behavioral","technical"].map(type => {
                const comps = idpCompetencies.filter(c=>c.type===type);
                return comps.length > 0 && (
                  <div key={type} style={{marginBottom:16}}>
                    <div style={{fontSize:10,fontWeight:700,color:type==="technical"?teal:purple,fontFamily:f,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>{type} Skills</div>
                    {comps.map((comp,i)=>(
                      <div key={i} style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:13,fontWeight:600,color:dk?"#fff":navy,fontFamily:f}}>{comp.label}</span>
                          <span style={{fontSize:13,fontWeight:700,color:comp.color,fontFamily:f}}>{comp.score}/100</span>
                        </div>
                        <ProgressBar pct={comp.score} color={comp.color} height={8}/>
                      </div>
                    ))}
                  </div>
                );
              })}

              <div style={{marginTop:24,padding:16,background:dk?"rgba(255,255,255,.03)":"rgba(0,0,0,.02)",borderRadius:sr,borderLeft:`3px solid ${teal}`}}>
                <h4 style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:6}}>Development Recommendations</h4>
                <p style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.6}}>
                  Focus on building influence skills in cross-functional settings. Consider seeking stretch assignments involving stakeholder management. Team development scores suggest investing in coaching capability — a formal coaching program could yield significant gains.
                </p>
              </div>

              <p style={{fontSize:12,color:tm,fontFamily:f,textAlign:"center",marginTop:32,paddingTop:16,borderTop:`${bdw} solid ${bd}`}}>
                This is a preview. Download the full PDF for complete findings, raw data, and appendices.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  SIDEBAR
  // ═══════════════════════════════════════

  const sbW = sbHidden?0:sbOpen?220:60;
  const SbItem = ({icon:Ic,label,active,dim,onClick}) => (
    <button onClick={dim?undefined:onClick} aria-current={active?"page":undefined}
      onMouseEnter={e=>{if(!active&&!dim&&isN)e.currentTarget.style.background=nHov;}}
      onMouseLeave={e=>{if(!active&&!dim)e.currentTarget.style.background="transparent";}}
      style={{display:"flex",alignItems:"center",gap:sbOpen?10:0,padding:sbOpen?"9px 14px":"9px 0",justifyContent:sbOpen?"flex-start":"center",borderRadius:sr,cursor:dim?"default":"pointer",border:"none",width:"100%",textAlign:"left",
        color:active?(dk?"#fff":navy):dim?`${tm}80`:ts,fontWeight:active?700:500,fontSize:14,fontFamily:f,
        background:active?(isN?(dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)"):navyBg):"transparent",
        ...(isN&&active?{borderLeft:`3px solid ${navy}`,paddingLeft:sbOpen?11:0}:{}),
        opacity:dim?.5:1,transition:"all .15s"}}>
      <Ic/>{sbOpen&&<span style={{flex:1,whiteSpace:"nowrap",overflow:"hidden"}}>{label}</span>}
    </button>
  );

  // ═══════════════════════════════════════
  //  DEVELOPMENT PAGE (landing)
  // ═══════════════════════════════════════

  const DevelopmentPage = () => (
    <div className="an" style={{maxWidth:isE?780:isB?900:720,margin:"0 auto",padding:isE?"40px 0 60px":"32px 0"}}>
      {isE ? <>
        <p style={{fontSize:13,fontWeight:600,color:teal,fontFamily:f,letterSpacing:.5,marginBottom:12}}>Growth</p>
        <h1 style={{fontSize:36,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-1,lineHeight:1.08,marginBottom:8}}>Development</h1>
        <p style={{fontSize:16,color:ts,fontFamily:f,lineHeight:1.7,marginBottom:32}}>Build a personalized growth plan based on your assessment insights.</p>
      </> : <>
        <h1 style={{fontSize:22,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>Development</h1>
        <p style={{fontSize:14,color:ts,fontFamily:f,marginBottom:28,lineHeight:1.5}}>Build a personalized growth plan based on your assessment insights.</p>
      </>}

      {/* My Plan card */}
      <div style={{...(isE?{...eSep,padding:0}:{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:22}),
        ...(isN?{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,padding:"18px 20px",borderLeft:nAccent}:{}),
        cursor:"pointer",transition:"border-color .2s"}} onClick={()=>{setIdpOpen(true);setIdpStep(0);setChatMsgsIdp([]);setChatQ(0);setUploadedFiles([]);setUserAnswers({});setLoadProgress(0);}} onMouseEnter={e=>{if(!isE)e.currentTarget.style.borderColor=teal;if(isN)e.currentTarget.style.background=nHov;}} onMouseLeave={e=>{if(!isE)e.currentTarget.style.borderColor=bd;if(isN)e.currentTarget.style.background=card;}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
          <div style={{width:44,height:44,borderRadius:cr,background:tealBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal,flexShrink:0}}>
            <I.Target/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:isE?20:16,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:3}}>My Plan</div>
            <p style={{fontSize:isE?15:13,color:ts,fontFamily:f,lineHeight:isE?1.7:1.5,marginBottom:14}}>Create your AI-powered Individual Development Plan. We'll walk you through your skill gaps, ask a few questions about your goals, and generate a tailored 70-20-10 growth plan.</p>
            <div style={{display:"flex",alignItems:"center",gap:6,color:teal,fontSize:13,fontWeight:700,fontFamily:f}}>
              Get Started <I.Arrow/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SCHEDULING PAGE
  // ═══════════════════════════════════════

  const schedulingData = [
    {
      programId:"leadership", programName:"Leadership Potential Assessment 2026", accent:navy,
      centers:[
        {id:"sim-sched",name:"Business Simulation Center",desc:"Strategic decision-making: market analysis, presentation, and crisis response. Live facilitators and observers present.",
          location:"Virtual — Zoom",duration:"90 min",icon:I.Monitor,color:navy,
          slots:[
            {id:"sl1",date:"Mar 10, 2026",day:"Monday",time:"9:00 AM – 10:30 AM",tz:"GST (UTC+4)",total:12,remaining:4,cancellation:true,cancelBefore:"48 hours"},
            {id:"sl2",date:"Mar 10, 2026",day:"Monday",time:"2:00 PM – 3:30 PM",tz:"GST (UTC+4)",total:12,remaining:8,cancellation:true,cancelBefore:"48 hours"},
            {id:"sl3",date:"Mar 12, 2026",day:"Wednesday",time:"9:00 AM – 10:30 AM",tz:"GST (UTC+4)",total:12,remaining:1,cancellation:false},
            {id:"sl4",date:"Mar 14, 2026",day:"Friday",time:"11:00 AM – 12:30 PM",tz:"GST (UTC+4)",total:15,remaining:15,cancellation:true,cancelBefore:"24 hours"},
            {id:"sl5",date:"Mar 18, 2026",day:"Tuesday",time:"9:00 AM – 10:30 AM",tz:"GST (UTC+4)",total:12,remaining:6,cancellation:true,cancelBefore:"48 hours"},
          ]},
        {id:"lac-sched",name:"Leadership Assessment Center",desc:"Full-day group assessment: group exercises, role plays, and case study presentations with trained observers.",
          location:"In-Person — Marsh Dubai Office, DIFC",duration:"4 hours",icon:I.Users,color:purple,
          slots:[
            {id:"sl6",date:"Mar 15, 2026",day:"Saturday",time:"9:00 AM – 1:00 PM",tz:"GST (UTC+4)",total:8,remaining:2,cancellation:false},
            {id:"sl7",date:"Mar 22, 2026",day:"Saturday",time:"9:00 AM – 1:00 PM",tz:"GST (UTC+4)",total:8,remaining:5,cancellation:true,cancelBefore:"72 hours"},
            {id:"sl8",date:"Mar 29, 2026",day:"Saturday",time:"9:00 AM – 1:00 PM",tz:"GST (UTC+4)",total:8,remaining:8,cancellation:true,cancelBefore:"72 hours"},
          ]},
      ]
    },
    {
      programId:"360", programName:"360° Perspective Feedback", accent:purple,
      centers:[
        {id:"cal-sched",name:"Calibration Session",desc:"Live calibration session with your manager and HR to discuss 360° feedback results and development priorities.",
          location:"Virtual — Microsoft Teams",duration:"60 min",icon:I.Users,color:teal,
          slots:[
            {id:"sl9",date:"Apr 2, 2026",day:"Wednesday",time:"10:00 AM – 11:00 AM",tz:"GST (UTC+4)",total:6,remaining:3,cancellation:true,cancelBefore:"24 hours"},
            {id:"sl10",date:"Apr 5, 2026",day:"Saturday",time:"11:00 AM – 12:00 PM",tz:"GST (UTC+4)",total:6,remaining:6,cancellation:true,cancelBefore:"24 hours"},
          ]},
      ]
    },
  ];

  const bookSlot = (slotId) => { setBookedSlots(p=>({...p,[slotId]:true})); setSchedConfirm(null); };
  const cancelSlot = (slotId) => { setBookedSlots(p=>{const n={...p};delete n[slotId];return n;}); setSchedCancel(null); };
  const getMyBookings = () => {
    const all = [];
    schedulingData.forEach(prog => prog.centers.forEach(c => c.slots.forEach(s => {
      if(bookedSlots[s.id]) all.push({...s,centerName:c.name,programName:prog.programName,centerId:c.id,cancellation:s.cancellation,cancelBefore:s.cancelBefore,location:c.location});
    })));
    return all;
  };

  // ═══════════════════════════════════════
  //  VIDEO ASSESSMENT PAGE (all design modes)
  // ═══════════════════════════════════════
  const VideoAssessPage = () => {
    const q = vaQuestions[vaCurQ];
    const answeredCount = Object.keys(vaAnswers).length;
    const isAnswered = !!vaAnswers[vaCurQ];
    const maxSec = q?.maxRecord||120;
    const recPct = Math.min((vaRecTime/maxSec)*100,100);
    const isPrepping = vaPrepCount>0&&!vaRecording&&!isAnswered;
    const diffColor = {"Warm-up":green,"Medium":warn,"Hard":"#EF4444"};
    const journeySteps = [{id:"journey",l:"Overview"},{id:"syscheck",l:"System Check"},{id:"ready",l:"Get Ready"},{id:"question",l:"Assessment"},{id:"complete",l:"Complete"}];
    const stepIdx = journeySteps.findIndex(s=>s.id===vaStep);

    // ── Journey sidebar (inside assessment) ──
    const JPanel = () => (
      <div style={{width:isE?220:200,background:dk?`${navy}20`:navy+"04",borderRight:`${bdw} solid ${bd}`,padding:"28px 16px",flexShrink:0,display:"flex",flexDirection:"column"}}>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:10,fontWeight:700,color:teal,fontFamily:f,letterSpacing:1,marginBottom:4}}>ASSESSMENT</div>
          <div style={{fontSize:15,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,lineHeight:1.2}}>Cognitive Ability</div>
          <div style={{fontSize:11,color:ts,fontFamily:f,marginTop:4}}>Video-Based · 35 min · Proctored</div>
        </div>
        <div style={{flex:1}}>
          {journeySteps.map((s,i)=>{
            const isCur=i===stepIdx,isDone=i<stepIdx;
            return(
              <div key={s.id} style={{display:"flex",gap:10,marginBottom:0}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:22}}>
                  <div style={{width:22,height:22,borderRadius:cr,background:isDone?green:isCur?teal:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",border:isCur?`2px solid ${teal}`:isDone?`2px solid ${green}`:`2px solid transparent`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {isDone?<I.Check/>:isCur?<div style={{width:6,height:6,borderRadius:3,background:isCur?teal:tm}}/>:<span style={{fontSize:8,fontWeight:700,color:tm,fontFamily:f}}>{i+1}</span>}
                  </div>
                  {i<journeySteps.length-1&&<div style={{flex:1,width:2,background:isDone?green+"40":dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",minHeight:24}}/>}
                </div>
                <div style={{paddingBottom:12}}><div style={{fontSize:12,fontWeight:isCur?700:500,color:isCur?teal:isDone?green:ts,fontFamily:f}}>{s.l}</div></div>
              </div>
            );
          })}
        </div>
        {vaTimerActive&&(
          <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,padding:12,marginTop:12}}>
            <div style={{fontSize:9,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1}}>TIME LEFT</div>
            <div style={{fontSize:22,fontWeight:800,color:vaTimer<300?"#EF4444":dk?"#fff":navy,fontFamily:f,fontVariantNumeric:"tabular-nums"}}>{vaFmt(vaTimer)}</div>
            <div style={{fontSize:10,color:ts,fontFamily:f}}>Q{vaCurQ+1}/{vaQuestions.length}</div>
          </div>
        )}
      </div>
    );

    // ── JOURNEY OVERVIEW ──
    if (vaStep==="journey") return (
      <div style={{display:"flex",height:"100%"}}>
        <JPanel/>
        <div style={{flex:1,overflow:"auto",padding:isE?"40px 48px":"28px 32px"}}>
          <BackBtn onClick={()=>setPg("tasks")} label="Back to tasks"/>
          <div style={{maxWidth:isE?640:isB?700:580}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:purpleBg,borderRadius:20,padding:"4px 14px",marginBottom:isE?20:14}}>
              <span style={{fontSize:11,fontWeight:700,color:purple,fontFamily:f}}>📹 VIDEO ASSESSMENT</span>
            </div>
            <h1 style={{fontSize:isE?32:isN?26:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:8,letterSpacing:isE?-.5:0}}>Cognitive Ability Test</h1>
            <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.6,marginBottom:isE?28:20}}>Video-based assessment with 5 questions. You'll have preparation time before each, then record your response on camera.</p>

            <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:isE?24:20,marginBottom:20}}>
              <h3 style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:14}}>What to expect</h3>
              <div style={{display:"grid",gridTemplateColumns:isB?"1fr 1fr":"1fr",gap:12}}>
                {[{icon:"📹",t:"5 Video Questions",d:"Record yourself answering each question on camera"},{icon:"⏱",t:"35 Minutes",d:"Preparation + recording time per question"},
                  {icon:"🔄",t:"One Attempt",d:"Each question recorded once — no retakes"},{icon:"🔒",t:"Proctored",d:"Camera active throughout the assessment"}
                ].map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:sr,background:dk?"rgba(255,255,255,.02)":bg,border:`${bdw} solid ${bd}`}}>
                    <span style={{fontSize:20}}>{item.icon}</span>
                    <div><div style={{fontSize:13,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>{item.t}</div><div style={{fontSize:11,color:ts,fontFamily:f,marginTop:1}}>{item.d}</div></div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:tealBg,border:`1px solid ${teal}20`,borderRadius:cr,padding:"14px 16px",marginBottom:24}}>
              <div style={{fontSize:12,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:6}}>Before you begin:</div>
              {["Stable internet (5+ Mbps)","Webcam and mic working","Quiet, well-lit room","Browser permissions enabled"].map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                  <div style={{width:5,height:5,borderRadius:3,background:teal,flexShrink:0}}/><span style={{fontSize:12,color:ts,fontFamily:f}}>{t}</span>
                </div>
              ))}
            </div>

            <Btn primary onClick={()=>{setVaStep("syscheck");vaStartSysCheck();}} style={{width:"100%",justifyContent:"center"}}>
              Start System Check <I.Arrow/>
            </Btn>
          </div>
        </div>
      </div>
    );

    // ── SYSTEM CHECK ──
    if (vaStep==="syscheck") {
      const sysItems=[{key:"internet",label:"Internet",icon:"🌐",pass:"Connected · 28 Mbps"},{key:"device",label:"Device",icon:"💻",pass:"Compatible"},{key:"camera",label:"Camera",icon:"📹",pass:"1080p detected"},{key:"mic",label:"Microphone",icon:"🎙",pass:"Input OK"}];
      const allPassed=Object.values(vaSysChecks).every(v=>v==="pass");
      return (
        <div style={{display:"flex",height:"100%"}}>
          <JPanel/>
          <div style={{flex:1,overflow:"auto",padding:isE?"40px 48px":"28px 32px"}}>
            <div style={{maxWidth:isE?540:480}}>
              <h2 style={{fontSize:isE?24:20,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:8}}>System Check</h2>
              <p style={{fontSize:13,color:ts,fontFamily:f,marginBottom:24}}>Verifying your device is ready.</p>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                {sysItems.map(c=>{
                  const st=vaSysChecks[c.key];
                  return(
                    <div key={c.key} style={{background:card,border:`${bdw} solid ${st==="pass"?`${green}30`:bd}`,borderRadius:cr,boxShadow:csh,padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
                      <div style={{width:40,height:40,borderRadius:sr,background:st==="pass"?`${green}12`:navyBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                        {st==="pass"?<I.Check/>:st==="checking"?<I.Spin/>:<span>{c.icon}</span>}
                      </div>
                      <span style={{flex:1,fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{c.label}</span>
                      <span style={{fontSize:11,fontWeight:700,color:st==="pass"?green:st==="checking"?teal:tm,fontFamily:f}}>{st==="pass"?c.pass:st==="checking"?"Checking...":"Pending"}</span>
                    </div>
                  );
                })}
              </div>
              {allPassed&&<div style={{background:`${green}08`,border:`1px solid ${green}20`,borderRadius:cr,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                <I.Check/><div><div style={{fontSize:13,fontWeight:700,color:green,fontFamily:f}}>All checks passed</div></div>
              </div>}
              <Btn primary disabled={!allPassed} onClick={()=>setVaStep("ready")} style={{width:"100%",justifyContent:"center",opacity:allPassed?1:.4}}>
                Continue <I.Arrow/>
              </Btn>
            </div>
          </div>
        </div>
      );
    }

    // ── READY ──
    if (vaStep==="ready") return (
      <div style={{display:"flex",height:"100%"}}>
        <JPanel/>
        <div style={{flex:1,overflow:"auto",display:"flex",alignItems:"center",justifyContent:"center",padding:32}}>
          <div style={{textAlign:"center",maxWidth:460}}>
            <div style={{width:60,height:60,borderRadius:cr,background:teal,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><span style={{fontSize:28}}>📹</span></div>
            <h2 style={{fontSize:isE?28:22,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:6}}>You're all set</h2>
            <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.6,marginBottom:28}}>
              <strong style={{color:dk?"#fff":navy}}>5 questions</strong>, <strong style={{color:dk?"#fff":navy}}>30s</strong> prep each, <strong style={{color:dk?"#fff":navy}}>35 min</strong> total. No retakes. Timer cannot be paused.
            </p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:24}}>
              {[{v:"5",l:"Questions"},{v:"30s",l:"Prep Each"},{v:"35m",l:"Total"}].map((m,i)=>(
                <div key={i} style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,padding:"14px 10px"}}>
                  <div style={{fontSize:22,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>{m.v}</div>
                  <div style={{fontSize:10,color:ts,fontFamily:f,marginTop:2}}>{m.l}</div>
                </div>
              ))}
            </div>
            <div style={{background:`${warn}08`,border:`1px solid ${warn}20`,borderRadius:cr,padding:"12px 14px",marginBottom:24,textAlign:"left"}}>
              <div style={{fontSize:11,fontWeight:700,color:warn,fontFamily:f,marginBottom:3}}>⚠ Important</div>
              <div style={{fontSize:12,color:ts,fontFamily:f,lineHeight:1.5}}>Once you begin, the timer starts and cannot be paused. Each question can only be recorded once.</div>
            </div>
            <Btn primary onClick={vaStartAssess} style={{width:"100%",justifyContent:"center"}}>Begin Assessment <I.Arrow/></Btn>
          </div>
        </div>
      </div>
    );

    // ── VIDEO QUESTIONS — SPLIT VIEW ──
    if (vaStep==="question"&&q) return (
      <div style={{display:"flex",height:"100%"}}>
        <JPanel/>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Progress bar */}
          <div style={{display:"flex",alignItems:"center",padding:"8px 24px",borderBottom:`${bdw} solid ${bd}`,background:dk?`${navy}20`:navy+"03",flexShrink:0,gap:10}}>
            <div style={{display:"flex",gap:3,flex:1}}>
              {vaQuestions.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<vaCurQ?green:i===vaCurQ?(isAnswered?green:vaRecording?"#EF4444":teal):dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"}}/>)}
            </div>
            <span style={{fontSize:11,fontWeight:700,color:ts,fontFamily:f}}>{answeredCount}/{vaQuestions.length}</span>
            <div style={{width:1,height:14,background:bd}}/>
            <span style={{fontSize:12,fontWeight:800,color:vaTimer<300?"#EF4444":dk?"#fff":navy,fontFamily:f,fontVariantNumeric:"tabular-nums"}}>{vaFmt(vaTimer)}</span>
          </div>

          {/* Split: camera left, question right */}
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>
            {/* LEFT: Camera */}
            <div style={{flex:1,display:"flex",flexDirection:"column",padding:"20px 20px 16px",background:dk?"#0a0e18":"#0d1117",minWidth:0}}>
              <div style={{flex:1,borderRadius:cr,overflow:"hidden",position:"relative",background:"linear-gradient(135deg,#1a1a2e,#16213e)",minHeight:0}}>
                {/* Silhouette */}
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{width:80,height:80,borderRadius:40,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Users/></div>
                </div>

                {/* Corner guides */}
                {[{top:12,left:12},{top:12,right:12},{bottom:12,left:12},{bottom:12,right:12}].map((pos,i)=>(
                  <div key={i} style={{position:"absolute",...pos,width:20,height:20,borderColor:vaRecording?"rgba(239,68,68,.5)":"rgba(255,255,255,.1)",borderWidth:2,borderStyle:"solid",
                    borderTopStyle:pos.top!==undefined?"solid":"none",borderBottomStyle:pos.bottom!==undefined?"solid":"none",
                    borderLeftStyle:pos.left!==undefined?"solid":"none",borderRightStyle:pos.right!==undefined?"solid":"none",
                    borderRadius:pos.top!==undefined&&pos.left!==undefined?"5px 0 0 0":pos.top!==undefined&&pos.right!==undefined?"0 5px 0 0":pos.bottom!==undefined&&pos.left!==undefined?"0 0 0 5px":"0 0 5px 0"}}/>
                ))}

                {/* REC badge */}
                {vaRecording&&<div style={{position:"absolute",top:16,left:16,display:"flex",alignItems:"center",gap:6,background:"rgba(239,68,68,.85)",borderRadius:8,padding:"5px 12px"}}>
                  <div style={{width:8,height:8,borderRadius:4,background:"#fff",animation:"pulse 1s ease infinite"}}/><span style={{fontSize:11,fontWeight:700,color:"#fff",fontFamily:f}}>REC {vaFmt(vaRecTime)}</span><span style={{fontSize:10,color:"rgba(255,255,255,.5)",fontFamily:f}}>/ {vaFmt(maxSec)}</span>
                </div>}

                {/* LIVE */}
                <div style={{position:"absolute",top:16,right:16,background:vaRecording?"rgba(239,68,68,.7)":green,borderRadius:8,padding:"4px 10px",fontSize:10,fontWeight:700,color:"#fff",fontFamily:f,display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:5,height:5,borderRadius:3,background:"#fff"}}/>LIVE
                </div>

                {/* Prep overlay */}
                {isPrepping&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.65)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:5}}>
                  <div style={{width:80,height:80,borderRadius:40,border:`3px solid ${teal}`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    <svg width="80" height="80" style={{position:"absolute",transform:"rotate(-90deg)"}}><circle cx="40" cy="40" r="37" fill="none" stroke={teal} strokeWidth="3" strokeDasharray={232} strokeDashoffset={232*(1-vaPrepCount/q.prepTime)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/></svg>
                    <span style={{fontSize:36,fontWeight:900,color:"#fff",fontFamily:f}}>{vaPrepCount}</span>
                  </div>
                  <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.4)",fontFamily:f,letterSpacing:1,marginTop:12}}>PREP TIME</div>
                  <button onClick={()=>setVaPrepCount(0)} style={{marginTop:12,padding:"6px 18px",borderRadius:sr,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.5)",fontSize:11,fontWeight:600,fontFamily:f,cursor:"pointer"}}>Skip & Record</button>
                </div>}

                {/* Answered overlay */}
                {isAnswered&&!vaRecording&&<div style={{position:"absolute",inset:0,background:"rgba(16,185,129,.1)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:5}}>
                  <div style={{width:56,height:56,borderRadius:28,background:green,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}><I.Check/></div>
                  <div style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:f}}>Recorded</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.4)",fontFamily:f,marginTop:3}}>{vaFmt(vaRecTime)}</div>
                </div>}

                {/* Progress bar */}
                {vaRecording&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:4,background:"rgba(255,255,255,.08)"}}>
                  <div style={{height:"100%",width:recPct+"%",background:recPct>80?"#EF4444":teal,transition:"width 1s linear"}}/>
                </div>}
              </div>

              {/* Controls */}
              <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:12}}>
                {!isAnswered&&!vaRecording&&!isPrepping&&<Btn primary onClick={vaStartRec} style={{flex:1,justifyContent:"center",background:"#EF4444"}}><div style={{width:12,height:12,borderRadius:6,background:"#fff"}}/>Start Recording</Btn>}
                {vaRecording&&<Btn primary onClick={vaStopRec} style={{flex:1,justifyContent:"center",background:"#EF4444"}}><div style={{width:12,height:12,borderRadius:2,background:"#fff"}}/>Stop Recording</Btn>}
                {isAnswered&&<Btn primary onClick={vaNextQ} style={{flex:1,justifyContent:"center"}}>{vaCurQ<vaQuestions.length-1?"Next Question":"Finish"} <I.Arrow/></Btn>}
                {isPrepping&&<div style={{flex:1}}/>}
                {/* Mic indicator */}
                <div style={{display:"flex",alignItems:"center",gap:3,padding:"8px 12px",borderRadius:sr,background:dk?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)",border:`${bdw} solid ${dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"}`}}>
                  <span style={{fontSize:12}}>🎙</span>
                  <div style={{display:"flex",gap:1,alignItems:"flex-end",height:14}}>
                    {[5,8,12,10,6,9,5].map((h,i)=><div key={i} style={{width:2,height:vaRecording?h:3,borderRadius:1,background:vaRecording?teal:tm+"40",transition:"height .15s"}}/>)}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Question details */}
            <div style={{width:isE?340:isB?320:300,borderLeft:`${bdw} solid ${bd}`,background:dk?cardBg2:bg,display:"flex",flexDirection:"column",overflow:"auto",flexShrink:0}}>
              <div style={{padding:"20px 20px 0"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                  <span style={{fontSize:10,fontWeight:700,color:purple,fontFamily:f,letterSpacing:1}}>Q{vaCurQ+1}/{vaQuestions.length}</span>
                  <span style={{fontSize:9,fontWeight:700,color:diffColor[q.difficulty]||tm,background:(diffColor[q.difficulty]||tm)+"12",padding:"2px 7px",borderRadius:4,fontFamily:f}}>{q.difficulty}</span>
                </div>
                <h2 style={{fontSize:isE?20:17,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:6,lineHeight:1.2}}>{q.title}</h2>
                <div style={{fontSize:9,fontWeight:700,color:teal,background:tealBg,padding:"2px 8px",borderRadius:5,fontFamily:f,display:"inline-block",marginBottom:14}}>{q.competency}</div>
              </div>

              {/* Prompt */}
              <div style={{margin:"0 20px 12px",background:dk?`${navy}20`:navy+"04",border:`${bdw} solid ${dk?navy+"30":navy+"0A"}`,borderRadius:cr,padding:"14px 16px"}}>
                <div style={{fontSize:9,fontWeight:700,color:navy,fontFamily:f,letterSpacing:1,marginBottom:4,opacity:.5}}>YOUR QUESTION</div>
                <p style={{fontSize:13,fontWeight:600,color:tx,fontFamily:f,lineHeight:1.5,margin:0}}>{q.prompt}</p>
              </div>

              {/* Context */}
              <div style={{margin:"0 20px 12px",padding:"12px 14px",background:tealBg,border:`1px solid ${teal}12`,borderRadius:sr}}>
                <div style={{fontSize:9,fontWeight:700,color:teal,fontFamily:f,letterSpacing:1,marginBottom:4}}>ASSESSING</div>
                <p style={{fontSize:11,color:ts,fontFamily:f,lineHeight:1.5,margin:0}}>{q.context}</p>
              </div>

              {/* Key points */}
              <div style={{margin:"0 20px 12px"}}>
                <div style={{fontSize:9,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1,marginBottom:8}}>KEY POINTS</div>
                {q.keyPoints.map((pt,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:6}}>
                    <div style={{width:18,height:18,borderRadius:sr,background:isAnswered?`${green}12`:dk?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                      {isAnswered?<I.Check/>:<span style={{fontSize:8,fontWeight:700,color:tm,fontFamily:f}}>{i+1}</span>}
                    </div>
                    <span style={{fontSize:11,fontWeight:600,color:tx,fontFamily:f,lineHeight:1.35}}>{pt}</span>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div style={{margin:"0 20px 12px",background:dk?"rgba(255,255,255,.02)":`${warn}04`,border:`1px solid ${warn}10`,borderRadius:sr,padding:"12px 14px"}}>
                <div style={{fontSize:9,fontWeight:700,color:warn,fontFamily:f,letterSpacing:1,marginBottom:6}}>💡 TIPS</div>
                {q.tips.map((t,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:5,marginBottom:i<q.tips.length-1?4:0}}>
                    <span style={{color:warn,fontSize:10,marginTop:1}}>→</span><span style={{fontSize:11,color:ts,fontFamily:f,lineHeight:1.4}}>{t}</span>
                  </div>
                ))}
              </div>

              {/* Question navigator */}
              <div style={{margin:"auto 20px 16px",paddingTop:12,borderTop:`${bdw} solid ${bd}`}}>
                <div style={{fontSize:9,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1,marginBottom:8}}>ALL QUESTIONS</div>
                {vaQuestions.map((vq,i)=>{
                  const done=!!vaAnswers[i],cur=i===vaCurQ;
                  return(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",borderRadius:sr,background:cur?(dk?teal+"10":teal+"06"):"transparent",marginBottom:2}}>
                      <div style={{width:18,height:18,borderRadius:9,background:done?green:cur?teal:dk?"rgba(255,255,255,.04)":"rgba(0,0,0,.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {done?<I.Check/>:<span style={{fontSize:8,fontWeight:700,color:cur?"#fff":tm,fontFamily:f}}>{i+1}</span>}
                      </div>
                      <span style={{flex:1,fontSize:11,fontWeight:cur?700:500,color:cur?teal:done?green:tx,fontFamily:f,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{vq.title}</span>
                      <span style={{fontSize:9,color:tm,fontFamily:f}}>{vaFmt(vq.maxRecord)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    // ── COMPLETE ──
    if (vaStep==="complete") return (
      <div style={{display:"flex",height:"100%"}}>
        <JPanel/>
        <div style={{flex:1,overflow:"auto",display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
          <div style={{textAlign:"center",maxWidth:460}}>
            <div style={{width:72,height:72,borderRadius:36,background:green,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",boxShadow:`0 6px 24px ${green}30`}}><I.Check/></div>
            <h2 style={{fontSize:isE?30:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:6}}>Assessment Complete</h2>
            <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.6,marginBottom:28}}>Your video responses have been submitted. Results will be available once reviewed and scored.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:28}}>
              {[{v:"5/5",l:"Answered",c:green},{v:vaFmt(35*60-vaTimer),l:"Time Used",c:teal},{v:"Submitted",l:"Status",c:purple}].map((m,i)=>(
                <div key={i} style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,padding:"14px 10px"}}>
                  <div style={{fontSize:20,fontWeight:800,color:m.c,fontFamily:f}}>{m.v}</div>
                  <div style={{fontSize:10,color:ts,fontFamily:f,marginTop:2}}>{m.l}</div>
                </div>
              ))}
            </div>
            <div style={{background:tealBg,border:`1px solid ${teal}15`,borderRadius:cr,padding:"14px 16px",marginBottom:24,textAlign:"left"}}>
              <div style={{fontSize:12,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:6}}>What happens next?</div>
              {["Responses being processed by assessors","Results available in 5–7 business days","Email notification when report is ready","Report appears in Insights tab"].map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:3}}>
                  <span style={{color:teal,fontSize:11}}>→</span><span style={{fontSize:11,color:ts,fontFamily:f,lineHeight:1.4}}>{t}</span>
                </div>
              ))}
            </div>
            <Btn primary onClick={()=>setPg("tasks")} style={{width:"100%",justifyContent:"center"}}>Return to Program <I.Arrow/></Btn>
          </div>
        </div>
      </div>
    );

    return null;
  };

  const SchedulingPage = () => {
    const myBookings = getMyBookings();
    const selCenterData = schedView ? schedulingData.flatMap(p=>p.centers).find(c=>c.id===schedView) : null;
    const selCenterProg = schedView ? schedulingData.find(p=>p.centers.some(c=>c.id===schedView)) : null;

    return (
      <div className="an" style={{maxWidth:isE?780:isB?900:720,margin:"0 auto",padding:isE?"40px 0 60px":"32px 0"}}>

        {/* ── CENTER DETAIL VIEW ── */}
        {selCenterData ? (<>
          <BackBtn onClick={()=>setSchedView(null)} label="All assessment centers"/>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <div style={{width:48,height:48,borderRadius:cr,background:`${selCenterData.color}10`,display:"flex",alignItems:"center",justifyContent:"center",color:selCenterData.color,flexShrink:0}}>
              <selCenterData.icon/>
            </div>
            <div>
              <h1 style={{fontSize:isE?24:20,fontWeight:800,color:dk?"#fff":navy,fontFamily:fh,marginBottom:2}}>{selCenterData.name}</h1>
              <div style={{fontSize:13,color:ts,fontFamily:fb}}>{selCenterProg?.programName}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:ts,fontFamily:fb}}><I.Monitor/> {selCenterData.location}</div>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:ts,fontFamily:fb}}><I.Clock/> {selCenterData.duration}</div>
          </div>
          <p style={{fontSize:14,color:ts,fontFamily:fb,lineHeight:1.6,marginBottom:24,...(isE?eSep:{})}}>{selCenterData.desc}</p>

          {isE && <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:fb,letterSpacing:1.5,textTransform:"uppercase",marginBottom:16}}>Available Slots</p>}
          {!isE && <h3 style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:12}}>Available Slots</h3>}

          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {selCenterData.slots.map(slot => {
              const isBooked = bookedSlots[slot.id];
              const isFull = slot.remaining <= 0 && !isBooked;
              const isLow = slot.remaining <= 2 && slot.remaining > 0;
              return (
                <div key={slot.id} style={{background:isBooked?(dk?`${green}12`:`${green}06`):card,border:`${bdw} solid ${isBooked?`${green}30`:bd}`,borderRadius:cr,boxShadow:csh,padding:"16px 18px",
                  ...(isN&&!isBooked?{borderLeft:nAccent}:{}),opacity:isFull?.55:1,transition:"all .15s"
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{textAlign:"center",width:52,flexShrink:0}}>
                      <div style={{fontSize:10,fontWeight:700,color:tm,fontFamily:fb,textTransform:"uppercase",letterSpacing:.5}}>{slot.day.slice(0,3)}</div>
                      <div style={{fontSize:22,fontWeight:800,color:dk?"#fff":navy,fontFamily:fb,lineHeight:1.1}}>{slot.date.split(" ")[1]?.replace(",","")}</div>
                      <div style={{fontSize:10,color:tm,fontFamily:fb}}>{slot.date.split(" ")[0]}</div>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:fb,marginBottom:3}}>{slot.time}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:tm,fontFamily:fb}}>{slot.tz}</span>
                        <span style={{fontSize:11,fontWeight:700,color:isLow?red:slot.remaining===slot.total?green:ts,fontFamily:fb}}>
                          {slot.remaining}/{slot.total} seats {isLow?"— filling fast":""}
                        </span>
                        {slot.cancellation ? (
                          <span style={{fontSize:10,fontWeight:600,color:teal,background:tealBg,padding:"2px 8px",borderRadius:sr,fontFamily:fb}}>Cancel OK ({slot.cancelBefore})</span>
                        ) : (
                          <span style={{fontSize:10,fontWeight:600,color:red,background:`${red}08`,padding:"2px 8px",borderRadius:sr,fontFamily:fb}}>No cancellation</span>
                        )}
                      </div>
                    </div>
                    <div style={{flexShrink:0}}>
                      {isBooked ? (
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:12,fontWeight:700,color:green,fontFamily:fb,display:"flex",alignItems:"center",gap:4}}><I.Check/> Booked</span>
                          {slot.cancellation && <button onClick={()=>setSchedCancel(slot)} style={{fontSize:11,fontWeight:600,color:red,background:"none",border:`${bdw} solid ${red}30`,borderRadius:br,padding:"5px 10px",cursor:"pointer",fontFamily:fb}}>Cancel</button>}
                        </div>
                      ) : isFull ? (
                        <span style={{fontSize:12,fontWeight:700,color:tm,fontFamily:fb}}>Full</span>
                      ) : (
                        <Btn primary small onClick={()=>setSchedConfirm(slot)}>Book Slot</Btn>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>) : (<>

          {/* ── OVERVIEW LIST ── */}
          {isE ? <>
            <p style={{fontSize:13,fontWeight:600,color:teal,fontFamily:fb,letterSpacing:.5,marginBottom:12}}>Scheduling</p>
            <h1 style={{fontSize:36,fontWeight:800,color:dk?"#fff":navy,fontFamily:fh,letterSpacing:-1,lineHeight:1.08,marginBottom:8}}>Assessment Center Slots</h1>
            <p style={{fontSize:16,color:ts,fontFamily:fb,lineHeight:1.7,marginBottom:20}}>Browse available time slots and book your assessment center sessions.</p>
          </> : <>
            <h1 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>Scheduling</h1>
            <p style={{fontSize:14,color:ts,fontFamily:f,marginBottom:16}}>Book assessment center sessions for your active programs.</p>
          </>}

          {/* List / Calendar toggle */}
          <div style={{display:"flex",gap:4,marginBottom:20,background:dk?"rgba(255,255,255,.04)":bg2,borderRadius:cr,padding:3,width:"fit-content"}}>
            <button onClick={()=>setSchedCalView(false)} style={{padding:"6px 14px",borderRadius:sr,fontSize:12,fontWeight:!schedCalView?700:500,fontFamily:f,cursor:"pointer",border:"none",
              background:!schedCalView?card:"transparent",color:!schedCalView?(dk?"#fff":navy):tm,boxShadow:!schedCalView?csh:"none",transition:"all .15s",display:"flex",alignItems:"center",gap:5}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              List
            </button>
            <button onClick={()=>setSchedCalView(true)} style={{padding:"6px 14px",borderRadius:sr,fontSize:12,fontWeight:schedCalView?700:500,fontFamily:f,cursor:"pointer",border:"none",
              background:schedCalView?card:"transparent",color:schedCalView?(dk?"#fff":navy):tm,boxShadow:schedCalView?csh:"none",transition:"all .15s",display:"flex",alignItems:"center",gap:5}}>
              <I.Cal/>
              Calendar
            </button>
          </div>

          {/* ── CALENDAR VIEW ── */}
          {schedCalView && (() => {
            const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            const year = 2026;
            const month = schedCalMonth;
            const firstDay = new Date(year,month,1).getDay();
            const daysInMonth = new Date(year,month+1,0).getDate();
            const allSlots = schedulingData.flatMap(p=>p.centers.flatMap(c=>c.slots.map(s=>({...s,centerName:c.name,centerColor:c.color,programName:p.programName,centerId:c.id,loc:c.location,dur:c.duration}))));
            const slotsForDay = (d) => allSlots.filter(s => {
              const parts = s.date.split(" ");
              const m = monthNames.indexOf(parts[0]);
              const day = parseInt(parts[1]);
              return m === month && day === d;
            });
            const today = new Date();
            const isToday = (d) => today.getFullYear()===year && today.getMonth()===month && today.getDate()===d;

            return (
              <div className="an2" style={{marginBottom:24}}>
                {/* Month nav */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <button onClick={()=>setSchedCalMonth(Math.max(1,schedCalMonth-1))} style={{padding:"6px 10px",borderRadius:ir,background:card,border:`${bdw} solid ${bd}`,cursor:"pointer",color:ts,fontFamily:f}}><I.Back/></button>
                  <h3 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>{monthNames[month]} {year}</h3>
                  <button onClick={()=>setSchedCalMonth(Math.min(4,schedCalMonth+1))} style={{padding:"6px 10px",borderRadius:ir,background:card,border:`${bdw} solid ${bd}`,cursor:"pointer",color:ts,fontFamily:f}}><I.ChevR/></button>
                </div>
                {/* Day headers */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
                    <div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:tm,fontFamily:fb,padding:"4px 0",textTransform:"uppercase",letterSpacing:.5}}>{d}</div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
                  {Array.from({length:firstDay}).map((_,i)=><div key={"e"+i}/>)}
                  {Array.from({length:daysInMonth}).map((_,i)=>{
                    const d = i+1;
                    const daySlots = slotsForDay(d);
                    const hasSlots = daySlots.length > 0;
                    const hasBooked = daySlots.some(s=>bookedSlots[s.id]);
                    return (
                      <div key={d} onClick={hasSlots?()=>{
                        const firstCenter = daySlots[0]?.centerId;
                        if(firstCenter) setSchedView(firstCenter);
                      }:undefined}
                      style={{minHeight:52,padding:"4px 6px",borderRadius:ir,background:hasBooked?`${green}08`:hasSlots?(dk?`${navy}12`:`${navy}04`):card,
                        border:`1px solid ${isToday(d)?teal:hasSlots?(dk?`${navy}30`:`${navy}12`):"transparent"}`,
                        cursor:hasSlots?"pointer":"default",transition:"all .15s",position:"relative"
                      }}
                      onMouseEnter={e=>{if(hasSlots)e.currentTarget.style.borderColor=teal;}}
                      onMouseLeave={e=>{if(hasSlots)e.currentTarget.style.borderColor=isToday(d)?teal:hasSlots?(dk?`${navy}30`:`${navy}12`):"transparent";}}>
                        <div style={{fontSize:12,fontWeight:isToday(d)?800:hasSlots?700:400,color:isToday(d)?teal:hasSlots?(dk?"#fff":navy):tm,fontFamily:fb}}>{d}</div>
                        {hasSlots && (
                          <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:2}}>
                            {daySlots.map(s=>(
                              <div key={s.id} title={`${s.centerName} · ${s.time}`}
                                style={{width:7,height:7,borderRadius:4,background:hasBooked&&bookedSlots[s.id]?green:s.centerColor,border:bookedSlots[s.id]?`1px solid ${green}`:"none"}}/>
                            ))}
                          </div>
                        )}
                        {hasSlots && <div style={{fontSize:8,color:tm,fontFamily:fb,marginTop:1}}>{daySlots.length} slot{daySlots.length>1?"s":""}</div>}
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div style={{display:"flex",gap:14,marginTop:12,flexWrap:"wrap"}}>
                  {schedulingData.flatMap(p=>p.centers).map(c=>(
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:ts,fontFamily:fb}}>
                      <div style={{width:8,height:8,borderRadius:4,background:c.color}}/>{c.name}
                    </div>
                  ))}
                  <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:green,fontWeight:600,fontFamily:fb}}>
                    <div style={{width:8,height:8,borderRadius:4,background:green,border:`1px solid ${green}`}}/> Booked
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── LIST VIEW ── */}
          {!schedCalView && <>

          {/* My Bookings */}
          {myBookings.length > 0 && (
            <div className="an2" style={{marginBottom:24,...(isE?eSep:{})}}>
              {isE ? <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:fb,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>My Bookings</p>
                : <h3 style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:10}}>My Bookings</h3>}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {myBookings.map(b => (
                  <div key={b.id} style={{background:card,border:`${bdw} solid ${green}25`,borderRadius:cr,boxShadow:csh,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,
                    ...(isN?{borderLeft:`3px solid ${green}`}:{})
                  }}>
                    <div style={{width:40,height:40,borderRadius:ir,background:`${green}10`,display:"flex",alignItems:"center",justifyContent:"center",color:green,flexShrink:0}}>
                      <I.Check/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:fb}}>{b.centerName}</div>
                      <div style={{fontSize:12,color:ts,fontFamily:fb}}>{b.date} · {b.time} · {b.location}</div>
                    </div>
                    {b.cancellation ? (
                      <button onClick={()=>setSchedCancel(b)} style={{fontSize:11,fontWeight:600,color:red,background:"none",border:`${bdw} solid ${red}30`,borderRadius:br,padding:"5px 10px",cursor:"pointer",fontFamily:fb}}>Cancel</button>
                    ) : (
                      <span style={{fontSize:10,fontWeight:600,color:tm,fontFamily:fb}}>Non-cancellable</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Programs → Centers */}
          {schedulingData.map((prog,pi) => (
            <div key={prog.programId} className={pi===0?"an2":"an3"} style={{marginBottom:28,...(isE&&pi>0?eSep:{})}}>
              {isE ? <p style={{fontSize:11,fontWeight:700,color:prog.accent,fontFamily:fb,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>{prog.programName}</p>
                : <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <div style={{width:6,height:6,borderRadius:3,background:prog.accent}}/>
                    <h3 style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>{prog.programName}</h3>
                  </div>}

              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {prog.centers.map(center => {
                  const bookedInCenter = center.slots.filter(s=>bookedSlots[s.id]).length;
                  const totalRemaining = center.slots.reduce((a,s)=>a+s.remaining,0);
                  const nextSlot = center.slots.find(s=>s.remaining>0 && !bookedSlots[s.id]);
                  return (
                    <div key={center.id} onClick={()=>setSchedView(center.id)} style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:isN?"16px 18px":"18px 20px",cursor:"pointer",transition:"all .15s",
                      ...(isN?{borderLeft:`3px solid ${center.color}`}:{})
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=`${center.color}40`;if(isN)e.currentTarget.style.background=nHov;}} 
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=bd;if(isN)e.currentTarget.style.background=card;}}>
                      <div style={{display:"flex",alignItems:"center",gap:14}}>
                        <div style={{width:44,height:44,borderRadius:cr,background:`${center.color}10`,display:"flex",alignItems:"center",justifyContent:"center",color:center.color,flexShrink:0}}>
                          <center.icon/>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:isE?17:16,fontWeight:isE?700:800,color:dk?"#fff":navy,fontFamily:isE?fh:f,marginBottom:3}}>{center.name}</div>
                          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                            <span style={{fontSize:12,color:ts,fontFamily:fb}}>{center.location}</span>
                            <span style={{fontSize:12,color:ts,fontFamily:fb}}>·</span>
                            <span style={{fontSize:12,color:ts,fontFamily:fb}}>{center.duration}</span>
                            <span style={{fontSize:12,color:ts,fontFamily:fb}}>·</span>
                            <span style={{fontSize:12,fontWeight:600,color:totalRemaining<=5?orange:ts,fontFamily:fb}}>{center.slots.length} slots · {totalRemaining} seats open</span>
                          </div>
                          {bookedInCenter > 0 && <div style={{fontSize:11,fontWeight:700,color:green,fontFamily:fb,marginTop:4,display:"flex",alignItems:"center",gap:4}}><I.Check/> {bookedInCenter} booked</div>}
                          {!bookedInCenter && nextSlot && <div style={{fontSize:11,color:tm,fontFamily:fb,marginTop:4}}>Next: {nextSlot.date} at {nextSlot.time.split("–")[0].trim()}</div>}
                        </div>
                        <I.ChevR style={{color:tm,flexShrink:0}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>}
        </>)}

        {/* ── BOOKING CONFIRMATION MODAL ── */}
        {schedConfirm && (
          <div style={{position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div onClick={()=>setSchedConfirm(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}}/>
            <div className="td" style={{position:"relative",width:440,background:card,borderRadius:mr,overflow:"hidden",border:`${bdw} solid ${bd}`,boxShadow:`0 24px 80px rgba(0,0,0,.15)`}}>
              <div style={{padding:"16px 20px",borderBottom:`${bdw} solid ${bd}`,display:"flex",alignItems:"center"}}>
                <span style={{flex:1,fontSize:16,fontWeight:800,color:dk?"#fff":navy,fontFamily:fh}}>Confirm Booking</span>
                <button onClick={()=>setSchedConfirm(null)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button>
              </div>
              <div style={{padding:20}}>
                <div style={{background:dk?"rgba(255,255,255,.03)":bg,borderRadius:cr,padding:16,marginBottom:16}}>
                  <div style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:fb,marginBottom:8}}>{schedConfirm.date} — {schedConfirm.day}</div>
                  <div style={{fontSize:14,color:ts,fontFamily:fb,marginBottom:4}}>{schedConfirm.time}</div>
                  <div style={{fontSize:12,color:tm,fontFamily:fb}}>{schedConfirm.tz}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span style={{fontSize:12,fontWeight:600,color:ts,fontFamily:fb}}>{schedConfirm.remaining} seats remaining of {schedConfirm.total}</span>
                </div>
                {!schedConfirm.cancellation && (
                  <div style={{background:`${red}08`,border:`${bdw} solid ${red}20`,borderRadius:cr,padding:"10px 14px",marginBottom:16,display:"flex",gap:8,alignItems:"flex-start"}}>
                    <I.Info style={{color:red,flexShrink:0,marginTop:1}}/>
                    <div style={{fontSize:12,color:dk?"#ffb0b0":red,fontFamily:fb,lineHeight:1.5}}>
                      <span style={{fontWeight:700}}>Non-cancellable.</span> This slot cannot be cancelled once booked. Please make sure you can attend.
                    </div>
                  </div>
                )}
                {schedConfirm.cancellation && (
                  <div style={{background:tealBg,border:`${bdw} solid ${teal}20`,borderRadius:cr,padding:"10px 14px",marginBottom:16,fontSize:12,color:dk?"#b8e0d9":teal,fontFamily:fb,lineHeight:1.5}}>
                    Free cancellation up to <span style={{fontWeight:700}}>{schedConfirm.cancelBefore}</span> before the session.
                  </div>
                )}
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <Btn onClick={()=>setSchedConfirm(null)} style={{color:ts}}>Cancel</Btn>
                  <Btn primary onClick={()=>bookSlot(schedConfirm.id)}><I.Check/> Confirm Booking</Btn>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CANCEL CONFIRMATION MODAL ── */}
        {schedCancel && (
          <div style={{position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div onClick={()=>setSchedCancel(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}}/>
            <div className="td" style={{position:"relative",width:420,background:card,borderRadius:mr,overflow:"hidden",border:`${bdw} solid ${bd}`,boxShadow:`0 24px 80px rgba(0,0,0,.15)`}}>
              <div style={{padding:"16px 20px",borderBottom:`${bdw} solid ${bd}`,display:"flex",alignItems:"center"}}>
                <span style={{flex:1,fontSize:16,fontWeight:800,color:red,fontFamily:fh}}>Cancel Booking</span>
                <button onClick={()=>setSchedCancel(null)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button>
              </div>
              <div style={{padding:20}}>
                <p style={{fontSize:14,color:ts,fontFamily:fb,lineHeight:1.6,marginBottom:16}}>
                  Are you sure you want to cancel your booking for <span style={{fontWeight:700,color:dk?"#fff":navy}}>{schedCancel.date}</span> at <span style={{fontWeight:700,color:dk?"#fff":navy}}>{schedCancel.time}</span>?
                </p>
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <Btn onClick={()=>setSchedCancel(null)} style={{color:ts}}>Keep Booking</Btn>
                  <Btn onClick={()=>cancelSlot(schedCancel.id)} style={{background:`${red}12`,color:red,border:`${bdw} solid ${red}30`}}>Yes, Cancel</Btn>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  IDP FULL-SCREEN FLOW
  // ═══════════════════════════════════════

  const stepLabels = ["Introduction","Skill Gap Report","Preferences","Summary","Creating Plan"];
  const totalSteps = stepLabels.length;

  const IdpFullScreen = () => {
    const chatEndRef = useRef(null);
    useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({behavior:"smooth"}); }, [chatMsgsIdp, chatTyping]);

    // ── Step indicator ──
    const StepBar = () => (
      <div style={{display:"flex",alignItems:"center",gap:0,padding:"0 4px"}}>
        {stepLabels.map((label, i) => {
          const done = idpStep > i;
          const active = idpStep === i;
          return (
            <React.Fragment key={i}>
              {i > 0 && <div style={{flex:1,height:2,background:done?teal:(dk?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"),margin:"0 4px",maxWidth:40,transition:"background .3s"}}/>}
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:22,height:22,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,fontFamily:f,flexShrink:0,transition:"all .3s",
                  background:done?teal:active?`${teal}18`:"transparent",
                  color:done?"#fff":active?teal:tm,
                  border:done?"none":active?`2px solid ${teal}`:`1.5px solid ${dk?"rgba(255,255,255,.12)":"rgba(0,0,0,.1)"}`
                }}>
                  {done ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : i+1}
                </div>
                <span style={{fontSize:11,fontWeight:active?700:500,color:active?(dk?"#fff":navy):tm,fontFamily:f,display:"none"}} className="step-label">{label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );

    // ── Settings dropdown (shared between wizard & plan) ──
    const SettingsGear = () => (
      <div style={{position:"relative"}}>
        <button onClick={()=>setIdpSettingsOpen(!idpSettingsOpen)} style={{width:34,height:34,borderRadius:sr,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:idpSettingsOpen?teal:ts,background:idpSettingsOpen?(dk?`${teal}1F`:`${teal}0F`):"none",border:`1px solid ${idpSettingsOpen?`${teal}40`:bd}`,transition:"all .15s"}}>
          <I.Gear/>
        </button>
        {idpSettingsOpen && <>
          <div onClick={()=>setIdpSettingsOpen(false)} style={{position:"fixed",inset:0,zIndex:2999}}/>
          <div style={{position:"absolute",right:0,top:40,width:200,background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,boxShadow:`0 12px 40px rgba(0,0,0,.12)`,zIndex:3000,overflow:"hidden",padding:4}}>
            {/* Dark mode */}
            <button onClick={()=>{setDk(!dk);setIdpSettingsOpen(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:ir,border:"none",background:"none",cursor:"pointer",textAlign:"left",color:tx,fontFamily:f,fontSize:13}}>
              <div style={{width:28,height:28,borderRadius:ir,background:dk?`${orange}12`:navyBg,display:"flex",alignItems:"center",justifyContent:"center",color:dk?orange:navy}}>
                {dk ? <I.Sun/> : <I.Moon/>}
              </div>
              <div>
                <div style={{fontWeight:600}}>{dk ? "Light Mode" : "Dark Mode"}</div>
                <div style={{fontSize:10,color:tm}}>Switch appearance</div>
              </div>
            </button>
            {/* Language */}
            <button onClick={()=>{const langs=["EN","AR","FR","ES","ZH","HI"];const ci=langs.indexOf(selLang);setSelLang(langs[(ci+1)%langs.length]);setIdpSettingsOpen(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:ir,border:"none",background:"none",cursor:"pointer",textAlign:"left",color:tx,fontFamily:f,fontSize:13}}>
              <div style={{width:28,height:28,borderRadius:ir,background:tealBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal}}>
                <I.Globe/>
              </div>
              <div>
                <div style={{fontWeight:600}}>Language</div>
                <div style={{fontSize:10,color:tm}}>{({EN:"English",AR:"العربية",FR:"Français",ES:"Español",ZH:"中文",HI:"हिन्दी"})[selLang]}</div>
              </div>
            </button>
            {/* Design Mode */}
            <div style={{padding:"6px 12px 10px"}}>
              <div style={{fontSize:11,fontWeight:700,color:tm,fontFamily:fb,marginBottom:6}}>Design Mode</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {["scrolly","bento","editorial","notion","m3"].map(m=>(
                  <button key={m} onClick={()=>{setDesignMode(m);setIdpSettingsOpen(false);}} style={{padding:"6px 10px",borderRadius:ir,cursor:"pointer",fontSize:12,fontWeight:designMode===m?700:500,fontFamily:fb,
                    background:designMode===m?(dk?`${teal}18`:tealBg):"transparent",
                    color:designMode===m?teal:ts,border:designMode===m?`1px solid ${teal}30`:`${bdw} solid ${bd}`,
                    textAlign:"left",transition:"all .15s",display:"flex",alignItems:"center",gap:8
                  }}>
                    <span style={{width:6,height:6,borderRadius:3,background:designMode===m?teal:tm+"40",flexShrink:0}}/> {mLabel[m]}
                  </button>
                ))}
              </div>
            </div>
            {/* Color Theme */}
            <div style={{padding:"2px 12px 10px"}}>
              <div style={{fontSize:11,fontWeight:700,color:tm,fontFamily:fb,marginBottom:6}}>Color Theme</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {colorPresets.map((cp,i)=>{
                  const active = primaryColor===cp.navy && accentColor===cp.teal;
                  return (
                    <button key={i} onClick={()=>{setPrimaryColor(cp.navy);setAccentColor(cp.teal);}} title={cp.label}
                      style={{width:26,height:26,borderRadius:13,cursor:"pointer",border:active?`2px solid ${dk?"#fff":"#333"}`:`1.5px solid ${bd}`,padding:0,background:"none",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                      <div style={{width:20,height:20,borderRadius:10,overflow:"hidden",display:"flex"}}>
                        <div style={{width:"50%",height:"100%",background:cp.navy}}/>
                        <div style={{width:"50%",height:"100%",background:cp.teal}}/>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>}
      </div>
    );

    // ── Top bar ──
    const TopBar = () => (
      <div style={{height:56,display:"flex",alignItems:"center",padding:"0 20px",gap:14,flexShrink:0,borderBottom:`${bdw} solid ${bd}`,background:dk?`${navy}80`:`${navy}08`}}>
        <button onClick={()=>{setIdpOpen(false);setIdpSettingsOpen(false);}} style={{width:34,height:34,borderRadius:sr,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:ts,background:"none",border:`${bdw} solid ${bd}`}}>
          <I.X/>
        </button>
        <div style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>Individual Development Plan</div>
        <div style={{flex:1}}/>
        <StepBar/>
        <SettingsGear/>
      </div>
    );

    // ════════════ STEP 0: INTRO ════════════
    const IntroStep = () => (
      <div className="an" style={{maxWidth:560,margin:"0 auto",padding:"48px 20px",textAlign:"center"}}>
        <div style={{width:64,height:64,borderRadius:mr,background:tealBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal,margin:"0 auto 20px"}}>
          <I.Target/>
        </div>
        <h1 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:8}}>Your Individual Development Plan</h1>
        <p style={{fontSize:15,color:ts,fontFamily:f,lineHeight:1.7,marginBottom:28,maxWidth:480,margin:"0 auto 28px"}}>
          An IDP is your personalized roadmap for professional growth. Based on your assessment results, we'll identify your strengths and development areas, understand your goals, and create a structured plan using the proven 70-20-10 learning model.
        </p>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:32,textAlign:"left"}}>
          {[
            {icon:I.Chart,label:"70% Experience",desc:"On-the-job learning through stretch assignments and projects"},
            {icon:I.Users,label:"20% Social",desc:"Learning from others via coaching, mentoring, and feedback"},
            {icon:I.Book,label:"10% Formal",desc:"Structured courses, certifications, and reading materials"},
          ].map((item,i) => (
            <div key={i} style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:14}}>
              <div style={{color:teal,marginBottom:8}}><item.icon/></div>
              <div style={{fontSize:13,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>{item.label}</div>
              <div style={{fontSize:12,color:ts,fontFamily:f,lineHeight:1.5}}>{item.desc}</div>
            </div>
          ))}
        </div>

        <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:16,marginBottom:32,textAlign:"left"}}>
          <div style={{fontSize:13,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:8}}>What to expect</div>
          {["Review your skill gap report from your assessment","Answer a few questions about your goals and preferences","Optionally upload manager feedback or self-assessments","Get an AI-generated plan tailored to you"].map((t,i) => (
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<3?8:0}}>
              <div style={{width:20,height:20,borderRadius:sr,background:tealBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal,flexShrink:0,marginTop:1,fontSize:10,fontWeight:800,fontFamily:f}}>{i+1}</div>
              <span style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.5}}>{t}</span>
            </div>
          ))}
        </div>

        <Btn primary onClick={()=>setIdpStep(1)}>Begin <I.Arrow/></Btn>
      </div>
    );

    // ════════════ STEP 1: SKILL GAP REPORT ════════════
    const SkillGapStep = () => (
      <div className="an" style={{maxWidth:560,margin:"0 auto",padding:"36px 20px"}}>
        <h2 style={{fontSize:20,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>Your Skill Gap Report</h2>
        <p style={{fontSize:14,color:ts,fontFamily:f,marginBottom:24,lineHeight:1.5}}>Here's a snapshot of your competency scores from the Leadership Assessment. These results form the foundation of your development plan.</p>

        <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:20,marginBottom:16}}>
          {idpCompetencies.map((c,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<idpCompetencies.length-1?14:0}}>
              <div style={{width:130,fontSize:13,fontWeight:600,color:ts,fontFamily:f,flexShrink:0,textAlign:"right"}}>{c.label}</div>
              <div style={{flex:1,position:"relative"}}>
                <div style={{height:10,background:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",borderRadius:5,overflow:"hidden"}}>
                  <div style={{width:`${c.score}%`,height:"100%",background:c.color,borderRadius:5,transition:"width .8s ease"}}/>
                </div>
              </div>
              <div style={{width:32,fontSize:14,fontWeight:800,color:c.score>=80?green:c.score>=70?orange:red,fontFamily:f,textAlign:"right"}}>{c.score}</div>
            </div>
          ))}
        </div>

        {/* Key takeaways */}
        <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:18,marginBottom:16}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
            <I.Bulb style={{color:teal}}/>
            <span style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>Key Takeaways</span>
          </div>
          <div style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.7}}>
            <span style={{fontWeight:700,color:green}}>Strengths:</span> Resilience (91) and Strategic Thinking (85) are your top competencies. These are strong foundations to build upon.
          </div>
          <div style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.7,marginTop:6}}>
            <span style={{fontWeight:700,color:orange}}>Development Areas:</span> Team Development (68) and Influence & Communication (72) have the most room for growth and will be primary focus areas.
          </div>
        </div>

        <div style={{display:"flex",gap:10}}>
          <Btn onClick={()=>setIdpStep(0)} style={{color:ts}}><I.Back/> Back</Btn>
          <div style={{flex:1}}/>
          <Btn small style={{color:teal,border:`1px solid ${teal}30`}}><I.Download/> Download Report</Btn>
          <Btn primary onClick={()=>{setIdpStep(2);setChatMsgsIdp([{from:"bot",text:`Hi Kshitij! I've reviewed your assessment results. Let's explore your goals and preferences so I can create a truly personalized development plan.\n\n${chatQuestions[0].q}`}]);setChatQ(0);}}>
            Continue <I.Arrow/>
          </Btn>
        </div>
      </div>
    );

    // ════════════ STEP 2: AI CHAT ════════════
    const ChatStep = () => {
      const isFileStep = chatQ >= chatFileStep;
      const allQDone = chatQ >= chatQuestions.length;

      const sendCustom = () => {
        if (!chatInput.trim()) return;
        handleChatAnswer(chatInput.trim(), chatQ);
      };

      return (
        <div style={{display:"flex",flexDirection:"column",height:"100%",maxWidth:640,margin:"0 auto",width:"100%"}}>
          {/* Chat header */}
          <div style={{padding:"16px 20px 12px",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:18,background:tealBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal}}>
                <I.Bulb/>
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>Lighthouse AI Coach</div>
                <div style={{fontSize:11,color:tm,fontFamily:f}}>Question {Math.min(chatQ+1, chatQuestions.length)} of {chatQuestions.length}{isFileStep ? " · File upload" : ""}</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflow:"auto",padding:"0 20px 16px",display:"flex",flexDirection:"column",gap:10}}>
            {chatMsgsIdp.map((m,i) => (
              <div key={i} style={{alignSelf:m.from==="bot"?"flex-start":"flex-end",maxWidth:"82%",animation:"tfade .3s ease both"}}>
                <div style={{
                  background:m.from==="bot"?(dk?"rgba(255,255,255,.05)":card):(dk?teal:navy),
                  color:m.from==="bot"?tx:"#fff",
                  padding:"10px 14px",borderRadius:m.from==="bot"?"4px 14px 14px 14px":"14px 4px 14px 14px",
                  fontSize:13,fontFamily:f,lineHeight:1.6,whiteSpace:"pre-line",
                  border:m.from==="bot"?`${bdw} solid ${bd}`:"none"
                }}>{m.text}</div>
              </div>
            ))}

            {/* Typing indicator */}
            {chatTyping && (
              <div style={{alignSelf:"flex-start",maxWidth:"82%"}}>
                <div style={{background:dk?"rgba(255,255,255,.05)":card,border:`${bdw} solid ${bd}`,padding:"10px 14px",borderRadius:"4px 14px 14px 14px",display:"flex",gap:4}}>
                  {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:3,background:tm,animation:`tfade .6s ease ${i*.2}s infinite alternate`}}/>)}
                </div>
              </div>
            )}

            {/* Suggestion chips (only when not typing and question active) */}
            {!chatTyping && !isFileStep && chatQ < chatQuestions.length && (
              <div style={{alignSelf:"flex-start",maxWidth:"90%",display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
                {chatQuestions[chatQ].suggestions.map((s,i) => (
                  <button key={i} onClick={()=>handleChatAnswer(s, chatQ)}
                    style={{padding:"8px 14px",borderRadius:20,border:`1px solid ${dk?`${teal}40`:`${teal}30`}`,background:dk?`${teal}14`:`${teal}06`,color:dk?"#cee8e4":teal,fontSize:12,fontWeight:600,fontFamily:f,cursor:"pointer",transition:"all .15s",lineHeight:1.3}}
                    onMouseEnter={e=>{e.currentTarget.style.background=tealBg;e.currentTarget.style.borderColor=teal;}}
                    onMouseLeave={e=>{e.currentTarget.style.background=dk?`${teal}14`:`${teal}06`;e.currentTarget.style.borderColor=dk?`${teal}40`:`${teal}30`;}}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* File upload area */}
            {!chatTyping && isFileStep && (
              <div style={{alignSelf:"flex-start",maxWidth:"90%",marginTop:4}}>
                {uploadedFiles.length > 0 && (
                  <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
                    {uploadedFiles.map((f2,i) => (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:ir,background:dk?`${teal}14`:`${green}08`,border:`1px solid ${green}20`}}>
                        <I.FileText style={{color:green}}/>
                        <span style={{fontSize:12,fontWeight:600,color:green,fontFamily:f}}>{f2}</span>
                        <I.Check style={{color:green,marginLeft:"auto"}}/>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button onClick={()=>handleFileUpload("Manager_Feedback_2025.pdf")}
                    style={{padding:"10px 16px",borderRadius:sr,border:`1.5px dashed ${dk?"rgba(255,255,255,.15)":"rgba(0,0,0,.12)"}`,background:"transparent",color:ts,fontSize:12,fontWeight:600,fontFamily:f,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                    <I.Upload/> Upload Document
                  </button>
                  <Btn small primary onClick={finishChat}>
                    {uploadedFiles.length > 0 ? "Continue" : "Skip & Continue"} <I.Arrow/>
                  </Btn>
                </div>
              </div>
            )}

            <div ref={chatEndRef}/>
          </div>

          {/* Input bar (for custom typed answers) */}
          {!isFileStep && chatQ < chatQuestions.length && !chatTyping && (
            <div style={{padding:"10px 20px 16px",borderTop:`${bdw} solid ${bd}`,flexShrink:0}}>
              <div style={{display:"flex",gap:8}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Or type your own answer..."
                  onKeyDown={e=>{if(e.key==="Enter") sendCustom();}}
                  style={{flex:1,padding:"10px 14px",borderRadius:sr,border:`${bdw} solid ${bd}`,background:dk?"rgba(255,255,255,.04)":"#fff",color:tx,fontSize:13,fontFamily:f,outline:"none"}}/>
                <button onClick={sendCustom} disabled={!chatInput.trim()}
                  style={{width:40,height:40,borderRadius:sr,background:chatInput.trim()?navy:`${navy}20`,color:chatInput.trim()?"#fff":`${navy}40`,border:"none",cursor:chatInput.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <I.Arrow/>
                </button>
              </div>
            </div>
          )}
        </div>
      );
    };

    // ════════════ STEP 3: SUMMARY ════════════
    const SummaryStep = () => {
      const strengths = idpCompetencies.filter(c=>c.score>=80);
      const devAreas = idpCompetencies.filter(c=>c.score<80);

      return (
        <div className="an" style={{maxWidth:560,margin:"0 auto",padding:"36px 20px"}}>
          <h2 style={{fontSize:20,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:4}}>Analysis Summary</h2>
          <p style={{fontSize:14,color:ts,fontFamily:f,marginBottom:24,lineHeight:1.5}}>Here's what we've gathered. Review before we generate your plan.</p>

          {/* Strengths */}
          <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:18,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:28,height:28,borderRadius:ir,background:`${green}10`,display:"flex",alignItems:"center",justifyContent:"center",color:green}}><I.Check/></div>
              <span style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>Identified Strengths</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {strengths.map((s,i)=>(
                <span key={i} style={{padding:"5px 12px",borderRadius:ir,background:`${green}08`,border:`1px solid ${green}18`,fontSize:12,fontWeight:600,color:green,fontFamily:f}}>{s.label} ({s.score})</span>
              ))}
            </div>
          </div>

          {/* Development areas */}
          <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:18,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:28,height:28,borderRadius:ir,background:`${orange}10`,display:"flex",alignItems:"center",justifyContent:"center",color:orange}}><I.Target/></div>
              <span style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>Development Areas</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {devAreas.map((s,i)=>(
                <span key={i} style={{padding:"5px 12px",borderRadius:ir,background:`${orange}08`,border:`1px solid ${orange}18`,fontSize:12,fontWeight:600,color:orange,fontFamily:f}}>{s.label} ({s.score})</span>
              ))}
            </div>
          </div>

          {/* Chat preferences */}
          <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:18,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:28,height:28,borderRadius:ir,background:tealBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal}}><I.Bulb/></div>
              <span style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>Your Preferences</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {Object.entries(userAnswers).slice(0,7).map(([k,v],i) => (
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,flexShrink:0,minWidth:70}}>{["Enjoys","Challenges","Direction","Strengths","Develop","Timeline","Learning"][i]}</span>
                  <span style={{fontSize:12,color:ts,fontFamily:f,lineHeight:1.4}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded files */}
          {uploadedFiles.length > 0 && (
            <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:18,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:28,height:28,borderRadius:ir,background:purpleBg,display:"flex",alignItems:"center",justifyContent:"center",color:purple}}><I.FileText/></div>
                <span style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>External Documents</span>
              </div>
              {uploadedFiles.map((f2,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}>
                  <I.Clip style={{color:purple}}/>
                  <span style={{fontSize:13,color:ts,fontFamily:f}}>{f2}</span>
                  <span style={{fontSize:11,color:green,fontWeight:600,fontFamily:f,marginLeft:"auto"}}>Analyzed</span>
                </div>
              ))}
            </div>
          )}

          <div style={{background:dk?`${teal}14`:`${teal}06`,border:`1px solid ${teal}25`,borderRadius:cr,padding:16,marginBottom:24}}>
            <p style={{fontSize:13,color:dk?"#cee8e4":teal,fontFamily:f,lineHeight:1.6,margin:0}}>
              Ready to generate your plan? We'll use the 70-20-10 learning model to create a balanced development plan with on-the-job experiences, social learning, and formal training.
            </p>
          </div>

          <div style={{display:"flex",gap:10}}>
            <Btn onClick={()=>setIdpStep(2)} style={{color:ts}}><I.Back/> Back</Btn>
            <div style={{flex:1}}/>
            <Btn primary onClick={startIdpGeneration}>
              <I.Rocket/> Generate My Plan
            </Btn>
          </div>
        </div>
      );
    };

    // ════════════ STEP 4: LOADING ════════════
    const LoadingStep = () => {
      const loadStages = [
        {at:0,text:"Analyzing your assessment results...",icon:I.Chart},
        {at:20,text:"Processing your preferences and goals...",icon:I.Bulb},
        {at:40,text:"Reviewing external documents...",icon:I.FileText},
        {at:55,text:"Identifying development actions...",icon:I.Target},
        {at:70,text:"Building success criteria...",icon:I.Shield},
        {at:85,text:"Finalizing your 70-20-10 plan...",icon:I.Rocket},
      ];
      const currentStage = [...loadStages].reverse().find(s=>loadProgress>=s.at) || loadStages[0];

      return (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:40,textAlign:"center"}}>
          <div style={{position:"relative",width:80,height:80,marginBottom:28}}>
            <svg width="80" height="80" viewBox="0 0 80 80" style={{animation:"tspin 2s linear infinite"}}>
              <circle cx="40" cy="40" r="34" fill="none" stroke={dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"} strokeWidth="4"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke={teal} strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${loadProgress * 2.14} 214`} style={{transition:"stroke-dasharray .5s ease"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:teal}}>
              <currentStage.icon/>
            </div>
          </div>
          <div style={{fontSize:16,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:6}}>{currentStage.text}</div>
          <div style={{fontSize:13,color:tm,fontFamily:f,marginBottom:20}}>{loadProgress}% complete</div>
          <div style={{width:240,height:4,background:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",borderRadius:2,overflow:"hidden"}}>
            <div style={{width:`${loadProgress}%`,height:"100%",background:teal,borderRadius:2,transition:"width .5s ease"}}/>
          </div>
        </div>
      );
    };

    // ════════════ STEP 5: IDP PLAN SCREEN ════════════
    const PlanScreen = () => {
      if (!planSkills) return null;
      const typeLabel = {"70":"Experience (70%)","20":"Social (20%)","10":"Formal (10%)"};
      const typeBg = {"70":navyBg,"20":tealBg,"10":purpleBg};
      const typeColor = {"70":navy,"20":teal,"10":purple};
      const catIcons = {experience:I.Rocket,social:I.Users,course:I.Book,reading:I.FileText};
      const totalTips = planSkills.reduce((a,s)=>a+s.tips.length,0);
      const totalComments = Object.values(planComments).reduce((a,c)=>a+c.length,0);
      const isSkillExpanded = (si) => planExpanded === "all" || planExpanded === si;

      // Comment thread component
      const CommentThread = ({threadKey}) => {
        const comments = planComments[threadKey] || [];
        const draft = commentDraft[threadKey] || "";
        if (!showComments && comments.length === 0) return null;
        if (!showComments) return null;

        return (
          <div style={{marginTop:8,padding:10,borderRadius:ir,background:dk?"rgba(255,255,255,.02)":`${navy}03`,border:`1px solid ${dk?"rgba(255,255,255,.04)":`${navy}06`}`}}>
            {comments.length > 0 && (
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:comments.length?8:0}}>
                {comments.map((c,i) => (
                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                    <div style={{width:24,height:24,borderRadius:cr,background:c.from==="manager"?`${orange}15`:navyBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:9,fontWeight:800,fontFamily:f,color:c.from==="manager"?orange:navy}}>
                      {c.from==="manager"?"SC":"KL"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                        <span style={{fontSize:12,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>{c.name}</span>
                        <span style={{fontSize:10,color:tm,fontFamily:f}}>{c.from==="manager"?"Manager":""}</span>
                        <span style={{fontSize:10,color:tm,fontFamily:f,marginLeft:"auto"}}>{c.ts}</span>
                      </div>
                      <p style={{fontSize:12,color:ts,fontFamily:f,lineHeight:1.5,margin:0}}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:6,marginTop:comments.length?0:0}}>
              <input value={draft} onChange={e=>setCommentDraft(prev=>({...prev,[threadKey]:e.target.value}))} placeholder="Add a reply..." onKeyDown={e=>{if(e.key==="Enter"){addComment(threadKey,draft);}}}
                style={{flex:1,padding:"7px 10px",borderRadius:ir,border:`${bdw} solid ${bd}`,background:dk?"rgba(255,255,255,.04)":"#fff",color:tx,fontSize:12,fontFamily:f,outline:"none"}}/>
              <button onClick={()=>addComment(threadKey,draft)} disabled={!draft.trim()} style={{padding:"6px 12px",borderRadius:ir,background:draft.trim()?navy:`${navy}20`,color:draft.trim()?"#fff":`${navy}40`,border:"none",cursor:draft.trim()?"pointer":"default",fontSize:11,fontWeight:600,fontFamily:f}}>Reply</button>
            </div>
          </div>
        );
      };

      return (
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          {/* ── Slim top bar ── */}
          <div style={{display:"flex",alignItems:"center",padding:"0 20px",height:50,gap:10,flexShrink:0,borderBottom:`${bdw} solid ${bd}`,background:dk?`${navy}4D`:`${navy}05`}}>
            <button onClick={()=>setIdpOpen(false)} style={{width:32,height:32,borderRadius:ir,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:ts,background:"none",border:`${bdw} solid ${bd}`}}><I.Back/></button>
            <span style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>Individual Development Plan</span>
            {/* Status badge */}
            <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:5,fontFamily:f,
              color:planStatus==="draft"?orange:planStatus==="under-review"?teal:green,
              background:planStatus==="draft"?`${orange}12`:planStatus==="under-review"?tealBg:`${green}10`,
              border:`1px solid ${planStatus==="draft"?`${orange}25`:planStatus==="under-review"?`${teal}25`:`${green}25`}`,
              textTransform:"uppercase",letterSpacing:.3
            }}>{planStatus==="draft"?"Draft":planStatus==="under-review"?"Under Review":"Approved"}</span>
            <div style={{flex:1}}/>
            <Btn small onClick={()=>{}} style={{color:teal,border:`1px solid ${teal}30`,gap:4,fontSize:11,padding:"5px 12px"}}><I.Download/> PDF</Btn>
            {planStatus==="draft" && <>
              <Btn small primary={!planEditing} onClick={()=>setPlanEditing(!planEditing)} style={{fontSize:11,padding:"5px 12px"}}>
                {planEditing ? <><I.Check/> Done</> : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</>}
              </Btn>
              <Btn small primary onClick={()=>setPlanModal("submit")} style={{fontSize:11,padding:"5px 12px",background:green}}><I.Arrow/> Submit</Btn>
            </>}
            {planStatus==="under-review" && <span style={{fontSize:12,color:tm,fontFamily:f}}>Awaiting manager approval</span>}
            {planStatus==="approved" && <span style={{fontSize:12,color:green,fontWeight:600,fontFamily:f}}>✓ Manager approved</span>}
            <SettingsGear/>
          </div>

          {/* Scrollable content */}
          <div style={{flex:1,overflow:"auto"}}>

            {/* ── HERO BANNER ── */}
            <div style={{background:dk?`${navy}40`:`${navy}10`,borderBottom:`${bdw} solid ${bd}`,padding:"24px 20px 20px"}}>
              <div style={{maxWidth:960,margin:"0 auto"}}>
                {/* Profile row */}
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
                  <div style={{width:48,height:48,borderRadius:cr,background:navy,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:16,fontFamily:f,flexShrink:0}}>KL</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:20,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>Kshitij Lau</div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginTop:2}}>
                      <span style={{fontSize:13,color:ts,fontFamily:f}}>Senior Product Manager</span>
                      <span style={{color:tm,fontSize:13}}>·</span>
                      <span style={{fontSize:13,color:ts,fontFamily:f}}>Marsh</span>
                    </div>
                  </div>
                </div>

                {/* Goal card */}
                <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:34,height:34,borderRadius:9,background:tealBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal,flexShrink:0}}><I.Rocket/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,textTransform:"uppercase",letterSpacing:.4,marginBottom:2}}>Career Goal</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>Senior Product Manager</span>
                      <svg width="16" height="12" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      <span style={{fontSize:14,fontWeight:700,color:teal,fontFamily:f}}>GTM & AI Solutions PM</span>
                      <span style={{fontSize:11,color:tm,fontFamily:f,background:dk?"rgba(255,255,255,.05)":`${navy}06`,padding:"2px 8px",borderRadius:5}}>6 month timeline</span>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:8}}>
                  {[
                    {label:"Skills",value:planSkills.length,color:navy,bg:navyBg,sub:`${planSkills.filter(s=>s.skillType==="behavioral").length}B · ${planSkills.filter(s=>s.skillType==="technical").length}T`},
                    {label:"Actions",value:totalTips,color:teal,bg:tealBg},
                    {label:"Completion",value:"0%",color:green,bg:`${green}10`},
                    {label:"Timeline",value:"6 mo",color:purple,bg:purpleBg},
                    {label:"Comments",value:totalComments,color:orange,bg:`${orange}10`},
                  ].map((s,i)=>(
                    <div key={i} style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:sr,padding:"10px 8px",textAlign:"center"}}>
                      <div style={{fontSize:18,fontWeight:800,color:dk?"#fff":s.color,fontFamily:f}}>{s.value}</div>
                      <div style={{fontSize:10,color:tm,fontFamily:f,marginTop:1}}>{s.label}</div>
                      {s.sub && <div style={{fontSize:9,color:tm,fontFamily:f,marginTop:2,opacity:.7}}>{s.sub}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── TOOLBAR ── */}
            <div style={{position:"sticky",top:0,zIndex:10,background:bg,borderBottom:`${bdw} solid ${bd}`,padding:"8px 20px"}}>
              <div style={{maxWidth:960,margin:"0 auto",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <button onClick={toggleExpandAll} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:ir,border:`${bdw} solid ${bd}`,background:planExpandAll?navyBg:"transparent",cursor:"pointer",color:planExpandAll?(dk?"#fff":navy):ts,fontSize:12,fontWeight:600,fontFamily:f}}>
                  {planExpandAll ? <><I.Down/> Collapse All</> : <><I.ChevR/> Expand All</>}
                </button>
                <button onClick={()=>setShowComments(!showComments)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:ir,border:`${bdw} solid ${bd}`,background:showComments?`${orange}10`:"transparent",cursor:"pointer",color:showComments?orange:ts,fontSize:12,fontWeight:600,fontFamily:f}}>
                  <I.Msg/> {showComments?"Hide":"Show"} Comments{totalComments>0?` (${totalComments})`:""} 
                </button>
                <button onClick={()=>setShowReference(!showReference)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:ir,border:`${bdw} solid ${bd}`,background:showReference?navyBg:"transparent",cursor:"pointer",color:showReference?(dk?"#fff":navy):ts,fontSize:12,fontWeight:600,fontFamily:f}}>
                  <I.Chart/> Assessment Basis {showReference?"▾":"▸"}
                </button>
                <div style={{flex:1}}/>
                <span style={{fontSize:11,color:tm,fontFamily:f}}>Created Feb 2026</span>
              </div>
            </div>

            {/* ── REFERENCE PANEL (skill gap + chat summary) ── */}
            {showReference && (
              <div style={{borderBottom:`${bdw} solid ${bd}`,background:dk?`${navy}14`:`${navy}03`,padding:"16px 20px"}}>
                <div style={{maxWidth:960,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  {/* Skill Gap Report */}
                  <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      <div style={{width:26,height:26,borderRadius:ir,background:navyBg,display:"flex",alignItems:"center",justifyContent:"center",color:navy}}><I.Chart/></div>
                      <span style={{fontSize:13,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>Skill Gap Report</span>
                    </div>
                    {idpCompetencies.map((c,i) => (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<idpCompetencies.length-1?8:0}}>
                        <div style={{width:100,fontSize:11,fontWeight:600,color:ts,fontFamily:f,flexShrink:0,textAlign:"right"}}>{c.label}</div>
                        <div style={{flex:1,height:6,background:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",borderRadius:3,overflow:"hidden"}}>
                          <div style={{width:`${c.score}%`,height:"100%",background:c.color,borderRadius:3}}/>
                        </div>
                        <div style={{width:24,fontSize:11,fontWeight:700,color:c.score>=80?green:c.score>=70?orange:red,fontFamily:f,textAlign:"right"}}>{c.score}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Preferences Summary */}
                  <div style={{background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,padding:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      <div style={{width:26,height:26,borderRadius:ir,background:tealBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal}}><I.Bulb/></div>
                      <span style={{fontSize:13,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>Chat Preferences</span>
                    </div>
                    {Object.entries(userAnswers).length > 0 ?
                      Object.entries(userAnswers).slice(0,7).map(([k,v],i) => (
                        <div key={i} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:i<6?6:0}}>
                          <span style={{fontSize:10,fontWeight:700,color:tm,fontFamily:f,flexShrink:0,minWidth:60}}>{["Enjoys","Challenges","Direction","Strengths","Develop","Timeline","Learning"][i]}</span>
                          <span style={{fontSize:11,color:ts,fontFamily:f,lineHeight:1.4}}>{v}</span>
                        </div>
                      ))
                    : <div style={{fontSize:12,color:tm,fontFamily:f,lineHeight:1.6}}>
                        <div style={{marginBottom:4}}><span style={{fontWeight:700}}>Enjoys:</span> Strategic planning, cross-functional collaboration</div>
                        <div style={{marginBottom:4}}><span style={{fontWeight:700}}>Direction:</span> Grow into a senior leadership role</div>
                        <div style={{marginBottom:4}}><span style={{fontWeight:700}}>Develop:</span> Executive presence, coaching others</div>
                        <div style={{marginBottom:4}}><span style={{fontWeight:700}}>Timeline:</span> 6 months</div>
                        <div><span style={{fontWeight:700}}>Learning:</span> Hands-on practice, online courses</div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            )}

            {/* ── SKILLS ── */}
            <div style={{padding:"16px 20px 24px"}}>
              <div style={{maxWidth:960,margin:"0 auto"}}>
                {planSkills.map((skill, si) => {
                  const isExp = isSkillExpanded(si);
                  const skillCommentKey = `skill-${si}`;
                  const skillCommentCount = getCommentCount(skillCommentKey);
                  return (
                    <div key={si} className={si<4?["an","an2","an3","an4"][si]:""} style={{background:card,border:`1px solid ${isExp?`${teal}40`:bd}`,borderRadius:cr,boxShadow:csh,marginBottom:16,overflow:"hidden",transition:"border-color .2s"}}>
                      {/* Skill header */}
                      <button onClick={()=>{if(planExpanded==="all"){setPlanExpanded(si);setPlanExpandAll(false);}else setPlanExpanded(isExp?null:si);}} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"16px 20px",cursor:"pointer",background:"none",border:"none",textAlign:"left"}}>
                        <div style={{width:38,height:38,borderRadius:sr,background:isExp?(skill.skillType==="technical"?tealBg:tealBg):skill.skillType==="technical"?`${teal}10`:navyBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s",color:isExp?teal:skill.skillType==="technical"?teal:navy}}>
                          {skill.skillType==="technical" ? <I.Gear/> : <I.Target/>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:2}}>
                            <span style={{fontSize:15,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>{skill.name}</span>
                            <span style={{fontSize:9,fontWeight:700,color:skill.skillType==="technical"?teal:purple,background:skill.skillType==="technical"?tealBg:purpleBg,padding:"2px 7px",borderRadius:4,fontFamily:f,textTransform:"uppercase",letterSpacing:.3}}>{skill.skillType==="technical"?"Technical":"Behavioral"}</span>
                            {skill.private && <span style={{fontSize:10,fontWeight:700,color:purple,background:purpleBg,padding:"2px 7px",borderRadius:4,fontFamily:f}}>🔒 Private</span>}
                            {showComments && skillCommentCount > 0 && <span style={{fontSize:10,fontWeight:700,color:orange,fontFamily:f,display:"flex",alignItems:"center",gap:2}}><I.Msg/> {skillCommentCount}</span>}
                          </div>
                          <div style={{fontSize:12,color:tm,fontFamily:f}}>{skill.tips.length} development actions</div>
                        </div>
                        {planEditing && planStatus==="draft" && (
                          <div style={{display:"flex",gap:4,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                            <button onClick={()=>toggleSkillPrivate(si)} title={skill.private?"Make visible":"Make private"} style={{width:28,height:28,borderRadius:ir,border:`${bdw} solid ${bd}`,background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:skill.private?purple:tm}}><I.Shield/></button>
                            <button onClick={()=>removeSkillFromPlan(si)} title="Remove skill" style={{width:28,height:28,borderRadius:ir,border:`1px solid ${red}30`,background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:red}}><I.X/></button>
                          </div>
                        )}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tm} strokeWidth="2" style={{transform:isExp?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
                      </button>

                      {/* Expanded: description + tips + comments */}
                      {isExp && (
                        <div style={{padding:"0 20px 20px",borderTop:`${bdw} solid ${bd}`}}>
                          <p style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.6,padding:"14px 0 12px",margin:0}}>{skill.desc}</p>

                          {/* Skill-level comments */}
                          <CommentThread threadKey={skillCommentKey}/>

                          {/* Development tips */}
                          <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10}}>
                            {skill.tips.map((tip, ti) => {
                              const TIcon = catIcons[tip.category] || I.Bulb;
                              const insightOpen = planTipExpanded === tip.id;
                              const tipCommentCount = getCommentCount(tip.id);
                              const isTipOpen = tipOpen[si] === tip.id;
                              const curPct = (tipProgress[tip.id]?.pct) || 0;
                              const pctColor = curPct >= 100 ? green : curPct >= 50 ? teal : curPct > 0 ? orange : tm;
                              const pctSteps = [0, 25, 50, 75, 100];

                              return (
                                <div key={tip.id} style={{background:dk?"rgba(255,255,255,.02)":bg,border:`1px solid ${isTipOpen?`${teal}30`:bd}`,borderRadius:cr,overflow:"hidden",transition:"border-color .2s"}}>
                                  {/* Tip compact header — always visible */}
                                  <button onClick={()=>setTipOpen(p=>({...p,[si]:isTipOpen?null:tip.id}))} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 16px",cursor:"pointer",background:"none",border:"none",textAlign:"left"}}>
                                    <div style={{width:28,height:28,borderRadius:ir,background:typeBg[tip.type],display:"flex",alignItems:"center",justifyContent:"center",color:typeColor[tip.type],flexShrink:0}}>
                                      <TIcon/>
                                    </div>
                                    <div style={{flex:1,minWidth:0}}>
                                      <div style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:isTipOpen?"normal":"nowrap"}}>{tip.title}</div>
                                      {!isTipOpen && <div style={{fontSize:10,color:tm,fontFamily:f,marginTop:1}}>{typeLabel[tip.type]}{tip.provider ? ` · ${tip.provider}` : ""}</div>}
                                    </div>
                                    {/* Compact completion chip */}
                                    {!isTipOpen && (
                                      <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                                        <div style={{width:32,height:4,background:dk?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)",borderRadius:2,overflow:"hidden"}}>
                                          <div style={{width:`${curPct}%`,height:"100%",background:pctColor,borderRadius:2,transition:"width .3s"}}/>
                                        </div>
                                        <span style={{fontSize:10,fontWeight:700,color:pctColor,fontFamily:f,minWidth:24,textAlign:"right"}}>{curPct}%</span>
                                      </div>
                                    )}
                                    {showComments && tipCommentCount > 0 && !isTipOpen && <span style={{fontSize:10,color:orange,fontWeight:600,fontFamily:f,display:"flex",alignItems:"center",gap:2,flexShrink:0}}><I.Msg/> {tipCommentCount}</span>}
                                    {planEditing && planStatus==="draft" && (
                                      <button onClick={e=>{e.stopPropagation();removeTipFromSkill(si,tip.id);}} style={{width:22,height:22,borderRadius:sr,border:`1px solid ${red}30`,background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:red,flexShrink:0}} title="Remove"><I.X/></button>
                                    )}
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tm} strokeWidth="2" style={{transform:isTipOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
                                  </button>

                                  {/* Tip expanded content */}
                                  {isTipOpen && (
                                    <div style={{padding:"0 16px 16px",borderTop:`${bdw} solid ${bd}`}}>
                                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",padding:"10px 0 6px"}}>
                                        <span style={{fontSize:10,fontWeight:700,color:typeColor[tip.type],background:typeBg[tip.type],padding:"2px 8px",borderRadius:4,fontFamily:f}}>{typeLabel[tip.type]}</span>
                                        <span style={{fontSize:10,fontWeight:600,color:tip.source==="ai"?teal:navy,background:tip.source==="ai"?tealBg:navyBg,padding:"2px 7px",borderRadius:4,fontFamily:f}}>{tip.source==="ai"?"✦ AI Generated":"📚 Library"}</span>
                                        {tip.provider && <span style={{fontSize:11,color:tm,fontFamily:f}}>{tip.provider}</span>}
                                        {showComments && tipCommentCount > 0 && <span style={{fontSize:10,color:orange,fontWeight:600,fontFamily:f,display:"flex",alignItems:"center",gap:2,marginLeft:"auto"}}><I.Msg/> {tipCommentCount}</span>}
                                      </div>
                                      <p style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.55,margin:"0 0 12px"}}>{tip.desc}</p>

                                      {/* Course card inline */}
                                      {tip.category==="course" && tip.courseImg && (
                                        <div style={{display:"flex",gap:10,padding:10,borderRadius:ir,background:card,border:`${bdw} solid ${bd}`,marginBottom:10}}>
                                          <img src={tip.courseImg} alt="" style={{width:80,height:48,borderRadius:sr,objectFit:"cover",flexShrink:0}}/>
                                          <div style={{flex:1,minWidth:0}}>
                                            <div style={{fontSize:12,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:2}}>{tip.provider}</div>
                                            <div style={{fontSize:11,color:tm,fontFamily:f}}>{tip.duration}{tip.seats ? ` · ${tip.seats} seats left` : ""}</div>
                                            {tip.courseLink && <a href={tip.courseLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:11,color:teal,fontWeight:600,fontFamily:f,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:3,marginTop:3}}>Take me to course <I.Ext/></a>}
                                          </div>
                                        </div>
                                      )}

                                      {/* Dates */}
                                      <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",marginBottom:8}}>
                                        {planStatus==="draft" ? <>
                                          <span style={{fontSize:11,color:tm,fontFamily:f,display:"flex",alignItems:"center",gap:3}}><I.Cal/></span>
                                          <input value={(tipProgress[tip.id]?.start)||tip.startDate} onChange={e=>setTipProgress(p=>({...p,[tip.id]:{...(p[tip.id]||{}),start:e.target.value}}))} style={{width:80,padding:"3px 6px",borderRadius:5,border:`${bdw} solid ${bd}`,background:dk?"rgba(255,255,255,.04)":"#fff",color:tx,fontSize:11,fontFamily:f,outline:"none"}} placeholder="Start"/>
                                          <span style={{fontSize:11,color:tm}}>→</span>
                                          <input value={(tipProgress[tip.id]?.end)||tip.endDate} onChange={e=>setTipProgress(p=>({...p,[tip.id]:{...(p[tip.id]||{}),end:e.target.value}}))} style={{width:80,padding:"3px 6px",borderRadius:5,border:`${bdw} solid ${bd}`,background:dk?"rgba(255,255,255,.04)":"#fff",color:tx,fontSize:11,fontFamily:f,outline:"none"}} placeholder="End"/>
                                        </> : <span style={{fontSize:11,color:tm,fontFamily:f,display:"flex",alignItems:"center",gap:3}}><I.Cal/> {(tipProgress[tip.id]?.start)||tip.startDate} → {(tipProgress[tip.id]?.end)||tip.endDate}</span>}
                                      </div>

                                      {/* Completion — pill selector */}
                                      <div style={{marginBottom:10}}>
                                        <div style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,marginBottom:5}}>Completion</div>
                                        <div style={{display:"flex",gap:0,borderRadius:ir,overflow:"hidden",border:`${bdw} solid ${bd}`,width:"fit-content"}}>
                                          {pctSteps.map((step,pi) => {
                                            const isActive = curPct >= step && (pi === pctSteps.length-1 || curPct < pctSteps[pi+1]);
                                            const isFilled = curPct >= step;
                                            return (
                                              <button key={step} onClick={()=>{if(planStatus==="draft")setTipProgress(p=>({...p,[tip.id]:{...(p[tip.id]||{}),pct:step}}));}} style={{
                                                padding:"5px 12px",fontSize:11,fontWeight:isActive?700:500,fontFamily:f,
                                                border:"none",borderRight:pi<pctSteps.length-1?`${bdw} solid ${bd}`:"none",
                                                cursor:planStatus==="draft"?"pointer":"default",
                                                background:isActive?(step===100?green:teal):isFilled?(dk?`${teal}18`:`${teal}08`):"transparent",
                                                color:isActive?"#fff":isFilled?teal:tm,
                                                transition:"all .15s"
                                              }}>{step}%</button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      <div style={{fontSize:12,color:ts,fontFamily:f,lineHeight:1.5}}>
                                        <span style={{fontWeight:700,color:dk?"#ddd":navy}}>Success criteria:</span> {tip.success}
                                      </div>

                                      {/* AI Insight toggle */}
                                      {tip.insight && (
                                        <button onClick={(e)=>{e.stopPropagation();setPlanTipExpanded(insightOpen?null:tip.id);}} style={{display:"flex",alignItems:"center",gap:4,marginTop:8,padding:"5px 10px",borderRadius:sr,border:`1px solid ${teal}25`,background:insightOpen?tealBg:"transparent",cursor:"pointer",color:teal,fontSize:11,fontWeight:600,fontFamily:f}}>
                                          <I.Bulb/> AI Insight {insightOpen?"▾":"▸"}
                                        </button>
                                      )}
                                      {insightOpen && tip.insight && (
                                        <div style={{marginTop:6,padding:"8px 10px",borderRadius:sr,background:tealBg,border:`1px solid ${teal}20`,fontSize:12,color:dk?"#b8e0d9":teal,fontFamily:f,lineHeight:1.6}}>
                                          {tip.insight}
                                        </div>
                                      )}

                                      {/* Tip-level comments */}
                                      <CommentThread threadKey={tip.id}/>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Add action buttons (edit mode, draft only) */}
                          {planEditing && planStatus==="draft" && (
                            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                              <button onClick={()=>{setPlanModalSkill(si);setPlanModal("aiGen");}} style={{padding:"8px 14px",borderRadius:ir,border:`1.5px dashed ${teal}40`,background:"none",cursor:"pointer",color:teal,fontSize:12,fontWeight:600,fontFamily:f,display:"flex",alignItems:"center",gap:5}}>
                                <I.Bulb/> Generate with AI
                              </button>
                              <button onClick={()=>{setPlanModalSkill(si);setPlanModal("library");}} style={{padding:"8px 14px",borderRadius:ir,border:`1.5px dashed ${navy}30`,background:"none",cursor:"pointer",color:dk?"#8899bb":navy,fontSize:12,fontWeight:600,fontFamily:f,display:"flex",alignItems:"center",gap:5}}>
                                <I.Book/> Pick from Library
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add skill button (edit mode, draft only) */}
                {planEditing && planStatus==="draft" && (
                  <button onClick={()=>setPlanModal("addSkill")} style={{width:"100%",padding:"16px",borderRadius:cr,border:`2px dashed ${dk?"rgba(255,255,255,.1)":`${navy}1A`}`,background:"none",cursor:"pointer",color:tm,fontSize:14,fontWeight:600,fontFamily:f,display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12}}>
                    <I.Plus/> Add Another Skill
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ══════ MODALS ══════ */}

          {/* Add Skill Modal */}
          {planModal==="addSkill" && (
            <div style={{position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div onClick={()=>setPlanModal(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}}/>
              <div className="td" style={{position:"relative",width:520,maxHeight:"80vh",background:card,borderRadius:mr,overflow:"hidden",border:`${bdw} solid ${bd}`,boxShadow:`0 24px 80px rgba(0,0,0,.15)`}}>
                <div style={{display:"flex",alignItems:"center",padding:"16px 20px",borderBottom:`${bdw} solid ${bd}`}}>
                  <span style={{flex:1,fontSize:16,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>Add a Skill</span>
                  <button onClick={()=>setPlanModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button>
                </div>
                <div style={{overflow:"auto",maxHeight:"65vh",padding:"16px 20px"}}>
                  {Object.entries(skillLibrary).map(([cat, skills]) => (
                    <div key={cat} style={{marginBottom:16}}>
                      <div style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>{cat}</div>
                      {skills.map((sk,i) => {
                        const alreadyAdded = planSkills?.some(s=>s.name===sk.name);
                        return (
                          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:sr,border:`${bdw} solid ${bd}`,marginBottom:6,background:alreadyAdded?(dk?"rgba(255,255,255,.03)":`${green}04`):card}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>{sk.name}</div>
                              <div style={{fontSize:12,color:ts,fontFamily:f}}>{sk.desc}</div>
                            </div>
                            {alreadyAdded ? <span style={{fontSize:11,fontWeight:600,color:green,fontFamily:f}}>Added</span> :
                            <button onClick={()=>addSkillToPlan(sk)} style={{padding:"6px 14px",borderRadius:ir,background:navy,color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:f}}>Add</button>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Generate Tips Modal */}
          {planModal==="aiGen" && planModalSkill!==null && (
            <div style={{position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div onClick={()=>setPlanModal(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}}/>
              <div className="td" style={{position:"relative",width:520,maxHeight:"80vh",background:card,borderRadius:mr,overflow:"hidden",border:`${bdw} solid ${bd}`,boxShadow:`0 24px 80px rgba(0,0,0,.15)`}}>
                <div style={{display:"flex",alignItems:"center",padding:"16px 20px",borderBottom:`${bdw} solid ${bd}`}}>
                  <span style={{flex:1,fontSize:16,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>✦ AI-Generated Actions</span>
                  <button onClick={()=>setPlanModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button>
                </div>
                <div style={{padding:"8px 20px 4px",fontSize:12,color:ts,fontFamily:f}}>For: <span style={{fontWeight:700,color:dk?"#fff":navy}}>{planSkills[planModalSkill]?.name}</span></div>
                <div style={{overflow:"auto",maxHeight:"62vh",padding:"10px 20px 20px"}}>
                  {aiTipSuggestions(planSkills[planModalSkill]?.name||"").map((tip,i) => (
                    <div key={i} style={{display:"flex",gap:10,padding:"12px",borderRadius:sr,border:`${bdw} solid ${bd}`,marginBottom:6,background:card}}>
                      <div style={{width:28,height:28,borderRadius:ir,background:typeBg[tip.type],display:"flex",alignItems:"center",justifyContent:"center",color:typeColor[tip.type],flexShrink:0,marginTop:1,fontSize:10,fontWeight:800,fontFamily:f}}>{tip.type==="70"?"70":tip.type==="20"?"20":"10"}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:2}}>{tip.title}</div>
                        <div style={{fontSize:12,color:ts,fontFamily:f,lineHeight:1.4}}>{tip.desc}</div>
                        {tip.duration && <div style={{fontSize:11,color:tm,fontFamily:f,marginTop:3}}>{tip.provider} · {tip.duration}</div>}
                      </div>
                      <button onClick={()=>addTipToSkill(planModalSkill,{...tip,startDate:"TBD",endDate:"TBD",success:"To be defined",insight:"AI-recommended action based on your assessment profile and chat preferences."})} style={{padding:"6px 12px",borderRadius:ir,background:teal,color:"#fff",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:f,flexShrink:0,alignSelf:"center"}}>Add</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Library Tips Modal */}
          {planModal==="library" && planModalSkill!==null && (
            <div style={{position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div onClick={()=>setPlanModal(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}}/>
              <div className="td" style={{position:"relative",width:520,maxHeight:"80vh",background:card,borderRadius:mr,overflow:"hidden",border:`${bdw} solid ${bd}`,boxShadow:`0 24px 80px rgba(0,0,0,.15)`}}>
                <div style={{display:"flex",alignItems:"center",padding:"16px 20px",borderBottom:`${bdw} solid ${bd}`}}>
                  <span style={{flex:1,fontSize:16,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>📚 Development Library</span>
                  <button onClick={()=>setPlanModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button>
                </div>
                <div style={{padding:"8px 20px 4px",fontSize:12,color:ts,fontFamily:f}}>For: <span style={{fontWeight:700,color:dk?"#fff":navy}}>{planSkills[planModalSkill]?.name}</span></div>
                <div style={{overflow:"auto",maxHeight:"62vh",padding:"10px 20px 20px"}}>
                  {Object.entries(libraryTips).map(([type, tips]) => (
                    <div key={type} style={{marginBottom:14}}>
                      <div style={{fontSize:12,fontWeight:700,color:typeColor[type],fontFamily:f,marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:20,height:20,borderRadius:5,background:typeBg[type],display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800}}>{type}</div>
                        {typeLabel[type]}
                      </div>
                      {tips.map((tip,i) => (
                        <div key={i} style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:sr,border:`${bdw} solid ${bd}`,marginBottom:5,background:card}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:2}}>{tip.title}</div>
                            <div style={{fontSize:12,color:ts,fontFamily:f,lineHeight:1.4}}>{tip.desc}</div>
                            {tip.provider && <div style={{fontSize:11,color:tm,fontFamily:f,marginTop:2}}>{tip.provider}{tip.duration ? ` · ${tip.duration}` : ""}</div>}
                          </div>
                          <button onClick={()=>addTipToSkill(planModalSkill,{...tip,startDate:"TBD",endDate:"TBD",success:"To be defined",insight:"Selected from the organization's curated development library."})} style={{padding:"6px 12px",borderRadius:ir,background:navy,color:"#fff",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:f,flexShrink:0,alignSelf:"center"}}>Add</button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit to Manager Modal */}
          {planModal==="submit" && (
            <div style={{position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div onClick={()=>setPlanModal(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}}/>
              <div className="td" style={{position:"relative",width:440,background:card,borderRadius:mr,overflow:"hidden",border:`${bdw} solid ${bd}`,boxShadow:`0 24px 80px rgba(0,0,0,.15)`}}>
                <div style={{display:"flex",alignItems:"center",padding:"16px 20px",borderBottom:`${bdw} solid ${bd}`}}>
                  <span style={{flex:1,fontSize:16,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>Submit for Approval</span>
                  <button onClick={()=>setPlanModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button>
                </div>
                <div style={{padding:20}}>
                  <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.6,marginBottom:16}}>
                    Your plan will be sent to your manager for review and approval.
                  </p>
                  {planSkills?.some(s=>s.private) && (
                    <div style={{background:purpleBg,border:`1px solid ${purple}25`,borderRadius:sr,padding:12,marginBottom:16,display:"flex",gap:8,alignItems:"flex-start"}}>
                      <I.Shield style={{color:purple,flexShrink:0,marginTop:1}}/>
                      <div style={{fontSize:13,color:dk?"#c5b8ff":purple,fontFamily:f,lineHeight:1.5}}>
                        <span style={{fontWeight:700}}>Private skills hidden.</span> The following skills are marked private and will not be visible to your manager:
                        <div style={{marginTop:4}}>{planSkills.filter(s=>s.private).map((s,i)=><span key={i} style={{display:"inline-block",padding:"2px 8px",borderRadius:5,background:`${purple}15`,fontSize:11,fontWeight:600,marginRight:4,marginBottom:3}}>{s.name}</span>)}</div>
                      </div>
                    </div>
                  )}
                  <div style={{background:dk?"rgba(255,255,255,.03)":bg,borderRadius:sr,padding:12,marginBottom:20}}>
                    <div style={{fontSize:13,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,marginBottom:6}}>What your manager will see:</div>
                    {planSkills?.filter(s=>!s.private).map((s,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",fontSize:13,color:ts,fontFamily:f}}>
                        <I.Check style={{color:green}}/> {s.name} — {s.tips.length} actions
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                    <Btn onClick={()=>setPlanModal(null)} style={{color:ts}}>Cancel</Btn>
                    <Btn primary onClick={()=>{setPlanModal(null);setPlanStatus("under-review");setPlanEditing(false);}} style={{background:green}}>
                      <I.Arrow/> Submit Plan
                    </Btn>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    // ── Main render ──
    const showPlan = idpStep===5;
    return (
      <div style={{position:"fixed",inset:0,zIndex:2000,background:bg,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {!showPlan && <TopBar/>}
        <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
          {idpStep===0 && <IntroStep/>}
          {idpStep===1 && <SkillGapStep/>}
          {idpStep===2 && <ChatStep/>}
          {idpStep===3 && <SummaryStep/>}
          {idpStep===4 && <LoadingStep/>}
          {showPlan && <PlanScreen/>}
        </div>
      </div>
    );
  };

  // ═══════════ ROUTER ═══════════

  const renderMain = () => {
    if (pg==="precheck") return <PreCheckPage/>;
    if (pg==="videoassess") return <VideoAssessPage/>;
    if (pg==="center") return <CenterPage/>;
    if (pg==="instructions") return <InstructionsPage/>;
    if (pg==="tasks") return curProg && consentGiven[curProg.id] ? <TasksPage/> : <InstructionsPage/>;
    if (pg==="insights") return <InsightsPage/>;
    if (pg==="development") return <DevelopmentPage/>;
    if (pg==="scheduling") return <SchedulingPage/>;
    return <DashboardPage/>;
  };

  return (
    <div style={{display:"flex",height:"100vh",background:bg,color:tx,fontFamily:f,overflow:"hidden"}}>
      <style>{css}</style>
      <a href="#main" className="skip-link">Skip to main content</a>

      <nav aria-label="Main navigation" style={{width:pg==="videoassess"?0:mob?260:sbW,height:"100vh",background:sbBg,borderRight:sbHidden||pg==="videoassess"?"none":`${bdw} solid ${bd}`,display:"flex",flexDirection:"column",flexShrink:0,position:mob?"fixed":"sticky",top:0,zIndex:mob?1000:2,left:mob?(sbOpen?0:-280):0,transition:"width .2s ease, left .2s ease",overflow:"hidden",opacity:sbHidden||pg==="videoassess"?0:1}}>
        <div style={{padding:sbOpen?"18px 16px 10px":"18px 0 10px",display:"flex",alignItems:"center",gap:10,flexShrink:0,justifyContent:sbOpen?"flex-start":"center"}}>
          <div style={{width:34,height:34,borderRadius:sr,background:navy,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2l2 8h-4l2-8z" fill="white" opacity=".9"/><rect x="10" y="10" width="4" height="10" rx="1" fill="white" opacity=".5"/></svg>
          </div>
          {sbOpen&&<div><div style={{fontSize:15,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>Lighthouse</div><div style={{fontSize:10,color:tm,fontFamily:f}}>Mercer · Acme Corp</div></div>}
        </div>
        <div style={{flex:1,padding:sbOpen?"4px 8px":"4px 6px",display:"flex",flexDirection:"column",gap:1,overflowY:"auto",minHeight:0}}>
          <SbItem icon={I.Home} label="Dashboard" active={pg==="dash"&&!selProgram} onClick={()=>{setSelProgram(null);setPg("dash");setMob(false);}}/>
          {sbOpen&&<><div style={{height:8}}/><div style={{padding:"0 14px",fontSize:10,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.5,textTransform:"uppercase",marginBottom:4}}>Programs</div></>}
          <SbItem icon={I.Chart} label="Leadership 2026" active={selProgram==="leadership"} onClick={()=>{openProgram("leadership");setMob(false);}}/>
          <SbItem icon={I.Users} label="360° Perspective" active={selProgram==="360"} onClick={()=>{openProgram("360");setMob(false);}}/>
          {sbOpen&&<><div style={{height:8}}/><div style={{padding:"0 14px",fontSize:10,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.5,textTransform:"uppercase",marginBottom:4}}>Growth</div></>}
          <SbItem icon={I.Book} label="Development" active={pg==="development"} onClick={()=>{setSelProgram(null);setPg("development");setMob(false);}}/>
          <SbItem icon={I.Cal} label="Scheduling" active={pg==="scheduling"} onClick={()=>{setSelProgram(null);setPg("scheduling");setSchedView(null);setMob(false);}}/>
          {sbOpen&&<><div style={{height:8}}/></>}
          <SbItem icon={I.Chart} label="Insights" active={pg==="insights"} onClick={()=>{setSelProgram(null);setPg("insights");setMob(false);}}/>
        </div>
        <div style={{padding:sbOpen?"8px":"8px 6px",flexShrink:0,borderTop:`1px solid ${dk?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)"}`}}>
          {sbOpen&&<div style={{display:"flex",gap:4,padding:"2px 6px",marginBottom:4}}>
            <button onClick={e=>{e.stopPropagation();setLangO(!langO)}} style={{position:"relative",display:"flex",alignItems:"center",gap:3,padding:"6px 8px",borderRadius:ir,cursor:"pointer",color:tm,fontSize:12,fontFamily:f,background:"none",border:"none"}}>
              <I.Globe/>{selLang}<I.Down/>
              {langO&&<div className="td" onClick={e=>e.stopPropagation()} style={{position:"absolute",bottom:"100%",left:0,width:120,background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,overflow:"hidden",marginBottom:4,boxShadow:`0 8px 24px ${dk?"rgba(0,0,0,.3)":"rgba(0,0,0,.06)"}`,zIndex:10}}>
                {["EN","AR","FR","ES","ZH","HI"].map(l=><div key={l} onClick={()=>{setSelLang(l);setLangO(false)}} style={{padding:"7px 12px",cursor:"pointer",fontSize:12,fontFamily:f,color:l===selLang?navy:ts,fontWeight:l===selLang?700:400}} onMouseEnter={e=>e.currentTarget.style.background=bg2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{l}</div>)}
              </div>}
            </button>
            <button onClick={()=>setDk(!dk)} style={{display:"flex",alignItems:"center",gap:3,padding:"6px 8px",borderRadius:ir,cursor:"pointer",color:tm,fontSize:12,fontFamily:f,background:"none",border:"none"}}>{dk?<I.Sun/>:<I.Moon/>}{dk?"Light":"Dark"}</button>
          </div>}
          {sbOpen&&<div style={{display:"flex",gap:2,padding:"2px 6px",marginBottom:2}}>
            {["scrolly","bento","editorial","notion","m3"].map(m=>(
              <button key={m} onClick={()=>setDesignMode(m)} style={{flex:1,padding:"5px 1px",borderRadius:ir,cursor:"pointer",fontSize:8,fontWeight:designMode===m?700:500,fontFamily:fb,
                background:designMode===m?(dk?`${teal}18`:tealBg):"transparent",
                color:designMode===m?teal:tm,border:designMode===m?`1px solid ${teal}30`:`1px solid transparent`,
                textAlign:"center",lineHeight:1.2,transition:"all .15s"
              }}>{({scrolly:"Scrolly",bento:"Bento",editorial:"Edit.",notion:"Notion",m3:"M3"})[m]}</button>
            ))}
          </div>}
          {/* Color presets */}
          {sbOpen&&<div style={{display:"flex",gap:3,padding:"2px 8px",marginBottom:4,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:8,fontWeight:600,color:tm,fontFamily:fb,flexShrink:0,width:"100%",marginBottom:1}}>Theme</span>
            {colorPresets.map((cp,i)=>{
              const active = primaryColor===cp.navy && accentColor===cp.teal;
              return (
                <button key={i} onClick={()=>{setPrimaryColor(cp.navy);setAccentColor(cp.teal);}} title={cp.label}
                  style={{position:"relative",width:16,height:16,borderRadius:8,cursor:"pointer",border:active?`2px solid ${dk?"#fff":"#333"}`:"1.5px solid transparent",padding:0,background:"none",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                  <div style={{width:12,height:12,borderRadius:6,overflow:"hidden",display:"flex"}}>
                    <div style={{width:"50%",height:"100%",background:cp.navy}}/>
                    <div style={{width:"50%",height:"100%",background:cp.teal}}/>
                  </div>
                </button>
              );
            })}
          </div>}
          {sbOpen&&<SbItem icon={I.Gear} label="Settings" dim/>}
          <div style={{display:"flex",gap:4,marginTop:4}}>
            <button onClick={()=>mob?setMob(false):setSbOpen(!sbOpen)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"8px",borderRadius:sr,cursor:"pointer",color:tm,fontSize:12,fontFamily:f,background:"none",border:"none"}}>{sbOpen?<I.Collapse/>:<I.Expand/>}{sbOpen&&<span>Collapse</span>}</button>
            {sbOpen&&<button onClick={()=>{setSbHidden(true);setSbOpen(true);}} title="Hide sidebar" style={{display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:sr,cursor:"pointer",color:tm,fontSize:12,fontFamily:f,background:"none",border:`1px solid ${bd}`}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 17l5-5-5-5"/><path d="M6 17l5-5-5-5"/></svg>
            </button>}
          </div>
        </div>
      </nav>

      {mob&&sbOpen&&<div onClick={()=>setMob(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:999}}/>}

      {/* Floating sidebar show button */}
      {sbHidden&&!mob&&pg!=="videoassess"&&(
        <button onClick={()=>setSbHidden(false)} style={{position:"fixed",left:8,top:"50%",transform:"translateY(-50%)",zIndex:100,width:28,height:56,borderRadius:"0 8px 8px 0",background:dk?`${navy}CC`:navy,border:"none",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`2px 0 12px ${dk?"rgba(0,0,0,.3)":"rgba(0,0,0,.1)"}`,transition:"opacity .2s",opacity:.7}}
          onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity=".7"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/></svg>
        </button>
      )}

      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <header style={{height:52,display:"flex",alignItems:"center",padding:"0 20px",gap:10,flexShrink:0,borderBottom:`${bdw} solid ${bd}`}}>
          <button className="t-m" onClick={()=>{setMob(true);setSbOpen(true);}} style={{cursor:"pointer",color:ts,display:"none",background:"none",border:"none",padding:4}}><I.Menu/></button>
          {/* Persistent program deadline timer */}
          {curProg && (pg==="tasks"||pg==="center"||pg==="precheck") && (
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 12px",borderRadius:sr,background:dk?`${navy}18`:`${navy}06`,border:`1px solid ${dk?`${navy}30`:`${navy}10`}`}}>
              <I.Clock style={{width:14,height:14}}/>
              <span style={{fontSize:11,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>Due {curProg.due}</span>
              <CountdownInline dueDate={curProg.due}/>
            </div>
          )}
          <div style={{flex:1}}/>
          <div style={{position:"relative"}}>
            <button onClick={e=>{e.stopPropagation();setNotif(!notif);}} style={{padding:8,minWidth:36,minHeight:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:ts,position:"relative",borderRadius:ir,background:"none",border:"none"}}><I.Bell/><div style={{position:"absolute",top:4,right:4,width:6,height:6,borderRadius:3,background:teal}}/></button>
            {notif&&<div className="td" onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"calc(100% + 6px)",right:0,width:280,background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,boxShadow:`0 12px 40px ${dk?"rgba(0,0,0,.3)":"rgba(0,0,0,.06)"}`,overflow:"hidden",zIndex:100}}>
              <div style={{padding:"12px 16px",borderBottom:`${bdw} solid ${bd}`,fontSize:13,fontWeight:700,fontFamily:f,color:dk?"#fff":navy}}>Notifications</div>
              {[{t:"Assessment closes in 12 days",c:red},{t:"Hogan report available",c:teal}].map((n,i)=><div key={i} style={{padding:"10px 16px",borderBottom:`${bdw} solid ${bd}`,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:13,fontFamily:f}} onMouseEnter={e=>e.currentTarget.style.background=bg2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{width:6,height:6,borderRadius:3,background:n.c}}/>{n.t}</div>)}
            </div>}
          </div>
          <div style={{position:"relative"}}>
            <button onClick={e=>{e.stopPropagation();setProf(!prof);}} style={{width:34,height:34,borderRadius:sr,background:navy,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:11,fontFamily:f,cursor:"pointer",border:"none"}}>KL</button>
            {prof&&<div className="td" onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"calc(100% + 6px)",right:0,width:200,background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,boxShadow:`0 12px 40px ${dk?"rgba(0,0,0,.3)":"rgba(0,0,0,.06)"}`,overflow:"hidden",zIndex:100}}>
              <div style={{padding:"12px 16px",borderBottom:`${bdw} solid ${bd}`}}><div style={{fontSize:14,fontWeight:700,fontFamily:f,color:dk?"#fff":navy}}>Kshitij Lau</div><div style={{fontSize:12,color:ts,fontFamily:f}}>Product Management</div></div>
              {["Profile","Settings"].map(l=><div key={l} style={{padding:"9px 16px",cursor:"pointer",fontSize:13,color:ts,fontFamily:f}} onMouseEnter={e=>e.currentTarget.style.background=bg2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{l}</div>)}
              <div style={{borderTop:`${bdw} solid ${bd}`}}><div style={{padding:"9px 16px",cursor:"pointer",fontSize:13,color:red,fontFamily:f,display:"flex",alignItems:"center",gap:5}}><I.Out/> Sign out</div></div>
            </div>}
          </div>
        </header>
        <main id="main" ref={mainRef} style={{flex:1,padding:pg==="videoassess"?0:"0 24px",overflow:pg==="videoassess"?"hidden":"auto"}}>{renderMain()}</main>
      </div>

      {/* Report preview modal */}
      <PreviewModal/>

      {/* IDP full-screen overlay */}
      {idpOpen && <IdpFullScreen/>}

      {/* Chat */}
      <div style={{position:"fixed",bottom:20,right:20,zIndex:50}}>
        {chatOpen&&<div className="td" style={{width:300,height:350,background:card,border:`${bdw} solid ${bd}`,borderRadius:cr,boxShadow:csh,boxShadow:`0 12px 40px ${dk?"rgba(0,0,0,.4)":"rgba(0,0,0,.08)"}`,display:"flex",flexDirection:"column",marginBottom:10,overflow:"hidden"}}>
          <div style={{padding:"12px 14px",borderBottom:`${bdw} solid ${bd}`,display:"flex",alignItems:"center"}}><span style={{flex:1,fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f}}>Lighthouse Assistant</span><button onClick={()=>setChatOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button></div>
          <div style={{flex:1,overflow:"auto",padding:10,display:"flex",flexDirection:"column",gap:6}}>{chatMsgs.map((m,i)=><div key={i} style={{alignSelf:m.from==="bot"?"flex-start":"flex-end",maxWidth:"85%",background:m.from==="bot"?bg2:navy,color:m.from==="bot"?tx:"#fff",padding:"8px 12px",borderRadius:sr,fontSize:13,fontFamily:f,lineHeight:1.4}}>{m.text}</div>)}</div>
          <div style={{padding:8,borderTop:`${bdw} solid ${bd}`,display:"flex",gap:6}}><input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} placeholder="Ask anything..." onKeyDown={e=>{if(e.key==="Enter"&&chatMsg.trim()){setChatMsgs(p=>[...p,{from:"user",text:chatMsg}]);setChatMsg("");setTimeout(()=>setChatMsgs(p=>[...p,{from:"bot",text:"I can help with that!"}]),600);}}} style={{flex:1,padding:"8px 10px",borderRadius:ir,border:`${bdw} solid ${bd}`,background:dk?"rgba(255,255,255,.04)":"#fff",color:tx,fontSize:13,fontFamily:f,outline:"none"}}/></div>
        </div>}
        <button onClick={()=>setChatOpen(!chatOpen)} style={{width:46,height:46,borderRadius:23,background:navy,color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 16px ${navy}25`}}>{chatOpen?<I.X/>:<I.Help/>}</button>
      </div>
    </div>
  );
}
