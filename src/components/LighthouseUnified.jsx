import { useState, useEffect, useRef, useCallback } from "react";

// LIGHTHOUSE - UNIFIED DESIGN EXPLORER v4
// Three design modes: Scrollytelling, Bento Grid, Glassmorphism

export default function LighthouseExplorer() {
  const [dk, setDk] = useState(false);
  const [designMode, setDesignMode] = useState("scrolly"); // scrolly|bento|glass|neu|editorial|clay|aurora|darkprem|brutal|notion|material|organic
  const [pg, setPg] = useState("dash");
  const [sbOpen, setSbOpen] = useState(true);
  const [mob, setMob] = useState(false);
  const [notif, setNotif] = useState(false);
  const [prof, setProf] = useState(false);
  const [langO, setLangO] = useState(false);
  const [selLang, setSelLang] = useState("EN");
  const [sysStep, setSysStep] = useState(0);
  const [checks, setChecks] = useState({});
  const [running, setRunning] = useState(false);
  const [selProgram, setSelProgram] = useState(null);
  const [selCenter, setSelCenter] = useState(null);
  const [vis, setVis] = useState({});
  const [tour, setTour] = useState(0);
  const [showTour, setShowTour] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatMsgs, setChatMsgs] = useState([{from:"bot",text:"Hi Kshitij! 👋 How can we help you today?",time:"Just now"}]);
  const [schedView, setSchedView] = useState(null);
  const [bookConf, setBookConf] = useState(null);
  const [userTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  //  IDP STATE 
  const [idpStep, setIdpStep] = useState(0);
  const [idpChat, setIdpChat] = useState([]);
  const [idpInput, setIdpInput] = useState("");
  const [idpUploads, setIdpUploads] = useState([]);
  const [idpQIdx, setIdpQIdx] = useState(0);
  const [idpLoaderIdx, setIdpLoaderIdx] = useState(0);
  const [idpTyping, setIdpTyping] = useState(false);
  const [idpExpanded, setIdpExpanded] = useState("sk1");
  const [idpModal, setIdpModal] = useState(null);
  const [idpInsight, setIdpInsight] = useState(null);
  const [idpAddTo, setIdpAddTo] = useState(null);
  const [manualTip, setManualTip] = useState({type:70,title:"",desc:""});

  //  MANAGER APPROVAL STATE 
  const [idpStatus, setIdpStatus] = useState("approved");
  const [showChangeLog, setShowChangeLog] = useState(false);
  const [commentReply, setCommentReply] = useState({});
  const [activeComment, setActiveComment] = useState(null);
  const [showIdpComments, setShowIdpComments] = useState(true);
  const [idpComments, setIdpComments] = useState([
    {id:"c1",targetType:"skill",targetId:"sk1",from:"manager",name:"Sarah Chen",text:"Strong choice. I'd prioritize the cross-functional initiative — there's a VP presentation slot opening in April.",ts:"Feb 19, 2026 · 10:32 AM"},
    {id:"c2",targetType:"skill",targetId:"sk1",from:"subject",name:"Kshitij Lau",text:"Great idea! I'll coordinate with the Strategy team for the April slot.",ts:"Feb 19, 2026 · 2:15 PM"},
    {id:"c3",targetType:"tip",targetId:"t1",from:"manager",name:"Sarah Chen",text:"Consider partnering with Priya from EMEA — her initiative touches similar stakeholders and you could co-present.",ts:"Feb 19, 2026 · 10:40 AM"},
    {id:"c4",targetType:"tip",targetId:"t3",from:"manager",name:"Sarah Chen",text:"I've done this Coursera course — the boardroom simulation in Module 3 is particularly useful.",ts:"Feb 19, 2026 · 10:45 AM"},
    {id:"c5",targetType:"tip",targetId:"t3",from:"subject",name:"Kshitij Lau",text:"Thanks for the tip! I'll spend extra time on that module.",ts:"Feb 20, 2026 · 9:00 AM"},
    {id:"c6",targetType:"skill",targetId:"sk2",from:"manager",name:"Sarah Chen",text:"This is the area I'd like to see the most growth in. Your team wants more structured coaching.",ts:"Feb 19, 2026 · 11:00 AM"},
    {id:"c7",targetType:"tip",targetId:"t4",from:"manager",name:"Sarah Chen",text:"Pair with Alex and Jordan specifically — they're both at a stage where mentoring has maximum impact.",ts:"Feb 19, 2026 · 11:05 AM"},
    {id:"c8",targetType:"tip",targetId:"t4",from:"subject",name:"Kshitij Lau",text:"Agreed. I'll set up intro conversations with both next week.",ts:"Feb 20, 2026 · 11:30 AM"},
    {id:"c9",targetType:"skill",targetId:"sk3",from:"manager",name:"Sarah Chen",text:"Good that you've flagged this. The business case exercise will stretch you in exactly the right ways.",ts:"Feb 20, 2026 · 3:00 PM"},
  ]);
  const [idpChangeLog] = useState([
    {id:"cl1",type:"created",text:"IDP plan created by AI coach",ts:"Feb 18, 2026 · 4:30 PM",by:"System"},
    {id:"cl2",type:"edit",text:"Added skill: Strategic Thinking",ts:"Feb 18, 2026 · 4:45 PM",by:"Kshitij Lau"},
    {id:"cl3",type:"edit",text:"Marked Strategic Thinking as private",ts:"Feb 18, 2026 · 4:46 PM",by:"Kshitij Lau"},
    {id:"cl4",type:"submitted",text:"Plan submitted for manager approval",ts:"Feb 18, 2026 · 5:00 PM",by:"Kshitij Lau"},
    {id:"cl5",type:"comment",text:"Sarah Chen commented on Executive Presence & Influence",ts:"Feb 19, 2026 · 10:32 AM",by:"Sarah Chen"},
    {id:"cl6",type:"comment",text:"Sarah Chen commented on 3 development actions",ts:"Feb 19, 2026 · 10:45 AM",by:"Sarah Chen"},
    {id:"cl7",type:"comment",text:"Sarah Chen commented on Coaching & Developing Others",ts:"Feb 19, 2026 · 11:00 AM",by:"Sarah Chen"},
    {id:"cl8",type:"comment",text:"Kshitij Lau replied to 2 comments",ts:"Feb 19, 2026 · 2:15 PM",by:"Kshitij Lau"},
    {id:"cl9",type:"comment",text:"Sarah Chen commented on Strategic Thinking",ts:"Feb 20, 2026 · 3:00 PM",by:"Sarah Chen"},
    {id:"cl10",type:"approved",text:"Plan approved by manager",ts:"Feb 20, 2026 · 3:15 PM",by:"Sarah Chen",reason:"Excellent plan. Focus areas are well-chosen and actions are appropriately ambitious. Looking forward to reviewing progress in our monthly 1:1s."},
  ]);

  const addComment = (targetType,targetId,text) => {
    if(!text.trim()) return;
    setIdpComments(p=>[...p,{id:"c"+Date.now(),targetType,targetId,from:"subject",name:"Kshitij Lau",text:text.trim(),ts:"Just now"}]);
    setCommentReply(p=>({...p,[targetId]:""}));
  };

  const navigateToComment = (targetId) => {
    const sk = idpSkills.find(s=>s.id===targetId || s.tips.some(t=>t.id===targetId));
    if(sk) { setIdpExpanded(sk.id); setActiveComment(targetId); }
    setTimeout(()=>{
      const el = document.getElementById("comment-"+targetId);
      if(el) el.scrollIntoView({behavior:"smooth",block:"center"});
      setTimeout(()=>setActiveComment(null),2000);
    },300);
  };

  const isFrozen = idpStatus === "pending";
  const [idpSkills, setIdpSkills] = useState([
    {id:"sk1",name:"Executive Presence & Influence",desc:"Ability to communicate with authority, inspire confidence, and influence stakeholders at senior levels.",cat:"behavioural",private:false,tips:[
      {id:"t1",title:"Lead a cross-functional initiative",progress:35,desc:"Volunteer to sponsor and present a strategic initiative to the leadership team, practicing structured storytelling and confident delivery.",type:70,source:"ai",start:"2026-03-15",end:"2026-06-15",success:"Successfully present initiative outcomes to VP-level audience with positive feedback scores ≥ 4/5.",insight:"Your skill gap report shows Executive Presence at 55/80. Combined with your preference for hands-on learning, an experiential project will accelerate growth."},
      {id:"t2",title:"Shadow a senior executive monthly",progress:20,desc:"Arrange monthly half-day shadowing sessions with a C-suite leader to observe how they navigate high-stakes conversations.",type:20,source:"library",start:"2026-03-15",end:"2026-09-15",success:"Complete 6 shadowing sessions with documented key takeaways and at least 3 adopted behaviours.",insight:"Your chat responses indicated interest in mentoring relationships."},
      {id:"t3",title:"Executive Communication Masterclass",progress:0,desc:"Coursera specialization covering strategic narrative, boardroom presence, and stakeholder management.",type:10,source:"library",start:"2026-04-01",end:"2026-05-15",success:"Complete all 4 modules with a certificate score ≥ 85%.",insight:"You mentioned preferring structured courses alongside hands-on work.",course:{name:"Executive Communication Masterclass",platform:"Coursera",duration:"6 weeks",seats:142,img:"📘",link:"https://coursera.org"}},
    ]},
    {id:"sk2",name:"Coaching & Developing Others",desc:"Capability to mentor, provide developmental feedback, and grow the talent pipeline within your teams.",cat:"behavioural",private:false,tips:[
      {id:"t4",title:"Mentor two junior team members",progress:50,desc:"Take on two formal mentees for a 6-month cycle using the GROW model.",type:70,source:"ai",start:"2026-03-15",end:"2026-09-15",success:"Both mentees report measurable skill improvement and rate coaching ≥ 4/5.",insight:"Coaching Others scored 48/75 — the largest gap."},
      {id:"t5",title:"Join a coaching peer circle",progress:0,desc:"Participate in a monthly coaching peer circle with 4-5 managers to practice feedback techniques.",type:20,source:"library",start:"2026-04-01",end:"2026-09-01",success:"Attend ≥ 5 of 6 sessions and contribute one case study.",insight:"Peer learning complements your collaborative preferences."},
      {id:"t6",title:"ICF Coaching Fundamentals",progress:0,desc:"Introduction to coaching certification. Firm-sponsored cohort starting April.",type:10,source:"library",start:"2026-04-10",end:"2026-06-10",success:"Pass final assessment ≥ 80% and complete 10 practice hours.",insight:"Formal training addresses the foundational gap.",course:{name:"ICF Coaching Fundamentals",platform:"Internal Training",duration:"8 weeks",seats:18,img:"🎓",link:"#"}},
    ]},
    {id:"sk3",name:"Strategic Thinking",desc:"Ability to analyze complex situations, anticipate market shifts, and develop long-term strategies.",cat:"behavioural",private:true,tips:[
      {id:"t7",title:"Own a strategic business case",progress:10,desc:"Develop and present a full business case for a new market opportunity.",type:70,source:"ai",start:"2026-04-01",end:"2026-07-01",success:"Business case approved by leadership within 30 days.",insight:"Strategic Thinking at 62/85. A real project forces applied learning."},
      {id:"t8",title:"Strategy discussion group",progress:0,desc:"Join bi-monthly leadership strategy roundtable to debate trends and practice strategic framing.",type:20,source:"ai",start:"2026-04-01",end:"2026-10-01",success:"Present 2 trend analyses rated ≥ 4/5 on strategic depth.",insight:"Social learning with senior peers was highlighted as a growth preference."},
      {id:"t9",title:"Strategic Thinking for Leaders — Udemy",progress:0,desc:"Practical course on frameworks including Blue Ocean and Porter's Five Forces.",type:10,source:"library",start:"2026-04-15",end:"2026-05-30",success:"Complete course and apply 2 frameworks to a real challenge.",insight:"Formal training provides structured mental models.",course:{name:"Strategic Thinking for Leaders",platform:"Udemy",duration:"4 weeks",seats:null,img:"📗",link:"https://udemy.com"}},
    ]},
  ]);
  const skillLibrary = {
    behavioural:["Emotional Intelligence","Resilience & Adaptability","Conflict Resolution","Decision Making Under Uncertainty","Leading Change","Influencing Without Authority"],
    technical:["Data Analytics & Visualization","AI & Machine Learning Literacy","Product Strategy & Roadmapping","Financial Modelling","Digital Transformation","Agile Methodologies"],
    others:["Personal Branding","Work-Life Integration","Cross-Cultural Communication","Presentation Design","Negotiation Skills","Design Thinking"],
  };
  const tipLibrary = [
    {title:"Volunteer for a stretch assignment",type:70,desc:"Take on a task outside your comfort zone."},
    {title:"Run a workshop for your team",type:70,desc:"Teach what you're learning to deepen understanding."},
    {title:"Lead a process improvement project",type:70,desc:"Identify an inefficiency and lead the fix."},
    {title:"Find a mentor in this area",type:20,desc:"Approach someone strong in this skill for monthly conversations."},
    {title:"Join a community of practice",type:20,desc:"Participate in groups focused on this skill area."},
    {title:"Reverse mentoring pair",type:20,desc:"Exchange expertise with someone from a different function."},
    {title:"Complete a LinkedIn Learning path",type:10,desc:"Structured video course series with certificate."},
    {title:"Attend an industry conference",type:10,desc:"Immerse in the latest thinking from experts."},
    {title:"Read 2-3 key books on the topic",type:10,desc:"Curated reading list with reflection journaling."},
  ];

  const sectionRefs = useRef({});

  const runChecks = () => {
    setRunning(true); setChecks({});
    ["browser","internet","camera","mic","upload"].forEach((c,i) => {
      setTimeout(() => {
        setChecks(p => ({...p, [c]: c === "internet" ? "warning" : "pass"}));
        if (i === 4) setRunning(false);
      }, 900*(i+1));
    });
  };

  // Scroll to top when view changes
  const mainRef = useRef(null);
  const obsRef = useRef(null);
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo({top: 0, behavior: "smooth"});
    if (obsRef.current) obsRef.current.disconnect();
    const timer = setTimeout(() => {
      try {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(e => { if (e.isIntersecting) setVis(p => ({...p, [e.target.dataset.sid]: true})); });
        }, {threshold: 0.05});
        obsRef.current = obs;
        Object.values(sectionRefs.current).forEach(el => { if(el) obs.observe(el); });
      } catch(e) {}
    }, 80);
    // Fallback: force-show dashboard sections if observer fails in iframe
    const fallback = setTimeout(() => {
      if(pg==="dash") setVis(p => ({...p,hero:true,status:true,quicklinks:true,reports:true,next:true}));
    }, 300);
    return () => { clearTimeout(timer); clearTimeout(fallback); if (obsRef.current) obsRef.current.disconnect(); };
  }, [sysStep, selProgram, selCenter, pg, designMode]);

  useEffect(() => {
    const h = () => { setNotif(false); setProf(false); setLangO(false); };
    if (notif||prof||langO) { setTimeout(()=>document.addEventListener("click",h),0); return ()=>document.removeEventListener("click",h); }
  }, [notif,prof,langO]);

  const onKey = useCallback((e) => {
    if (e.key === "Escape") { setNotif(false); setProf(false); setLangO(false); setMob(false); if(tour) setTour(0); }
  }, [tour]);
  useEffect(() => { document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey); }, [onKey]);

  // Check mobile
  useEffect(() => {
    const check = () => { if (window.innerWidth < 769) { setSbOpen(false); } };
    check(); window.addEventListener("resize", check); return () => window.removeEventListener("resize", check);
  }, []);

  // Brand
  const navy = "#002C77";
  const teal = "#008575";
  const purple = "#7B61FF";

  const bg = {glass:dk?"#0A0D1A":"#EEF1F8",bento:dk?"#0C0F1A":"#F4F5F7",neu:dk?"#1a1d2e":"#E0E5EC",editorial:dk?"#0C0F1A":"#FAFAFA",clay:dk?"#1a1530":"#F0EDFF",aurora:dk?"#060818":"#F8FAFF",darkprem:dk?"#0C0B10":"#FAF9F6",brutal:dk?"#111":"#FFFFFF",notion:dk?"#191919":"#FFFFFF",material:dk?"#1C1B1F":"#FFFBFE",organic:dk?"#1a1714":"#FDF8F3"}[designMode]||(dk?"#0c1220":"#fafbfc");
  const bg2 = dk ? "#111a2b" : "#EEF6FA";
  const sbBg = {glass:dk?"rgba(15,23,36,.85)":"rgba(242,246,249,.75)",neu:dk?"#1e2136":"#D6DBE4",editorial:dk?"#0f1724":"#F5F5F5",clay:dk?"#1e1840":"#E8E4F8",aurora:dk?"rgba(6,8,24,.9)":"rgba(248,250,255,.85)",darkprem:dk?"#0a090e":"#F5F3EF",brutal:dk?"#000":"#F0F0F0",notion:dk?"#202020":"#F7F6F3",material:dk?"#1C1B1F":"#FFFBFE",organic:dk?"#16130f":"#F5EDE4"}[designMode]||(dk?"#0f1724":"#f2f6f9");
  const card = {glass:dk?"rgba(255,255,255,.04)":"rgba(255,255,255,.65)",neu:dk?"#1a1d2e":"#E0E5EC",clay:dk?"#241e48":"#FFFFFF",aurora:dk?"rgba(255,255,255,.03)":"rgba(255,255,255,.7)",darkprem:dk?"#16141c":"#FFFFFF",brutal:dk?"#111":"#FFFFFF",notion:dk?"#2C2C2C":"#FFFFFF",material:dk?"#2B2930":"#FFFBFE",organic:dk?"#221e19":"#FFFFFF"}[designMode]||(dk?"#141e30":"#ffffff");
  const bd = {glass:dk?"rgba(255,255,255,.08)":"rgba(255,255,255,.5)",neu:dk?"rgba(255,255,255,.03)":"transparent",editorial:dk?"rgba(255,255,255,.05)":"rgba(0,0,0,.06)",clay:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)",aurora:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)",darkprem:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",brutal:dk?"#fff":"#000",notion:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",material:dk?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)",organic:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"}[designMode]||(dk?"rgba(255,255,255,.07)":"rgba(0,44,119,.07)");
  const tx = dk ? "#e8eef6" : "#0f1a2e";
  const ts = dk ? "#96a8be" : "#3d5070";
  const tm = dk ? "#748da6" : "#6b7f96";
  const navyBg = dk ? "rgba(0,44,119,.22)" : "rgba(0,44,119,.07)";
  const tealBg = dk ? "rgba(0,180,160,.14)" : "rgba(0,180,160,.08)";
  const purpleBg = dk ? "rgba(123,97,255,.16)" : "rgba(123,97,255,.08)";
  const warn = "#c98a00";
  const red = "#c5303f";
  const green = "#1a8a42";
  const orange = "#c96d10";
  const f = "'DM Sans',sans-serif";
  const isGlass = designMode==="glass";
  const isBento = designMode==="bento";
  const isNeu = designMode==="neu";
  const isEdit = designMode==="editorial";
  const isClay = designMode==="clay";
  const isAurora = designMode==="aurora";
  const isDarkPrem = designMode==="darkprem";
  const isBrutal = designMode==="brutal";
  const isNotion = designMode==="notion";
  const isMaterial = designMode==="material";
  const isOrganic = designMode==="organic";
  const isGridMode = isBento||isGlass||isNeu||isClay||isAurora||isDarkPrem||isMaterial||isOrganic;
  const focusRing = isBrutal ? `0 0 0 3px ${dk?"#fff":"#000"}` : `0 0 0 3px ${teal}80`;
  const neuSh = isNeu ? (dk ? {boxShadow:"6px 6px 14px rgba(0,0,0,.35), -6px -6px 14px rgba(255,255,255,.04)"} : {boxShadow:"6px 6px 14px rgba(163,177,198,.5), -6px -6px 14px rgba(255,255,255,.8)"}) : {};
  const neuShIn = isNeu ? (dk ? {boxShadow:"inset 4px 4px 8px rgba(0,0,0,.3), inset -4px -4px 8px rgba(255,255,255,.03)"} : {boxShadow:"inset 4px 4px 8px rgba(163,177,198,.4), inset -4px -4px 8px rgba(255,255,255,.7)"}) : {};
  const glassBlur = isGlass ? {backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)"} : {};
  const glassBlur2 = isGlass ? {backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"} : {};

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    @keyframes tfade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes tspin{to{transform:rotate(360deg)}}
    @keyframes tcheck{0%{transform:scale(0)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
    @keyframes tpulse{0%,100%{opacity:.35}50%{opacity:1}}
    @keyframes floatOrb{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-20px) scale(1.1)}}
    .tv{opacity:0;transform:translateY(18px);transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1)}
    .tv.show{opacity:1;transform:translateY(0)}
    .tv2{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.16,1,.3,1) .1s,transform .7s cubic-bezier(.16,1,.3,1) .1s}
    .tv2.show{opacity:1;transform:translateY(0)}
    .tv3{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.16,1,.3,1) .2s,transform .7s cubic-bezier(.16,1,.3,1) .2s}
    .tv3.show{opacity:1;transform:translateY(0)}
    .tc{animation:tcheck .3s ease both}
    .td{animation:tfade .25s ease both}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${dk?"rgba(255,255,255,.08)":"rgba(0,44,119,.08)"};border-radius:3px}
    *:focus-visible{outline:none;box-shadow:${focusRing}!important;border-radius:8px}
    .skip-link{position:absolute;top:-60px;left:8px;background:${navy};color:#fff;padding:8px 16px;border-radius:8px;z-index:10000;font-size:14px;font-weight:700;text-decoration:none}
    .skip-link:focus{top:8px}
    .gc{backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
    @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
  `;

  // Icons
  const I={Home:()=><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,Book:()=><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,Cal:()=><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,Bell:()=><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,Gear:()=><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,Down:()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>,Check:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>,Warn:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,Shield:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,Arrow:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,Back:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,Menu:()=><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,Collapse:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polyline points="11 17 6 12 11 7"/><line x1="18" y1="12" x2="6" y2="12"/></svg>,Expand:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polyline points="13 7 18 12 13 17"/><line x1="6" y1="12" x2="18" y2="12"/></svg>,Monitor:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,Wifi:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,Cam:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,Mic:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>,Upload:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,Spin:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{animation:"tspin 1s linear infinite"}}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>,Moon:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,Sun:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="5"/></svg>,Globe:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/></svg>,Out:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,Clock:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,Users:()=><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,Clip:()=><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,Video:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polygon points="23 7 16 12 23 17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,Play:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21"/></svg>,Lock:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,Phone:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,ChevD:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="1.5" aria-hidden="true" style={{animation:"tpulse 2s ease infinite"}}><polyline points="6 9 12 15 18 9"/></svg>,Chart:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,Brain:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 2C8 2 5 5 5 9c0 3 2 5 4 6v3a2 2 0 004 0v-3c2-1 4-3 4-6 0-4-3-7-5-7z"/></svg>,Sim:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>,Timer:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3L2 6m20-3l-3 3"/><line x1="12" y1="1" x2="12" y2="3"/></svg>,Help:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,X:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,Star:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,Dl:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,FileText:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,Link2:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,Seat:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 11V6a7 7 0 0114 0v5"/><path d="M3 11h18v5a4 4 0 01-4 4H7a4 4 0 01-4-4z"/></svg>,Mail:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>,Zap:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,Plus:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>};

  const Section = ({id,children,className=""}) => (
    <div ref={el=>sectionRefs.current[id]=el} data-sid={id} className={`${className} ${vis[id]?"show":""}`} style={{padding:"0 0 44px"}}>{children}</div>
  );

  //  Reusable components 
  const Btn = ({children,primary,secondary,small,disabled,onClick,ariaLabel,style:s}) => {
    const bRad = isBrutal?0:isMaterial?20:isNeu?14:isNotion?6:isBento?10:isClay?14:isOrganic?16:isEdit?8:12;
    const bFont = isBrutal?"'DM Mono','Courier New',monospace":f;
    const bExtra = {
      ...(isBrutal?{textTransform:"uppercase",letterSpacing:.5}:{}),
      ...(isNeu&&!disabled&&!primary&&!secondary?neuShIn:{}),
      ...(isNeu&&primary?neuSh:{}),
    };
    return <button onClick={disabled?undefined:onClick} aria-label={ariaLabel} aria-disabled={disabled||undefined}
      style={{padding:small?"8px 16px":"11px 24px",minHeight:small?32:44,borderRadius:bRad,
        border:isBrutal?(disabled?`2px solid ${tm}40`:`2px solid ${dk?"#fff":"#000"}`):disabled?`1px solid ${tm}40`:primary||secondary?"none":`1px solid ${bd}`,
        background:disabled?"transparent":primary?(isDarkPrem?"#C9A84C":navy):secondary?teal:isGlass||isAurora?(dk?"rgba(255,255,255,.04)":"rgba(255,255,255,.5)"):"transparent",
        ...(isGlass||isAurora?glassBlur2:{}),
        color:disabled?tm:primary?(isBrutal?(dk?"#000":"#fff"):"#fff"):secondary?"#fff":tx,fontWeight:isBrutal?900:700,fontSize:small?13:14,cursor:disabled?"not-allowed":"pointer",fontFamily:bFont,
        display:"inline-flex",alignItems:"center",gap:6,opacity:disabled?.5:1,
        boxShadow:primary&&!disabled&&dk&&isGlass?`0 4px 20px ${navy}50`:primary&&!disabled?`0 4px 16px ${navy}20`:"none",transition:"all .2s",...bExtra,...s}}>{children}</button>;
  };

  const StatusBadge = ({status}) => {
    const m = {complete:{bg:`${green}18`,c:green,t:"Complete"},progress:{bg:`${orange}14`,c:orange,t:"In Progress"},locked:{bg:`${tm}14`,c:tm,t:"Locked"},notstarted:{bg:navyBg,c:dk?"#ccc":navy,t:"Not Started"}};
    const v = m[status]||m.notstarted;
    return <span role="status" style={{fontSize:11,fontWeight:isBrutal?900:700,color:v.c,background:v.bg,padding:"3px 10px",borderRadius:isBrutal?0:isMaterial?12:8,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f,display:"inline-flex",alignItems:"center",gap:4}}>
      {status==="locked"&&<I.Lock/>}{status==="complete"&&<I.Check/>}{v.t}
    </span>;
  };

  const DueDate = ({date,urgent}) => (
    <span role="timer" style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:13,fontWeight:700,fontFamily:f,
      color:urgent?"#fff":dk?"#fff":navy,background:urgent?red:navyBg,padding:"5px 14px",borderRadius:isBrutal?0:isMaterial?16:10,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f}}>
      <I.Clock/> Due {date}
    </span>
  );

  const ProgramTimer = ({days,hours,mins}) => (
    <div role="timer" aria-label={`${days} days, ${hours} hours, ${mins} minutes remaining`}
      style={{display:"inline-flex",alignItems:"center",gap:10,padding:"10px 16px",background:dk?`${red}18`:`${red}08`,borderRadius:isBrutal?0:isMaterial?20:12,border:isBrutal?`2px solid ${red}`:`1px solid ${red}20`}}>
      <I.Timer/>
      <div>
        <div style={{fontSize:10,fontWeight:600,color:ts,fontFamily:f,marginBottom:1}}>Time Remaining</div>
        <div style={{display:"flex",gap:5}}>
          {[{v:days,l:"d"},{v:hours,l:"h"},{v:mins,l:"m"}].map(t=>(
            <span key={t.l} style={{fontSize:15,fontWeight:800,color:red,fontFamily:f}}>{t.v}<span style={{fontSize:10,fontWeight:600,color:ts,marginLeft:1}}>{t.l}</span></span>
          ))}
        </div>
      </div>
    </div>
  );

  //  Tour 
  const tourSteps = [
    {title:"Welcome to Lighthouse!",desc:"Hi Kshitij! Let's take a quick tour to help you navigate the platform confidently.",ic:I.Star},
    {title:"Your Dashboard",desc:"This is your home base — see all active programs, progress, and upcoming deadlines at a glance.",ic:I.Home},
    {title:"Programs & Assessments",desc:"Click a program to see individual assessments and assessment centers. Some have multiple phases with pre-work and live calls.",ic:I.Clip},
    {title:"System Check",desc:"Before proctored sessions, run a system check to verify your camera, mic, and internet connection.",ic:I.Shield},
    {title:"You're All Set!",desc:"Use the sidebar to navigate. Collapse it anytime with the arrow button. Need help? Click the ? icon in the top bar.",ic:I.Check},
  ];

  const TourOverlay = () => {
    if (!tour) return null;
    const step = tourSteps[tour-1];
    return (
      <div role="dialog" aria-modal="true" aria-label="Guided tour" style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.55)",backdropFilter:"blur(5px)"}}>
        <div style={{background:dk?"#1a2638":card,borderRadius:22,boxShadow:"0 20px 60px rgba(0,0,0,.25)",padding:"36px 32px",maxWidth:400,width:"92%",textAlign:"center",border:`1px solid ${bd}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <span style={{fontSize:12,fontWeight:700,color:teal,fontFamily:f}}>Step {tour} of {tourSteps.length}</span>
            <button onClick={()=>setTour(0)} aria-label="Close tour" style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button>
          </div>
          <div style={{width:52,height:52,borderRadius:16,background:`linear-gradient(135deg,${tealBg},${navyBg})`,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",color:teal}}><step.ic/></div>
          <h2 style={{fontSize:20,fontWeight:800,color:tx,fontFamily:f,marginBottom:8}}>{step.title}</h2>
          <p style={{fontSize:15,color:ts,fontFamily:f,lineHeight:1.7,marginBottom:22}}>{step.desc}</p>
          <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:16}}>
            {tourSteps.map((_,i)=>(<div key={i} style={{width:8,height:8,borderRadius:4,background:i+1===tour?teal:`${tm}40`,transition:"all .2s"}}/>))}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            {tour>1&&<Btn small onClick={()=>setTour(tour-1)}>Back</Btn>}
            {tour<tourSteps.length?<Btn primary small onClick={()=>setTour(tour+1)}>Next <I.Arrow/></Btn>:
            <Btn primary small onClick={()=>setTour(0)}>Get Started <I.Arrow/></Btn>}
          </div>
        </div>
      </div>
    );
  };

  //  Sidebar 
  const sbRadius = isBrutal?0:isMaterial?20:isNotion?6:isNeu?14:isBento?8:isEdit?4:isClay?16:isOrganic?16:12;
  const sbItemBg = (act) => act ? (
    isBrutal?(dk?"#fff":"#000") : isMaterial?(dk?navy+"30":navy+"12") : isNeu?(dk?"rgba(0,44,119,.15)":"rgba(0,44,119,.06)") : isDarkPrem?(dk?"rgba(201,168,76,.12)":"rgba(201,168,76,.06)") : isOrganic?(dk?"rgba(176,125,75,.12)":"rgba(176,125,75,.06)") : (dk?"rgba(0,44,119,.15)":"rgba(0,44,119,.06)")
  ) : "transparent";
  const sbItemColor = (act) => act ? (
    isBrutal?(dk?"#000":"#fff") : isDarkPrem?"#C9A84C" : isOrganic?"#B07D4B" : (dk?"#fff":navy)
  ) : ts;
  const sbItemStyle = (act) => ({
    ...(isNeu&&act ? neuShIn : {}),
    ...(isBrutal ? {borderRadius:0,border:act?`2px solid ${dk?"#fff":"#000"}`:"2px solid transparent",fontFamily:"'DM Mono','Courier New',monospace",textTransform:"uppercase",fontSize:12,letterSpacing:.5} : {}),
    ...(isMaterial ? {borderRadius:20} : {}),
    ...(isNotion ? {borderRadius:6} : {}),
    ...(isClay&&act ? {boxShadow:"inset 2px 2px 6px rgba(0,0,0,.06)"} : {}),
  });

  const NavItem = ({icon:Ic,label,id,badge}) => {
    const act = pg===id;
    return <button onClick={()=>{setPg(id);setMob(false);setSelProgram(null);setSelCenter(null);setSysStep(0);setVis({});setSchedView(null);setBookConf(null)}}
      aria-current={act?"page":undefined}
      style={{display:"flex",alignItems:"center",gap:sbOpen?10:0,padding:sbOpen?"9px 14px":"9px 0",justifyContent:sbOpen?"flex-start":"center",borderRadius:sbRadius,cursor:"pointer",border:"none",width:"100%",textAlign:"left",
        color:sbItemColor(act),fontWeight:act?700:500,fontSize:14,fontFamily:f,
        background:sbItemBg(act),transition:"all .2s",...sbItemStyle(act)}}>
      <Ic/>{sbOpen&&<span style={{flex:1,whiteSpace:"nowrap",overflow:"hidden"}}>{label}</span>}
      {sbOpen&&badge&&<span aria-label={`${badge} new`} style={{fontSize:11,fontWeight:700,color:teal,background:tealBg,padding:"2px 8px",borderRadius:isBrutal?0:isMaterial?12:8}}>{badge}</span>}
      {!sbOpen&&badge&&<div style={{position:"absolute",top:2,right:2,width:6,height:6,borderRadius:3,background:teal}}/>}
    </button>;
  };

  const sbW = sbOpen ? 228 : 60;

  const Sidebar = () => (
    <nav aria-label="Main navigation" style={{
      width: mob ? 260 : sbW,
      height:"100vh",background:sbBg,...glassBlur,
      borderRight:isBrutal?`2px solid ${dk?"#fff":"#000"}`:isNeu?"none":`1px solid ${bd}`,
      ...(isNeu?neuSh:{}),
      display:"flex",flexDirection:"column",flexShrink:0,
      position: mob ? "fixed" : "sticky", top:0, zIndex: mob ? 1000 : 2,
      left: mob ? (mob && !sbOpen ? -280 : 0) : 0,
      transition:"width .25s cubic-bezier(.16,1,.3,1), left .25s cubic-bezier(.16,1,.3,1)",
      overflow:"hidden"
    }}>
      {/* Logo */}
      <div style={{padding:sbOpen?"18px 16px 10px":"18px 0 10px",display:"flex",alignItems:"center",gap:10,flexShrink:0,justifyContent:sbOpen?"flex-start":"center"}}>
        <div style={{width:34,height:34,borderRadius:isBrutal?0:isMaterial?17:isNeu?12:10,
          background:isBrutal?(dk?"#fff":"#000"):isDarkPrem?`linear-gradient(135deg,#1a1a1a,#C9A84C)`:isOrganic?`linear-gradient(135deg,#B07D4B,${teal})`:`linear-gradient(135deg,${navy},${teal})`,
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
          boxShadow:isNeu?(dk?"4px 4px 10px rgba(0,0,0,.3),-4px -4px 10px rgba(255,255,255,.03)":"4px 4px 10px rgba(163,177,198,.4),-4px -4px 10px rgba(255,255,255,.7)"):`0 2px 8px ${navy}20`}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l2 8h-4l2-8z" fill={isBrutal?(dk?"#000":"#fff"):"white"} opacity=".9"/><rect x="10" y="10" width="4" height="10" rx={isBrutal?0:1} fill={isBrutal?(dk?"#000":"#fff"):"white"} opacity=".5"/></svg>
        </div>
        {sbOpen&&<div><div style={{fontSize:15,fontWeight:800,color:isDarkPrem?(dk?"#C9A84C":"#1a1a1a"):dk?"#fff":navy,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f,...(isBrutal?{textTransform:"uppercase",letterSpacing:1,fontSize:13}:{})}}>Lighthouse</div><div style={{fontSize:10,color:tm,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f}}>Mercer · Acme Corp</div></div>}
      </div>

      {/* Nav items */}
      <div style={{flex:1,padding:sbOpen?"4px 8px":"4px 6px",display:"flex",flexDirection:"column",gap:isBrutal?0:isMaterial?2:1,overflowY:"auto",overflowX:"hidden",minHeight:0}}>
        <NavItem icon={I.Home} label="Dashboard" id="dash"/>
        <NavItem icon={I.Book} label="Development" id="dev"/>
        <NavItem icon={I.Cal} label="Scheduling" id="sched"/>
        <NavItem icon={I.Bell} label="Notifications" id="notifs" badge="2"/>
        {sbOpen&&<><div style={{height:isBrutal?0:8}}/><div style={{padding:isBrutal?"8px 14px":"0 14px",fontSize:10,fontWeight:700,color:isDarkPrem?(dk?"#C9A84C":"#8B7230"):tm,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f,letterSpacing:isBrutal?2:.6,textTransform:"uppercase",marginBottom:4,...(isBrutal?{borderTop:`2px solid ${dk?"#fff":"#000"}`,borderBottom:`2px solid ${dk?"#fff":"#000"}`}:{})}}>Programs</div></>}
        <NavItem icon={I.Clip} label="Leadership 2026" id="prog-la"/>
        <NavItem icon={I.Users} label="360° Perspective" id="prog-360"/>
      </div>

      {/* Footer */}
      <div style={{padding:sbOpen?"8px":"8px 6px",flexShrink:0,borderTop:isBrutal?`2px solid ${dk?"#fff":"#000"}`:`1px solid ${dk?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)"}`}}>
        {sbOpen&&<div style={{display:"flex",gap:4,padding:"2px 6px",marginBottom:4}}>
          <button onClick={e=>{e.stopPropagation();setLangO(!langO)}} aria-label="Change language" aria-expanded={langO}
            style={{position:"relative",display:"flex",alignItems:"center",gap:3,padding:"6px 8px",borderRadius:isBrutal?0:8,cursor:"pointer",color:isDarkPrem?(dk?"#C9A84C":"#8B7230"):tm,fontSize:12,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f,background:"none",border:isBrutal?`1px solid ${dk?"#fff":"#000"}`:"none"}}>
            <I.Globe/>{selLang}<I.Down/>
            {langO&&<div className="td" role="listbox" onClick={e=>e.stopPropagation()} style={{position:"absolute",bottom:"100%",left:0,width:120,background:card,border:isBrutal?`2px solid ${dk?"#fff":"#000"}`:`1px solid ${bd}`,borderRadius:isBrutal?0:12,overflow:"hidden",marginBottom:4,boxShadow:isBrutal?"none":`0 8px 24px ${dk?"rgba(0,0,0,.3)":"rgba(0,0,0,.06)"}`,zIndex:10}}>
              {["EN","AR","FR","ES","ZH","HI"].map(l=>(<div key={l} role="option" aria-selected={l===selLang} onClick={()=>{setSelLang(l);setLangO(false)}} tabIndex={0} onKeyDown={e=>e.key==="Enter"&&(setSelLang(l),setLangO(false))}
                style={{padding:"7px 12px",cursor:"pointer",fontSize:12,fontFamily:f,color:l===selLang?navy:ts,fontWeight:l===selLang?700:400}} onMouseEnter={e=>e.currentTarget.style.background=bg2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{l}</div>))}
            </div>}
          </button>
          <button onClick={()=>setDk(!dk)} aria-label={dk?"Switch to light mode":"Switch to dark mode"}
            style={{display:"flex",alignItems:"center",gap:3,padding:"6px 8px",borderRadius:isBrutal?0:8,cursor:"pointer",color:isDarkPrem?(dk?"#C9A84C":"#8B7230"):tm,fontSize:12,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f,background:"none",border:isBrutal?`1px solid ${dk?"#fff":"#000"}`:"none"}}>
            {dk?<I.Sun/>:<I.Moon/>}{dk?"Light":"Dark"}
          </button>
        </div>}
        {sbOpen&&<NavItem icon={I.Gear} label="Settings" id="settings"/>}
        <button onClick={()=>mob?setMob(false):setSbOpen(!sbOpen)} aria-label={sbOpen?"Collapse sidebar":"Expand sidebar"}
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"8px",borderRadius:isBrutal?0:isMaterial?20:10,cursor:"pointer",color:isDarkPrem?(dk?"#C9A84C":"#8B7230"):tm,fontSize:12,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f,background:"none",border:"none",marginTop:4}}
          onMouseEnter={e=>e.currentTarget.style.color=ts} onMouseLeave={e=>e.currentTarget.style.color=isDarkPrem?"#C9A84C":tm}>
          {sbOpen?<I.Collapse/>:<I.Expand/>}
          {sbOpen&&<span>{isBrutal?"COLLAPSE":"Collapse"}</span>}
        </button>
      </div>
    </nav>
  );

  //  Data 
  const assessments = [
    {id:"thriving",name:"Thriving Index",desc:"Measure well-being, resilience, and engagement levels",icon:I.Chart,time:"25 min",status:"complete",pct:100,color:teal},
    {id:"hogan",name:"Hogan Assessment",desc:"Leadership personality profiling & derailment risk analysis",icon:I.Brain,time:"40 min",status:"progress",pct:50,color:purple},
    {id:"cognitive",name:"Cognitive Ability Test",desc:"Verbal, numerical, and abstract reasoning evaluation",icon:I.Brain,time:"35 min",status:"notstarted",pct:0,color:navy},
    {id:"interview",name:"Video Interview",desc:"Structured behavioral interview with AI-powered analysis",icon:I.Video,time:"30 min",status:"locked",pct:0,color:purple},
  ];

  const centers = [
    {id:"simulation",name:"Business Simulation Center",desc:"Strategic decision-making across multiple phases including market analysis, presentation, and crisis response.",icon:I.Sim,time:"60 min",status:"notstarted",color:navy},
    {id:"leadership-ac",name:"Leadership Assessment Center",desc:"Group exercises, role plays, and case study presentations with live observers.",icon:I.Star,time:"90 min",status:"locked",color:purple},
  ];

  const centerActivities = [
    {id:"prework",name:"Pre-work: Case Brief",desc:"Read the scenario document before the simulation begins",type:"prework",time:"15 min",status:"complete",pct:100},
    {id:"sim1",name:"Phase 1: Market Analysis",desc:"Analyze market data and identify key opportunities",type:"assessment",time:"20 min",status:"complete",pct:100},
    {id:"sim2",name:"Phase 2: Strategy Presentation",desc:"Present your strategic recommendations to the panel",type:"assessment",time:"20 min",status:"progress",pct:60},
    {id:"call",name:"Group Discussion Call",desc:"Join the live panel discussion with other participants",type:"call",time:"30 min",status:"locked",pct:0,scheduled:"Mar 3, 2:00 PM"},
    {id:"sim3",name:"Phase 3: Crisis Response",desc:"Handle an unexpected market disruption scenario",type:"assessment",time:"20 min",status:"locked",pct:0},
  ];

  //  SCHEDULING SLOTS 
  const slots = [
    {id:"s1",title:"Business Simulation — Cohort A",desc:"Morning session for EMEA region participants",center:"Business Simulation",days:1,start:"2026-03-10",end:"2026-03-10",
     times:[{t:"09:00",seats:3,booked:1},{t:"11:00",seats:5,booked:3},{t:"14:00",seats:2,booked:2}]},
    {id:"s2",title:"Business Simulation — Cohort B",desc:"Afternoon session for APAC region participants",center:"Business Simulation",days:1,start:"2026-03-12",end:"2026-03-12",
     times:[{t:"10:00",seats:4,booked:0},{t:"15:00",seats:6,booked:2}]},
    {id:"s3",title:"Leadership AC — Spring Batch",desc:"Two-day intensive leadership assessment center",center:"Leadership AC",days:2,start:"2026-03-15",end:"2026-03-16",
     times:[{t:"09:30",seats:8,booked:5},{t:"14:00",seats:4,booked:1}]},
    {id:"s4",title:"Group Discussion — Final Round",desc:"Panel discussion with senior assessors",center:"Business Simulation",days:1,start:"2026-03-20",end:"2026-03-20",
     times:[{t:"10:00",seats:6,booked:4},{t:"16:00",seats:6,booked:0}]},
  ];
  const [bookedSlots, setBookedSlots] = useState([{slotId:"s1",time:"09:00",date:"2026-03-10",title:"Business Simulation — Cohort A"}]);
  const bookSlot = (slot, time) => { setBookedSlots(p=>[...p,{slotId:slot.id,time:time.t,date:slot.start,title:slot.title}]); setBookConf({slot,time:time.t}); };
  const fmtTz = (utc) => { try { const d = new Date(`2026-01-01T${utc}:00Z`); return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",timeZone:userTz}); } catch { return utc; } };

  //  REPORTS 
  const reports = [
    {id:"r1",assessment:"Thriving Index",date:"Feb 18, 2026",type:"Wellbeing & Resilience",icon:I.Chart,color:teal},
    {id:"r2",assessment:"Hogan Assessment",date:"Feb 20, 2026",type:"Leadership Personality",icon:I.Brain,color:purple},
  ];

  //  UPCOMING EVENTS 
  const upcomingEvents = [
    {id:"e1",title:"Business Simulation — Cohort A",date:"Mar 10",time:"09:00 UTC",type:"Assessment Center",color:navy,daysAway:17},
    {id:"e2",title:"Hogan Assessment",date:"Mar 3",time:"Anytime",type:"Self-paced",color:purple,daysAway:10},
    {id:"e3",title:"Group Discussion Call",date:"Mar 3",time:"14:00 UTC",type:"Live Call",color:teal,daysAway:10},
  ];

  //  QUICK LINKS 
  const quickLinks = [
    {label:"Continue Hogan",desc:"50% complete",icon:I.Brain,color:purple,action:()=>setSelProgram("leadership")},
    {label:"Book AC Slot",desc:"Slots available",icon:I.Cal,color:navy,action:()=>setPg("sched")},
    {label:"View Reports",desc:"2 ready",icon:I.FileText,color:teal,action:()=>{}},
  ];

  //  System Check 
  const SysCheckView = () => {
    const items = [{k:"browser",ic:I.Monitor,l:"Browser"},{k:"internet",ic:I.Wifi,l:"Internet"},{k:"camera",ic:I.Cam,l:"Camera"},{k:"mic",ic:I.Mic,l:"Microphone"},{k:"upload",ic:I.Upload,l:"Upload Speed"}];
    const allDone = items.every(c=>checks[c.k]);
    return (
      <main id="main" style={{maxWidth:540,margin:"0 auto",padding:"28px 0"}}>
        <button onClick={()=>setSysStep(0)} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",color:ts,fontSize:14,fontFamily:f,fontWeight:500,marginBottom:18,background:"none",border:"none"}}><I.Back/> Back</button>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:12,fontWeight:700,color:teal,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>System Verification</div>
          <h1 style={{fontSize:30,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-.5,marginBottom:8}}>
            {sysStep===1?"Let's check your setup, Kshitij":"Running checks..."}
          </h1>
        </div>
        {sysStep===1&&<div style={{textAlign:"center"}}>
          <div style={{width:60,height:60,borderRadius:18,background:tealBg,margin:"0 auto 22px",display:"flex",alignItems:"center",justifyContent:"center",color:teal,border:`1px solid ${teal}15`}}><I.Shield/></div>
          <p style={{fontSize:15,color:ts,fontFamily:f,lineHeight:1.7,marginBottom:24,maxWidth:380,margin:"0 auto 24px"}}>We'll verify your browser, camera, microphone, and internet connection.</p>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn onClick={()=>setSysStep(0)}>Cancel</Btn><Btn primary onClick={()=>{setSysStep(2);runChecks()}}>Begin <I.Arrow/></Btn></div>
        </div>}
        {sysStep>=2&&<div role="list" style={{display:"flex",flexDirection:"column",gap:0}}>
          {items.map((it,i)=>{const st=checks[it.k];
            return <div key={it.k} role="listitem" style={{display:"flex",gap:14,alignItems:"flex-start"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:4}} aria-hidden="true">
                <div style={{width:10,height:10,borderRadius:5,background:st==="pass"?teal:st==="warning"?warn:tm,transition:"all .4s",boxShadow:st?`0 0 8px ${st==="pass"?teal:warn}30`:"none"}}/>
                {i<items.length-1&&<div style={{width:1,height:38,background:st?`${st==="pass"?teal:warn}40`:bd}}/>}
              </div>
              <div style={{flex:1,paddingBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 0"}}>
                  <div style={{width:38,height:38,borderRadius:10,background:card,border:`1px solid ${bd}`,display:"flex",alignItems:"center",justifyContent:"center",color:st?(st==="pass"?teal:warn):tm}}><it.ic/></div>
                  <span style={{flex:1,fontSize:15,fontWeight:600,color:tx,fontFamily:f}}>{it.l}</span>
                  {!st&&running?<I.Spin/>:!st?<span style={{color:tm,fontSize:12}}>Waiting</span>:
                  st==="pass"?<span className="tc" style={{color:teal,fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:3}}><I.Check/> Pass</span>:
                  <span className="tc" style={{color:warn,fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:3}}><I.Warn/> Slow</span>}
                </div>
              </div>
            </div>;
          })}
          {allDone&&<div style={{marginTop:14,textAlign:"center",animation:"tfade .5s ease both"}}><Btn primary onClick={()=>{setSysStep(0);setSelProgram("leadership");setVis({ph:true,pa:true,pc:true})}}>Enter Program <I.Arrow/></Btn></div>}
        </div>}
      </main>
    );
  };

  //  Program Detail (scrollytelling) 
  const ProgramDetail = () => (
    <main id="main" style={{maxWidth:700,margin:"0 auto",padding:"0 0 60px"}}>
      <button onClick={()=>{setSelProgram(null);setSelCenter(null);setVis({hero:true,status:true,quicklinks:true,reports:true,next:true})}} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",color:ts,fontSize:14,fontFamily:f,fontWeight:500,marginBottom:18,paddingTop:6,background:"none",border:"none"}}><I.Back/> Back to Dashboard</button>

      {/*  CLEAN HEADER  */}
      <Section id="ph" className="tv">
        <header style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"26px",marginBottom:10}}>
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:12,fontWeight:700,color:dk?"#ccc":navy,background:navyBg,padding:"4px 12px",borderRadius:8,fontFamily:f}}>Assessment Program</span>
            <span style={{fontSize:12,fontWeight:600,color:ts,fontFamily:f}}>Proctored · Video</span>
          </div>
          <h1 style={{fontSize:28,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-.4,marginBottom:8,lineHeight:1.3}}>Leadership Potential Assessment 2026</h1>
          <p style={{fontSize:15,color:ts,fontFamily:f,lineHeight:1.7,marginBottom:0}}>Welcome, Kshitij. Complete centers and assessments below to finish this program.</p>
        </header>

        {/*  COMPACT INFO BAR: progress + timer + due + video  */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"stretch"}}>
          <div style={{background:card,border:`1px solid ${bd}`,borderRadius:14,padding:"14px 18px",flex:1,minWidth:160}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:13,fontWeight:600,color:ts,fontFamily:f}}>Progress</span>
              <span style={{fontSize:15,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>2 / 6</span>
            </div>
            <div style={{display:"flex",gap:4}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{flex:1,height:5,borderRadius:3,background:i<=2?`linear-gradient(90deg,${navy},${teal})`:(dk?"rgba(255,255,255,.06)":"rgba(0,44,119,.05)")}}/>))}</div>
          </div>
          <div style={{background:card,border:`1px solid ${bd}`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <DueDate date="Mar 5" urgent/>
            <ProgramTimer days={12} hours={8} mins={30}/>
          </div>
          <div aria-label="Watch instructions video" tabIndex={0} role="button"
            style={{background:`linear-gradient(135deg,${navy},${teal})`,borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",minWidth:140}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}><I.Play/></div>
            <div><div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:f}}>Instructions</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)",fontFamily:f}}>Watch video</div></div>
          </div>
        </div>
      </Section>

      {/*  1. ASSESSMENT CENTERS (shown first)  */}
      <Section id="pc" className="tv">
        <h2 style={{fontSize:13,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:16}}>Assessment Centers</h2>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {centers.map((c,i) => {
            const locked = c.status==="locked";
            return <article key={c.id} className={`tv${i?"2":""} ${vis["pc"]?"show":""}`}
              style={{background:card,border:`1px solid ${bd}`,borderRadius:18,overflow:"hidden",opacity:locked?.5:1}}>
              <div style={{background:`linear-gradient(135deg,${c.color}${dk?"25":"08"},${teal}${dk?"10":"04"})`,padding:"14px 22px",borderBottom:`1px solid ${c.color}15`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:.8,fontFamily:f,color:c.color,background:`${c.color}18`,padding:"3px 10px",borderRadius:6}}>Mercer Assessment Center</span>
                  <StatusBadge status={c.status}/>
                </div>
                <p style={{fontSize:13,color:ts,fontFamily:f,fontStyle:"italic"}}>You are invited — click Enter Center for more details</p>
              </div>
              <div style={{padding:"18px 22px"}}>
                <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                  <div style={{width:44,height:44,borderRadius:12,background:card,border:`1px solid ${bd}`,display:"flex",alignItems:"center",justifyContent:"center",color:locked?tm:c.color,flexShrink:0}}><c.icon/></div>
                  <div style={{flex:1,minWidth:160}}>
                    <h3 style={{fontSize:16,fontWeight:700,color:locked?tm:tx,fontFamily:f,margin:"0 0 3px"}}>{c.name}</h3>
                    <p style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.5,marginBottom:4}}>{c.desc}</p>
                    <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:12,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,background:navyBg,padding:"2px 8px",borderRadius:6}}><I.Clock/> {c.time}</span>
                  </div>
                  <div style={{flexShrink:0}}>
                    {locked?<Btn disabled small><I.Lock/> Locked</Btn>:
                    <Btn primary small onClick={()=>{setSelCenter(c.id);setVis({ch:true,ca:true})}} ariaLabel={`Enter ${c.name}`}>Enter Center <I.Arrow/></Btn>}
                  </div>
                </div>
              </div>
            </article>;
          })}
        </div>
      </Section>

      {/*  2. INDIVIDUAL ASSESSMENTS (shown second)  */}
      <Section id="pa" className="tv">
        <h2 style={{fontSize:13,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:16}}>Individual Assessments</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
          {assessments.map((a,i) => {
            const locked = a.status==="locked";
            const Ic = a.icon;
            return <article key={a.id} className={`tv${i>1?"2":""} ${vis["pa"]?"show":""}`}
              style={{background:card,border:`1px solid ${bd}`,borderRadius:14,padding:"18px 20px",opacity:locked?.5:1,position:"relative",overflow:"hidden",transitionDelay:`${i*60}ms`,display:"flex",flexDirection:"column",gap:10,minHeight:160}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,borderRadius:"3px 0 0 3px",background:a.status==="complete"?teal:a.status==="progress"?orange:locked?tm:navy}}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{width:40,height:40,borderRadius:10,background:locked?`${tm}08`:card,border:`1px solid ${locked?tm+"20":bd}`,display:"flex",alignItems:"center",justifyContent:"center",color:locked?tm:a.color}}><Ic/></div>
                <StatusBadge status={a.status}/>
              </div>
              <div style={{flex:1}}>
                <h3 style={{fontSize:14,fontWeight:700,color:locked?tm:tx,fontFamily:f,margin:"0 0 4px",lineHeight:1.3}}>{a.name}</h3>
                <span style={{display:"flex",alignItems:"center",gap:3,fontSize:11,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,background:navyBg,padding:"2px 7px",borderRadius:6,width:"fit-content"}}><I.Clock/> {a.time}</span>
              </div>
              {a.pct>0&&a.pct<100&&<div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{flex:1,height:4,background:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.05)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,width:`${a.pct}%`,background:a.color}}/></div>
                <span style={{fontSize:11,fontWeight:700,color:a.color,fontFamily:f}}>{a.pct}%</span>
              </div>}
              <div>
                {a.status==="complete"?<span style={{fontSize:11,fontWeight:700,color:teal,background:tealBg,padding:"4px 10px",borderRadius:8,fontFamily:f,display:"flex",alignItems:"center",gap:4,justifyContent:"center"}}><I.FileText/> Report</span>:
                locked?<Btn disabled small style={{width:"100%",justifyContent:"center"}}><I.Lock/> Locked</Btn>:
                a.status==="progress"?<Btn secondary small style={{width:"100%",justifyContent:"center"}}>Continue <I.Arrow/></Btn>:
                <Btn primary small style={{width:"100%",justifyContent:"center"}}>Start <I.Arrow/></Btn>}
              </div>
            </article>;
          })}
        </div>
        <p style={{fontSize:13,color:tm,fontFamily:f,marginTop:12,lineHeight:1.6}}>Assessments unlock sequentially as you progress.</p>
      </Section>
    </main>
  );

  //  Assessment Center (decluttered — no program timer here) 
  const AssessmentCenter = () => (
    <main id="main" style={{maxWidth:660,margin:"0 auto",padding:"0 0 60px"}}>
      <button onClick={()=>{setSelCenter(null);setVis({ph:true,pa:true,pc:true})}} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",color:ts,fontSize:14,fontFamily:f,fontWeight:500,marginBottom:18,paddingTop:6,background:"none",border:"none"}}><I.Back/> Back to Program</button>

      <Section id="ch" className="tv">
        <header style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"24px 26px",marginBottom:10}}>
          <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:12,fontWeight:700,color:dk?"#ccc":navy,background:navyBg,padding:"4px 12px",borderRadius:8,fontFamily:f}}>Mercer Assessment Center</span>
            <StatusBadge status="progress"/>
          </div>
          <h1 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:6}}>Business Simulation</h1>
          <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.7,marginBottom:12}}>Welcome, Kshitij. Complete each activity in order — the next phase unlocks when the current one is done.</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
            <DueDate date="Mar 5, 2026" urgent/>
            <span style={{fontSize:13,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,display:"flex",alignItems:"center",gap:4,background:navyBg,padding:"3px 10px",borderRadius:8}}><I.Clock/> 60 min</span>
          </div>
        </header>
      </Section>

      <Section id="ca" className="tv">
        <h2 style={{fontSize:13,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:16}}>Activities</h2>
        <div role="list" style={{display:"flex",flexDirection:"column",gap:0}}>
          {centerActivities.map((a,i) => {
            const locked = a.status==="locked";
            const isCall = a.type==="call";
            const isPrework = a.type==="prework";
            return <div key={a.id} role="listitem" className={`tv${i>2?"2":""} ${vis["ca"]?"show":""}`}
              style={{display:"flex",gap:14,alignItems:"flex-start",transitionDelay:`${i*60}ms`}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:6,flexShrink:0}} aria-hidden="true">
                <div style={{width:12,height:12,borderRadius:6,border:`2px solid ${a.status==="complete"?teal:a.status==="progress"?orange:tm}`,background:a.status==="complete"?teal:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {a.status==="complete"&&<svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                {i<centerActivities.length-1&&<div style={{width:2,height:"100%",minHeight:65,background:a.status==="complete"?`${teal}40`:`${tm}20`}}/>}
              </div>
              <article style={{background:card,border:`1px solid ${bd}`,borderRadius:16,padding:"20px 22px",marginBottom:12,flex:1,opacity:locked?.5:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,fontFamily:f,color:isPrework?purple:isCall?teal:dk?"#ccc":navy,background:isPrework?purpleBg:isCall?tealBg:navyBg,padding:"3px 10px",borderRadius:6}}>{isPrework?"Pre-work":isCall?"Live Call":"Assessment"}</span>
                  <StatusBadge status={a.status}/>
                </div>
                <h3 style={{fontSize:16,fontWeight:700,color:locked?tm:tx,fontFamily:f,margin:"0 0 4px"}}>{a.name}</h3>
                <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.5,marginBottom:10}}>{a.desc}</p>
                <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <span style={{display:"flex",alignItems:"center",gap:4,fontSize:13,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,background:navyBg,padding:"3px 10px",borderRadius:8}}><I.Clock/> {a.time}</span>
                  {a.scheduled&&<span style={{fontSize:13,fontWeight:700,color:teal,background:tealBg,padding:"4px 12px",borderRadius:8,fontFamily:f}}>{a.scheduled}</span>}
                  {a.pct>0&&a.pct<100&&<><div style={{width:60,height:5,background:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.05)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,width:`${a.pct}%`,background:orange}}/></div><span style={{fontSize:13,fontWeight:700,color:orange,fontFamily:f}}>{a.pct}%</span></>}
                  <div style={{flex:1}}/>
                  {a.status==="complete"?<span style={{color:teal,fontSize:13,fontWeight:700,fontFamily:f,display:"flex",alignItems:"center",gap:4}}><I.Check/> Done</span>:
                  locked?<Btn disabled small><I.Lock/> Locked</Btn>:
                  isCall?<Btn secondary small ariaLabel="Join group discussion call"><I.Phone/> Join Call</Btn>:
                  a.status==="progress"?<Btn secondary small>Continue <I.Arrow/></Btn>:
                  <Btn primary small>Start <I.Arrow/></Btn>}
                </div>
              </article>
            </div>;
          })}
        </div>
      </Section>
    </main>
  );

  //  IDP QUESTIONS & LOGIC 
  const idpQuestions = [
    {q:"Let's start with what you enjoy. What aspects of your current role do you find most fulfilling?",
     suggestions:["Leading and mentoring team members","Strategic planning and big-picture thinking","Problem-solving and analytical challenges","Collaborating across departments"]},
    {q:"What areas of your role feel most challenging or where you'd like to improve?",
     suggestions:["Stakeholder communication & influence","Time management under pressure","Technical depth in new domains","Delegating effectively"]},
    {q:"Are you looking to deepen your expertise in your current role, or explore a transition to a new one?",
     suggestions:["Grow and advance in my current role","Transition to a more senior leadership role","Explore a lateral move to a new function","I'm open to both — help me decide"]},
    {q:"What skills from your experience do you consider most transferable?",
     suggestions:["Project management & execution","People leadership & team building","Data-driven decision making","Cross-functional collaboration"]},
    {q:"What new skills or competencies would you most like to develop?",
     suggestions:["Executive presence & communication","Strategic thinking & business acumen","Coaching and developing others","Digital / technical fluency"]},
    {q:"What timeline are you working with for your development goals?",
     suggestions:["3 months — quick wins focus","6 months — balanced approach","12 months — comprehensive plan","18+ months — career transformation"]},
    {q:"How do you prefer to learn and develop?",
     suggestions:["Hands-on projects and stretch assignments","Mentoring and coaching conversations","Structured courses and certifications","Reading, reflection, and self-study"]},
    {q:"Do you have any external documents to share — such as manager feedback, 360° comments, or a self-assessment? You can upload PDFs or docs here.",
     suggestions:["I'll upload a document now","Skip — I don't have any files","I'll add them later"],isUpload:true},
  ];

  const idpLoaderSteps = [
    {text:"Analyzing your skill gap report…",icon:I.Chart},
    {text:"Processing your preferences & goals…",icon:I.Brain},
    {text:"Identifying key development areas…",icon:I.Star},
    {text:"Creating development actions (70-20-10)…",icon:I.Clip},
    {text:"Defining success criteria & milestones…",icon:I.Shield},
    {text:"Building your personalized IDP…",icon:I.FileText},
  ];

  const idpSkillGaps = [
    {skill:"Strategic Thinking",score:62,target:85,color:navy},
    {skill:"Executive Presence",score:55,target:80,color:purple},
    {skill:"Coaching Others",score:48,target:75,color:teal},
    {skill:"Data-Driven Decisions",score:78,target:90,color:green},
    {skill:"Stakeholder Influence",score:60,target:85,color:orange},
  ];

  const startIdpChat = () => {
    setIdpStep(2); setIdpQIdx(0); setIdpChat([]);
    setTimeout(() => {
      setIdpTyping(true);
      setTimeout(() => {
        setIdpChat([{from:"bot",text:"Hi Kshitij! I'm your development coach. I'll ask you a few questions to understand your goals and preferences, then we'll create a personalized development plan together. 🎯",time:"Now"}]);
        setTimeout(() => {
          setIdpChat(p => [...p,{from:"bot",text:idpQuestions[0].q,time:"Now",suggestions:idpQuestions[0].suggestions,isUpload:idpQuestions[0].isUpload}]);
          setIdpTyping(false);
        }, 800);
      }, 600);
    }, 300);
  };

  const idpAnswer = (text) => {
    const nextIdx = idpQIdx + 1;
    setIdpChat(p => [...p, {from:"user",text,time:"Now"}]);
    setIdpInput("");
    if (nextIdx < idpQuestions.length) {
      setIdpTyping(true);
      setTimeout(() => {
        const ack = ["Great insight!","Thanks for sharing that.","That's helpful to know.","Good — noted!","Understood.","Perfect.","That makes sense."][nextIdx % 7];
        setIdpChat(p => [...p, {from:"bot",text:ack,time:"Now"}]);
        setTimeout(() => {
          setIdpChat(p => [...p, {from:"bot",text:idpQuestions[nextIdx].q,time:"Now",suggestions:idpQuestions[nextIdx].suggestions,isUpload:idpQuestions[nextIdx].isUpload}]);
          setIdpQIdx(nextIdx);
          setIdpTyping(false);
        }, 600);
      }, 700);
    } else {
      setIdpTyping(true);
      setTimeout(() => {
        setIdpChat(p => [...p, {from:"bot",text:"Thank you, Kshitij! I have everything I need. Let me prepare your analysis now. ✨",time:"Now"}]);
        setIdpTyping(false);
        setTimeout(() => setIdpStep(3), 1200);
      }, 800);
    }
  };

  const idpHandleUpload = (e) => {
    const files = Array.from(e.target.files||[]);
    if (files.length) {
      setIdpUploads(p => [...p, ...files.map(f=>f.name)]);
      setIdpChat(p => [...p, {from:"user",text:`📎 Uploaded: ${files.map(f=>f.name).join(", ")}`,time:"Now"}]);
    }
  };

  const startIdpLoader = () => {
    setIdpStep(4); setIdpLoaderIdx(0);
    idpLoaderSteps.forEach((_,i) => { setTimeout(() => setIdpLoaderIdx(i), i * 1400); });
    setTimeout(() => setIdpStep(5), idpLoaderSteps.length * 1400 + 600);
  };

  //  Development View (Scrollytelling) 
  const DevView = () => {
    const stepLabels = ["Introduction","Skill Gap Report","AI Coach","Analysis","Building Plan"];
    const StepBar = () => (
      <div style={{display:"flex",gap:4,marginBottom:28,alignItems:"center"}}>
        {stepLabels.map((s,i) => {
          const active = idpStep === i || (idpStep === 4 && i === 4);
          const done = idpStep > i;
          return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <div style={{height:3,width:"100%",borderRadius:2,background:done?teal:active?`linear-gradient(90deg,${navy},${teal})`:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.05)",transition:"all .4s"}}/>
            <span style={{fontSize:11,fontWeight:done||active?700:500,color:done?teal:active?(dk?"#fff":navy):tm,fontFamily:f}}>{s}</span>
          </div>;
        })}
      </div>
    );

    // Step 0: Introduction
    if (idpStep === 0) return (
      <main id="main" className="sf" style={{maxWidth:700,margin:"0 auto",padding:"0 0 60px"}}>
        <div style={{padding:"24px 0 0",marginBottom:8}}>
          <h1 style={{fontSize:28,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-.3,marginBottom:4}}>Development</h1>
          <p style={{fontSize:15,color:ts,fontFamily:f,marginBottom:24}}>My Plan</p>
        </div>
        <StepBar/>
        <div style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"36px 30px",textAlign:"center"}}>
          <div style={{width:60,height:60,borderRadius:18,background:`${teal}10`,margin:"0 auto 20px",display:"flex",alignItems:"center",justifyContent:"center",color:teal}}><I.Book/></div>
          <h2 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:10}}>Your Individual Development Plan</h2>
          <p style={{fontSize:15,color:ts,fontFamily:f,lineHeight:1.8,maxWidth:520,margin:"0 auto 20px"}}>
            An IDP is your personalized roadmap for growth. Based on your skill gap report and preferences, we'll create a structured plan using the <b style={{color:dk?"#fff":navy}}>70-20-10</b> framework:
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
            {[{v:"70%",l:"On-the-Job",d:"Stretch assignments & projects",c:navy},{v:"20%",l:"Social",d:"Mentoring & coaching",c:teal},{v:"10%",l:"Formal",d:"Courses & certifications",c:purple}].map(x=>(
              <div key={x.l} style={{background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`,borderRadius:14,padding:"18px 18px",width:150,textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:800,color:x.c,fontFamily:f}}>{x.v}</div>
                <div style={{fontSize:13,fontWeight:700,color:tx,fontFamily:f,marginTop:4}}>{x.l}</div>
                <div style={{fontSize:11,color:ts,fontFamily:f,marginTop:2}}>{x.d}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:20}}>
            <div style={{background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`,borderRadius:14,padding:"14px 20px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} role="button" tabIndex={0}>
              <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${navy},${teal})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><I.Play/></div>
              <div style={{textAlign:"left"}}><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>Watch Introduction</div><div style={{fontSize:12,color:ts,fontFamily:f}}>2 min video overview</div></div>
            </div>
            <div style={{background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`,borderRadius:14,padding:"14px 20px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} role="button" tabIndex={0}>
              <div style={{width:40,height:40,borderRadius:12,background:`${teal}10`,display:"flex",alignItems:"center",justifyContent:"center",color:teal}}><I.FileText/></div>
              <div style={{textAlign:"left"}}><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>Read Guide</div><div style={{fontSize:12,color:ts,fontFamily:f}}>Step-by-step text guide</div></div>
            </div>
          </div>
          <Btn primary onClick={()=>setIdpStep(1)}>Get Started <I.Arrow/></Btn>
        </div>
      </main>
    );

    // Step 1: Skill Gap Report
    if (idpStep === 1) return (
      <main id="main" className="sf" style={{maxWidth:700,margin:"0 auto",padding:"0 0 60px"}}>
        <button onClick={()=>setIdpStep(0)} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",color:ts,fontSize:14,fontFamily:f,fontWeight:500,marginBottom:16,paddingTop:6,background:"none",border:"none"}}><I.Back/> Back</button>
        <h1 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:20}}>Development</h1>
        <StepBar/>
        <div style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"28px"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <div style={{width:48,height:48,borderRadius:14,background:`${navy}10`,display:"flex",alignItems:"center",justifyContent:"center",color:navy}}><I.Chart/></div>
            <div style={{flex:1}}>
              <h2 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,margin:0}}>Your Skill Gap Report</h2>
              <p style={{fontSize:13,color:ts,fontFamily:f,margin:0}}>Review your assessment results before we begin planning.</p>
            </div>
            <Btn small secondary><I.Dl/> Download PDF</Btn>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
            {idpSkillGaps.map(g=>(
              <div key={g.skill} style={{background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`,borderRadius:14,padding:"16px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{g.skill}</span>
                  <span style={{fontSize:13,fontFamily:f}}><span style={{fontWeight:800,color:g.color}}>{g.score}</span><span style={{color:tm}}> / {g.target} target</span></span>
                </div>
                <div style={{position:"relative",height:8,borderRadius:4,background:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)",overflow:"hidden"}}>
                  <div style={{position:"absolute",height:"100%",borderRadius:4,width:`${(g.score/100)*100}%`,background:g.color,transition:"width .8s ease"}}/>
                  <div style={{position:"absolute",left:`${(g.target/100)*100}%`,top:-2,bottom:-2,width:2,background:dk?"rgba(255,255,255,.3)":"rgba(0,0,0,.2)",borderRadius:1}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                  <span style={{fontSize:11,color:tm,fontFamily:f}}>Current: {g.score}</span>
                  <span style={{fontSize:11,color:g.score>=g.target?green:red,fontWeight:600,fontFamily:f}}>{g.score>=g.target?"On target":`Gap: ${g.target-g.score} pts`}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}><Btn primary onClick={startIdpChat}>Continue to AI Coach <I.Arrow/></Btn></div>
        </div>
      </main>
    );

    // Step 2: AI Coach Chat
    if (idpStep === 2) return (
      <main id="main" className="sf" style={{maxWidth:700,margin:"0 auto",padding:"0 0 60px"}}>
        <button onClick={()=>setIdpStep(1)} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",color:ts,fontSize:14,fontFamily:f,fontWeight:500,marginBottom:16,paddingTop:6,background:"none",border:"none"}}><I.Back/> Back</button>
        <h1 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:20}}>Development</h1>
        <StepBar/>
        <div style={{background:card,border:`1px solid ${bd}`,borderRadius:18,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:420,maxHeight:520}}>
          <div style={{padding:"16px 22px",background:`linear-gradient(135deg,${navy},${teal})`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <div style={{width:38,height:38,borderRadius:12,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><I.Brain/></div>
            <div><div style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:f}}>Development Coach</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.7)",fontFamily:f}}>Question {Math.min(idpQIdx+1,8)} of {idpQuestions.length}</div></div>
            <div style={{flex:1}}/>
            <div style={{display:"flex",gap:3}}>{idpQuestions.map((_,i)=>(<div key={i} style={{width:7,height:7,borderRadius:4,background:i<=idpQIdx?"#fff":"rgba(255,255,255,.25)",transition:"all .3s"}}/>))}</div>
          </div>
          <div style={{flex:1,padding:"16px 20px",overflowY:"auto",display:"flex",flexDirection:"column",gap:10,background:dk?"#0f1724":bg}}>
            {idpChat.map((m,i)=>(
              <div key={i}>
                <div style={{display:"flex",justifyContent:m.from==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"82%",padding:"12px 16px",borderRadius:m.from==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                    background:m.from==="user"?`linear-gradient(135deg,${navy},${teal})`:(dk?"rgba(255,255,255,.05)":card),
                    border:m.from==="bot"?`1px solid ${bd}`:"none",
                    color:m.from==="user"?"#fff":tx,fontSize:14,fontFamily:f,lineHeight:1.6}}>
                    {m.text}
                  </div>
                </div>
                {m.suggestions && i===idpChat.length-1 && !idpTyping && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8,paddingLeft:4}}>
                    {m.suggestions.map((s,j)=>(
                      <button key={j} onClick={()=>idpAnswer(s)} style={{padding:"8px 14px",borderRadius:12,border:`1px solid ${bd}`,background:dk?"rgba(255,255,255,.04)":card,color:tx,fontSize:13,fontFamily:f,fontWeight:500,cursor:"pointer",transition:"all .15s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=teal;e.currentTarget.style.background=tealBg}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=dk?"rgba(255,255,255,.07)":"rgba(0,44,119,.07)";e.currentTarget.style.background=dk?"rgba(255,255,255,.04)":card}}>
                        {s}
                      </button>
                    ))}
                    {m.isUpload && (
                      <label style={{padding:"8px 14px",borderRadius:12,border:`1px dashed ${teal}40`,background:tealBg,color:teal,fontSize:13,fontFamily:f,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                        <I.Upload/> Upload File
                        <input type="file" accept=".pdf,.doc,.docx" multiple style={{display:"none"}} onChange={idpHandleUpload}/>
                      </label>
                    )}
                  </div>
                )}
              </div>
            ))}
            {idpTyping && <div style={{display:"flex",gap:4,padding:"8px 12px",width:50}}>
              {[0,1,2].map(i=>(<div key={i} style={{width:7,height:7,borderRadius:4,background:teal,opacity:.5,animation:`tpulse 1.2s ${i*.2}s infinite`}}/>))}
            </div>}
            {idpUploads.length>0 && <div style={{fontSize:12,color:ts,fontFamily:f,padding:"4px 8px",background:tealBg,borderRadius:8,display:"inline-flex",alignItems:"center",gap:4,alignSelf:"flex-start",marginTop:4}}>📎 {idpUploads.length} file{idpUploads.length>1?"s":""} attached</div>}
          </div>
          <div style={{padding:"14px 20px",borderTop:`1px solid ${bd}`,display:"flex",gap:8,flexShrink:0,background:dk?"#141e30":card}}>
            <input value={idpInput} onChange={e=>setIdpInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&idpInput.trim()&&idpAnswer(idpInput.trim())}
              placeholder="Type your answer or pick a suggestion above…" disabled={idpTyping}
              style={{flex:1,padding:"11px 16px",borderRadius:14,border:`1px solid ${bd}`,background:dk?"rgba(255,255,255,.04)":"rgba(0,44,119,.03)",color:tx,fontSize:14,fontFamily:f,outline:"none"}}/>
            <button onClick={()=>idpInput.trim()&&idpAnswer(idpInput.trim())} disabled={!idpInput.trim()||idpTyping}
              style={{width:42,height:42,borderRadius:14,border:"none",background:idpInput.trim()?navy:tm+"30",color:"#fff",cursor:idpInput.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </main>
    );

    // Step 3: AI Analysis Summary
    if (idpStep === 3) return (
      <main id="main" className="sf" style={{maxWidth:700,margin:"0 auto",padding:"0 0 60px"}}>
        <h1 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:20}}>Development</h1>
        <StepBar/>
        <div style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"28px",marginBottom:16}}>
          <h2 style={{fontSize:20,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:40,height:40,borderRadius:12,background:`${teal}10`,display:"flex",alignItems:"center",justifyContent:"center",color:teal}}><I.Brain/></div>
            AI Analysis Summary
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {[
              {title:"Key Strengths",items:["Data-driven decision making","Project execution & delivery","Cross-functional collaboration"],dot:green},
              {title:"Development Areas",items:["Executive presence & influence","Coaching & developing others","Strategic thinking breadth"],dot:orange},
            ].map(sec=>(
              <div key={sec.title} style={{background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.5,textTransform:"uppercase",marginBottom:10}}>{sec.title}</div>
                {sec.items.map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{width:6,height:6,borderRadius:3,background:sec.dot,flexShrink:0}}/><span style={{fontSize:13,color:tx,fontFamily:f}}>{s}</span>
                  </div>
                ))}
              </div>
            ))}
            <div style={{background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`,borderRadius:14,padding:"18px 20px"}}>
              <div style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.5,textTransform:"uppercase",marginBottom:10}}>Chat Preference Analysis</div>
              <div style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.7}}>You're motivated by <b style={{color:tx}}>leadership growth</b> in your current role, prefer <b style={{color:tx}}>hands-on learning</b>, and target a <b style={{color:tx}}>6–12 month</b> development horizon.</div>
            </div>
            <div style={{background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`,borderRadius:14,padding:"18px 20px"}}>
              <div style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.5,textTransform:"uppercase",marginBottom:10}}>External File Analysis</div>
              {idpUploads.length > 0 ? (
                <div style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.7}}>Analyzed <b style={{color:tx}}>{idpUploads.length} document{idpUploads.length>1?"s":""}</b>. Manager highlights strong execution but flags opportunity to be more <b style={{color:tx}}>proactive in strategy discussions</b>.</div>
              ) : (
                <div style={{fontSize:13,color:tm,fontFamily:f,lineHeight:1.7,fontStyle:"italic"}}>No external documents provided. Plan based on assessment data and chat responses.</div>
              )}
            </div>
          </div>
          <div style={{background:dk?"rgba(255,255,255,.02)":"rgba(0,44,119,.02)",borderRadius:14,padding:"18px 22px",border:`1px solid ${dk?"rgba(255,255,255,.04)":"rgba(0,44,119,.04)"}`,marginBottom:20}}>
            <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.7,marginBottom:10}}>Based on your skill gap report, coaching conversation{idpUploads.length?", and uploaded documents":""}, I'll now create a personalized <b style={{color:dk?"#fff":navy}}>70-20-10 Individual Development Plan</b>.</p>
            <p style={{fontSize:13,color:tm,fontFamily:f}}>This will include actions, timelines, resources, and success criteria.</p>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
            <Btn onClick={()=>setIdpStep(2)}>← Back to Chat</Btn>
            <Btn primary onClick={startIdpLoader}>Create My IDP Plan <I.Arrow/></Btn>
          </div>
        </div>
      </main>
    );

    // Step 4: Interactive Loader
    if (idpStep === 4) return (
      <main id="main" className="sf" style={{maxWidth:700,margin:"0 auto",padding:"0 0 60px"}}>
        <h1 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:20}}>Development</h1>
        <StepBar/>
        <div style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"48px 30px",textAlign:"center"}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:`${teal}08`,margin:"0 auto 24px",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
            <svg width="72" height="72" style={{position:"absolute",animation:"tspin 3s linear infinite"}}><circle cx="36" cy="36" r="33" fill="none" stroke={teal} strokeWidth="2" strokeDasharray="40 170" strokeLinecap="round"/></svg>
            <div style={{color:teal}}>{(() => { const Ic = idpLoaderSteps[idpLoaderIdx]?.icon || I.Brain; return <Ic/>; })()}</div>
          </div>
          <h2 style={{fontSize:20,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:24}}>Building Your IDP</h2>
          <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:360,margin:"0 auto"}}>
            {idpLoaderSteps.map((s,i) => {
              const done = i < idpLoaderIdx;
              const active = i === idpLoaderIdx;
              return <div key={i} className={active?"sf":""} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderRadius:12,background:active?tealBg:"transparent",transition:"all .3s"}}>
                <div style={{width:24,height:24,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  background:done?`${green}18`:active?`${teal}18`:"transparent",
                  color:done?green:active?teal:tm,transition:"all .3s"}}>
                  {done?<I.Check/>:active?<div style={{width:6,height:6,borderRadius:3,background:teal,animation:"tpulse 1s infinite"}}/>:
                  <div style={{width:6,height:6,borderRadius:3,background:tm+"40"}}/>}
                </div>
                <span style={{fontSize:14,fontWeight:done||active?600:400,color:done?green:active?tx:tm,fontFamily:f,transition:"all .3s"}}>{s.text}</span>
              </div>;
            })}
          </div>
        </div>
      </main>
    );

    // Step 5: Full IDP Plan Page
    const togglePrivate = (skId) => setIdpSkills(p=>p.map(s=>s.id===skId?{...s,private:!s.private}:s));
    const deleteSkill = (skId) => setIdpSkills(p=>p.filter(s=>s.id!==skId));
    const deleteTip = (skId,tipId) => setIdpSkills(p=>p.map(s=>s.id===skId?{...s,tips:s.tips.filter(t=>t.id!==tipId)}:s));
    const updateProgress = (skId,tipId,val) => setIdpSkills(p=>p.map(s=>s.id===skId?{...s,tips:s.tips.map(t=>t.id===tipId?{...t,progress:Math.min(100,Math.max(0,val))}:t)}:s));
    const addManualTipFn = () => {
      if(!idpAddTo||!manualTip.title.trim()) return;
      const id="t"+Date.now();
      setIdpSkills(p=>p.map(s=>s.id===idpAddTo?{...s,tips:[...s.tips,{id,title:manualTip.title,desc:manualTip.desc||"Custom development action.",type:manualTip.type,source:"manual",start:"2026-04-01",end:"2026-07-01",progress:0,success:"Define your own success criteria.",insight:"Manually created development action."}]}:s));
      setManualTip({type:70,title:"",desc:""}); setIdpModal(null);
    };
    const addSkillFromLib = (name,cat) => {
      const id="sk"+Date.now();
      setIdpSkills(p=>[...p,{id,name,desc:"Custom skill added to your development plan.",cat,private:false,tips:[]}]);
      setIdpModal(null); setIdpExpanded(id);
    };
    const addTipFromLib = (tip) => {
      if(!idpAddTo) return;
      const id="t"+Date.now();
      setIdpSkills(p=>p.map(s=>s.id===idpAddTo?{...s,tips:[...s.tips,{...tip,id,progress:0,source:"library",start:"2026-04-01",end:"2026-07-01",success:"Define your own success criteria.",insight:"Selected from the development action library."}]}:s));
      setIdpModal(null);
    };
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [aiGenLoading, setAiGenLoading] = useState(false);
    const generateAiTips = (skId) => {
      setIdpAddTo(skId); setIdpModal("aiGen"); setAiGenLoading(true); setAiSuggestions([]);
      setTimeout(() => {
        setAiSuggestions([
          {title:"Create a 90-day action journal",type:70,desc:"Document daily experiences applying this skill with weekly reflections.",source:"ai",start:"2026-04-01",end:"2026-07-01",progress:0,success:"Complete 12 weekly entries with observable behaviour changes.",insight:"AI recommended based on your learning style."},
          {title:"Peer feedback exchange",type:20,desc:"Set up bi-weekly feedback exchanges with 2 trusted colleagues.",source:"ai",start:"2026-04-01",end:"2026-07-01",progress:0,success:"Collect 6 rounds of feedback showing upward trend.",insight:"Leverages your preference for collaborative development."},
          {title:"Micro-learning video series",type:10,desc:"10-minute daily videos on key concepts with practice exercises.",source:"ai",start:"2026-04-01",end:"2026-05-15",progress:0,success:"Complete 80% of videos and pass final quiz ≥ 85%.",insight:"Short-form content fits your stated timeline."},
        ]);
        setAiGenLoading(false);
      }, 1800);
    };
    const selectAiTip = (tip) => {
      if(!idpAddTo) return;
      const id="t"+Date.now();
      setIdpSkills(p=>p.map(s=>s.id===idpAddTo?{...s,tips:[...s.tips,{...tip,id}]}:s));
      setAiSuggestions(p=>p.filter(t=>t!==tip));
    };

    const TypeBadge = ({type}) => {
      const m = {70:{l:"70% Experience",c:navy,bg:navyBg},20:{l:"20% Social",c:teal,bg:tealBg},10:{l:"10% Formal",c:purple,bg:purpleBg}};
      const v = m[type]||m[70];
      return <span style={{fontSize:11,fontWeight:700,color:v.c,background:v.bg,padding:"3px 10px",borderRadius:8,fontFamily:f}}>{v.l}</span>;
    };
    const SourceBadge = ({source}) => (
      <span style={{fontSize:11,fontWeight:600,color:tm,background:dk?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",padding:"2px 8px",borderRadius:6,fontFamily:f,display:"flex",alignItems:"center",gap:3}}>
        {source==="ai"?<><I.Brain/> AI</>:source==="manual"?<><I.Plus/> Manual</>:<><I.Book/> Library</>}
      </span>
    );

    const totalTips = idpSkills.reduce((a,s)=>a+s.tips.length,0);
    const totalProgress = totalTips?Math.round(idpSkills.reduce((a,s)=>a+s.tips.reduce((b,t)=>b+(t.progress||0),0),0)/totalTips):0;
    const completedTips = idpSkills.reduce((a,s)=>a+s.tips.filter(t=>(t.progress||0)>=100).length,0);
    const getComments = (tid) => idpComments.filter(c=>c.targetId===tid);
    const statusMeta = {draft:{l:"Draft",c:tm,bg:dk?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",icon:I.Clip},pending:{l:"Pending Approval",c:orange,bg:`${orange}10`,icon:I.Clock},approved:{l:"Approved",c:green,bg:`${green}10`,icon:I.Check},rejected:{l:"Changes Requested",c:red,bg:`${red}10`,icon:I.Warn}};
    const sm = statusMeta[idpStatus]||statusMeta.draft;

    const CommentThread = ({targetId}) => {
      const cs = getComments(targetId);
      if(cs.length===0 && idpStatus==="draft") return null;
      return <div id={"comment-"+targetId} style={{marginTop:10,padding:"12px 16px",borderRadius:12,background:activeComment===targetId?(dk?`${teal}12`:`${teal}08`):(dk?"rgba(255,255,255,.02)":"rgba(0,44,119,.015)"),border:`1px solid ${activeComment===targetId?teal+"40":bd}`,transition:"all .5s"}}>
        {cs.length>0&&<div style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.4,textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:4}}><I.Users/> Comments ({cs.length})</div>}
        {cs.map(c=>(
          <div key={c.id} style={{display:"flex",gap:10,marginBottom:8}}>
            <div style={{width:28,height:28,borderRadius:10,background:c.from==="manager"?`${navy}12`:`${teal}12`,display:"flex",alignItems:"center",justifyContent:"center",color:c.from==="manager"?navy:teal,fontSize:11,fontWeight:800,fontFamily:f,flexShrink:0}}>{c.name.split(" ").map(n=>n[0]).join("")}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                <span style={{fontSize:12,fontWeight:700,color:tx,fontFamily:f}}>{c.name}</span>
                <span style={{fontSize:10,color:c.from==="manager"?navy:teal,fontWeight:600,background:c.from==="manager"?navyBg:tealBg,padding:"1px 6px",borderRadius:4,fontFamily:f}}>{c.from==="manager"?"Manager":"You"}</span>
                <span style={{fontSize:10,color:tm,fontFamily:f}}>{c.ts}</span>
              </div>
              <p style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.5,margin:0}}>{c.text}</p>
            </div>
          </div>
        ))}
        <div style={{display:"flex",gap:6,marginTop:cs.length?6:0}}>
          <input value={commentReply[targetId]||""} onChange={e=>setCommentReply(p=>({...p,[targetId]:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&commentReply[targetId]?.trim()&&addComment("skill",targetId,commentReply[targetId])}
            placeholder="Reply…" style={{flex:1,padding:"7px 12px",borderRadius:10,border:`1px solid ${bd}`,background:dk?"rgba(255,255,255,.03)":"rgba(0,44,119,.02)",color:tx,fontSize:12,fontFamily:f,outline:"none"}}/>
          <button onClick={()=>commentReply[targetId]?.trim()&&addComment("skill",targetId,commentReply[targetId])}
            style={{padding:"6px 12px",borderRadius:10,border:"none",background:commentReply[targetId]?.trim()?navy:tm+"20",color:"#fff",fontSize:11,fontWeight:700,fontFamily:f,cursor:commentReply[targetId]?.trim()?"pointer":"default"}}>Reply</button>
        </div>
      </div>;
    };

    return (
      <main id="main" className="sf" style={{maxWidth:920,margin:"0 auto",padding:"0 0 60px"}}>
        {/* STATUS BANNER */}
        {idpStatus!=="draft" && <div style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"16px 22px",marginBottom:16,display:"flex",alignItems:"center",gap:14,borderLeft:`4px solid ${sm.c}`,marginTop:10}}>
          <div style={{width:38,height:38,borderRadius:12,background:sm.bg,display:"flex",alignItems:"center",justifyContent:"center",color:sm.c,flexShrink:0}}>{(() => { const Ic=sm.icon; return <Ic/>; })()}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:sm.c,fontFamily:f}}>{sm.l}</div>
            {idpStatus==="approved"&&<p style={{fontSize:12,color:ts,fontFamily:f,margin:0}}>Approved by Sarah Chen on Feb 20, 2026</p>}
            {idpStatus==="pending"&&<p style={{fontSize:12,color:ts,fontFamily:f,margin:0}}>Waiting for Sarah Chen’s review. Editing is locked.</p>}
            {idpStatus==="rejected"&&<p style={{fontSize:12,color:ts,fontFamily:f,margin:0}}>Sarah Chen has requested changes.</p>}
          </div>
          <Btn small onClick={()=>setShowChangeLog(true)}><I.Clock/> Change Log</Btn>
          {idpStatus==="approved"&&<Btn small secondary onClick={()=>setIdpStatus("draft")}><I.Clip/> Edit Plan</Btn>}
        </div>}
        {idpStatus==="approved"&&idpChangeLog.find(c=>c.type==="approved")?.reason && <div style={{background:card,border:`1px solid ${bd}`,borderRadius:16,padding:"14px 20px",marginBottom:16,borderLeft:`3px solid ${green}`}}>
          <div style={{fontSize:11,fontWeight:700,color:green,fontFamily:f,marginBottom:4}}>MANAGER FEEDBACK</div>
          <p style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.6,margin:0}}>{idpChangeLog.find(c=>c.type==="approved").reason}</p>
        </div>}

        {/* HEADER */}
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:6,flexWrap:"wrap",paddingTop:idpStatus==="draft"?10:0}}>
          <h1 style={{fontSize:26,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-.3,flex:1}}>Kshitij Lau’s Development Plan</h1>
          <Btn small secondary><I.Dl/> Download PDF</Btn>
          {idpStatus==="draft"&&<Btn small primary onClick={()=>setIdpStatus("pending")}><I.Mail/> Submit to Manager</Btn>}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:8}}>
          <p style={{fontSize:12,color:tm,fontFamily:f,margin:0,display:"flex",alignItems:"center",gap:4}}><I.Lock/> Private skills are hidden from your manager when submitted.</p>
          <button onClick={()=>setShowIdpComments(p=>!p)} style={{fontSize:12,fontWeight:600,color:showIdpComments?teal:tm,background:showIdpComments?tealBg:(dk?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)"),border:`1px solid ${showIdpComments?teal+"30":(dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)")}`,borderRadius:10,padding:"5px 14px",cursor:"pointer",fontFamily:f,display:"flex",alignItems:"center",gap:5,transition:"all .2s"}}>
            <I.Users/> Comments {showIdpComments?"ON":"OFF"}
          </button>
        </div>

        {/* IDP DASHBOARD */}
        <div style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"22px 26px",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
            <div style={{position:"relative",width:70,height:70,flexShrink:0}}>
              <svg width="70" height="70" viewBox="0 0 70 70"><circle cx="35" cy="35" r="30" fill="none" stroke={dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.05)"} strokeWidth="5"/><circle cx="35" cy="35" r="30" fill="none" stroke={teal} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${totalProgress*1.885} 188.5`} transform="rotate(-90 35 35)" style={{transition:"stroke-dasharray .6s"}}/></svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:teal,fontFamily:f}}>{totalProgress}%</div>
            </div>
            <div style={{flex:1,minWidth:200}}>
              <div style={{fontSize:15,fontWeight:700,color:tx,fontFamily:f,marginBottom:4}}>Overall Progress</div>
              <div style={{fontSize:13,color:ts,fontFamily:f}}>{completedTips} of {totalTips} actions completed</div>
            </div>
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              {[{l:"Skills",v:idpSkills.length,c:navy},{l:"Actions",v:totalTips,c:teal},{l:"Duration",v:"6 mo",c:purple}].map(s=>(
                <div key={s.l} style={{background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`,borderRadius:14,padding:"10px 16px",textAlign:"center",minWidth:70}}>
                  <div style={{fontSize:18,fontWeight:800,color:s.c,fontFamily:f}}>{s.v}</div>
                  <div style={{fontSize:11,color:ts,fontFamily:f}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 70-20-10 SUMMARY */}
        <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
          {[{t:70,l:"Experience",c:navy,bg:navyBg},{t:20,l:"Social",c:teal,bg:tealBg},{t:10,l:"Formal",c:purple,bg:purpleBg}].map(b=>{
            const cnt = idpSkills.reduce((a,s)=>a+s.tips.filter(t=>t.type===b.t).length,0);
            return <div key={b.t} style={{flex:1,minWidth:130,background:card,border:`1px solid ${bd}`,borderRadius:16,padding:"14px 20px"}}>
              <div style={{fontSize:22,fontWeight:800,color:b.c,fontFamily:f}}>{b.t}%</div>
              <div style={{fontSize:12,fontWeight:700,color:tx,fontFamily:f}}>{b.l}</div>
              <div style={{fontSize:12,color:ts,fontFamily:f,marginTop:2}}>{cnt} action{cnt!==1?"s":""}</div>
            </div>;
          })}
        </div>

        {/* SKILLS */}
        <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:20}}>
          {idpSkills.map(sk => {
            const exp = idpExpanded === sk.id;
            const skPct = sk.tips.length?Math.round(sk.tips.reduce((a,t)=>a+(t.progress||0),0)/sk.tips.length):0;
            return <div key={sk.id} style={{background:card,border:`1px solid ${bd}`,borderRadius:18,overflow:"hidden"}}>
              <div onClick={()=>setIdpExpanded(exp?null:sk.id)} style={{padding:"20px 24px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}
                onMouseEnter={e=>e.currentTarget.style.background=dk?"rgba(255,255,255,.02)":"rgba(0,44,119,.01)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:42,height:42,borderRadius:14,background:sk.private?`${red}08`:`${navy}08`,display:"flex",alignItems:"center",justifyContent:"center",color:sk.private?red:navy,flexShrink:0}}>
                  {sk.private?<I.Lock/>:<I.Star/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <h3 style={{fontSize:16,fontWeight:700,color:tx,fontFamily:f,margin:0}}>{sk.name}</h3>
                    {sk.private&&<span style={{fontSize:10,fontWeight:700,color:red,background:`${red}10`,padding:"2px 8px",borderRadius:6,fontFamily:f}}>PRIVATE</span>}
                    <span style={{fontSize:11,color:tm,fontFamily:f,textTransform:"capitalize"}}>{sk.cat}</span>
                  </div>
                  <p style={{fontSize:13,color:ts,fontFamily:f,margin:0,lineHeight:1.5}}>{sk.desc}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                  {sk.tips.length>0&&<div style={{width:36,height:36,position:"relative"}}>
                    <svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke={dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.05)"} strokeWidth="3"/><circle cx="18" cy="18" r="15" fill="none" stroke={teal} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${skPct*0.942} 94.2`} transform="rotate(-90 18 18)"/></svg>
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:teal,fontFamily:f}}>{skPct}%</div>
                  </div>}
                  <span style={{fontSize:12,fontWeight:600,color:ts,fontFamily:f}}>{sk.tips.length} tip{sk.tips.length!==1?"s":""}</span>
                  {showIdpComments&&(()=>{const cc=idpComments.filter(c=>c.targetId===sk.id||sk.tips.some(t=>t.id===c.targetId)).length;return cc>0?<span style={{fontSize:10,fontWeight:700,color:navy,background:navyBg,padding:"2px 7px",borderRadius:6,fontFamily:f}}>{cc} comments</span>:null})()}
                </div>
                <div style={{transform:exp?"rotate(180deg)":"rotate(0)",transition:"transform .2s",color:tm}}><I.Down/></div>
              </div>

              {exp && <div style={{padding:"0 24px 24px",borderTop:`1px solid ${bd}`}}>
                <div style={{display:"flex",gap:8,paddingTop:16,paddingBottom:14,flexWrap:"wrap"}}>
                  {!isFrozen&&<><button onClick={()=>togglePrivate(sk.id)} style={{fontSize:12,fontWeight:600,color:sk.private?green:red,background:sk.private?`${green}10`:`${red}08`,border:"none",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontFamily:f,display:"flex",alignItems:"center",gap:4}}>
                    {sk.private?<><I.Check/> Make Visible</>:<><I.Lock/> Make Private</>}
                  </button>
                  <button onClick={()=>deleteSkill(sk.id)} style={{fontSize:12,fontWeight:600,color:red,background:`${red}08`,border:"none",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontFamily:f}}>Delete Skill</button></>}
                  <div style={{flex:1}}/>
                  {!isFrozen&&<><button onClick={()=>{setIdpAddTo(sk.id);setIdpModal("library")}} style={{fontSize:12,fontWeight:600,color:dk?"#fff":navy,background:navyBg,border:"none",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontFamily:f,display:"flex",alignItems:"center",gap:4}}><I.Book/> From Library</button>
                  <button onClick={()=>generateAiTips(sk.id)} style={{fontSize:12,fontWeight:600,color:teal,background:tealBg,border:"none",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontFamily:f,display:"flex",alignItems:"center",gap:4}}><I.Brain/> AI Generate</button>
                  <button onClick={()=>{setIdpAddTo(sk.id);setManualTip({type:70,title:"",desc:""});setIdpModal("manual")}} style={{fontSize:12,fontWeight:600,color:orange,background:`${orange}10`,border:"none",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontFamily:f,display:"flex",alignItems:"center",gap:4}}><I.Plus/> Manual</button></>}
                </div>

                {/* Skill-level comments */}
                {showIdpComments && <CommentThread targetId={sk.id}/>}

                {sk.tips.length===0 && <div style={{padding:"24px",textAlign:"center",background:dk?"rgba(255,255,255,.02)":bg,borderRadius:14,border:`1px solid ${bd}`}}><p style={{fontSize:14,color:tm,fontFamily:f}}>No development actions yet.</p></div>}
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {sk.tips.map(tip => (
                    <div key={tip.id} style={{background:dk?"rgba(255,255,255,.02)":bg,border:`1px solid ${bd}`,borderRadius:14,padding:"20px 22px",position:"relative"}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                        <div style={{width:4,borderRadius:2,alignSelf:"stretch",background:tip.type===70?navy:tip.type===20?teal:purple,flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                            <TypeBadge type={tip.type}/><SourceBadge source={tip.source}/>
                            <span style={{fontSize:11,color:tm,fontFamily:f}}>{tip.start} → {tip.end}</span>
                          </div>
                          <h4 style={{fontSize:15,fontWeight:700,color:tx,fontFamily:f,margin:"0 0 4px"}}>{tip.title}</h4>
                          <p style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.6,marginBottom:8}}>{tip.desc}</p>

                          {/* Progress bar */}
                          {tip.progress!=null && <div style={{marginBottom:10}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                              <span style={{fontSize:11,fontWeight:600,color:tm,fontFamily:f}}>Progress</span>
                              <span style={{fontSize:12,fontWeight:800,color:(tip.progress||0)>=100?green:(tip.progress||0)>0?teal:tm,fontFamily:f}}>{tip.progress||0}%</span>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{flex:1,height:6,borderRadius:3,background:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)",overflow:"hidden",cursor:"pointer"}}
                                onClick={e=>{const r=e.currentTarget.getBoundingClientRect();const pct=Math.round(((e.clientX-r.left)/r.width)*100);updateProgress(sk.id,tip.id,pct)}}>
                                <div style={{height:"100%",borderRadius:3,width:`${tip.progress||0}%`,background:(tip.progress||0)>=100?green:`linear-gradient(90deg,${navy},${teal})`,transition:"width .3s"}}/>
                              </div>
                              <button onClick={()=>updateProgress(sk.id,tip.id,Math.min(100,(tip.progress||0)+10))} style={{fontSize:10,fontWeight:700,color:teal,background:tealBg,border:"none",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontFamily:f}}>+10%</button>
                            </div>
                          </div>}

                          {tip.course && (
                            <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:12,background:dk?"rgba(255,255,255,.03)":card,border:`1px solid ${bd}`,marginBottom:10}}>
                              <div style={{fontSize:32,flexShrink:0}}>{tip.course.img}</div>
                              <div style={{flex:1}}>
                                <div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{tip.course.name}</div>
                                <div style={{fontSize:12,color:ts,fontFamily:f}}>{tip.course.platform} · {tip.course.duration}{tip.course.seats?` · ${tip.course.seats} seats`:""}</div>
                              </div>
                              <a href={tip.course.link} target="_blank" rel="noopener noreferrer"
                                style={{fontSize:12,fontWeight:700,color:teal,background:tealBg,padding:"6px 14px",borderRadius:10,textDecoration:"none",fontFamily:f,display:"flex",alignItems:"center",gap:4}}>
                                <I.Link2/> Go to Course
                              </a>
                            </div>
                          )}

                          <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 14px",borderRadius:10,background:`${green}06`,marginBottom:8}}>
                            <div style={{color:green,flexShrink:0,marginTop:1}}><I.Check/></div>
                            <div><span style={{fontSize:11,fontWeight:700,color:green,fontFamily:f,textTransform:"uppercase",letterSpacing:.4}}>Success Criteria</span>
                            <p style={{fontSize:13,color:ts,fontFamily:f,lineHeight:1.5,margin:0}}>{tip.success}</p></div>
                          </div>

                          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                            <button onClick={()=>{setIdpInsight(tip);setIdpModal("insight")}} style={{fontSize:12,fontWeight:600,color:purple,background:purpleBg,border:"none",borderRadius:8,padding:"4px 12px",cursor:"pointer",fontFamily:f,display:"flex",alignItems:"center",gap:4}}><I.Brain/> AI Insights</button>
                            {!isFrozen&&<button onClick={()=>deleteTip(sk.id,tip.id)} style={{fontSize:12,fontWeight:600,color:red,background:`${red}08`,border:"none",borderRadius:8,padding:"4px 12px",cursor:"pointer",fontFamily:f}}>Remove</button>}
                          </div>
                          {/* Tip-level comments */}
                          {showIdpComments && <CommentThread targetId={tip.id}/>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>}
            </div>;
          })}
        </div>

        {/* Add Skill */}
        {!isFrozen&&<div style={{background:card,border:`1px dashed ${teal}40`,borderRadius:18,padding:"18px 24px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:20}}
          onClick={()=>setIdpModal("addSkill")}>
          <span style={{fontSize:20,color:teal,fontWeight:300}}>+</span>
          <span style={{fontSize:14,fontWeight:700,color:teal,fontFamily:f}}>Add More Skills</span>
        </div>}

        {/* CHANGE LOG MODAL */}
        {showChangeLog && <div onClick={()=>setShowChangeLog(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} className="sf" style={{background:card,borderRadius:20,width:"100%",maxWidth:560,maxHeight:"80vh",overflow:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.2)",border:`1px solid ${bd}`,position:"relative"}}>
            <div style={{padding:"22px 26px",borderBottom:`1px solid ${bd}`,position:"sticky",top:0,background:card,zIndex:1,borderRadius:"20px 20px 0 0"}}>
              <h3 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,margin:0,display:"flex",alignItems:"center",gap:8}}><I.Clock/> Change Log</h3>
              <p style={{fontSize:13,color:ts,fontFamily:f,marginTop:4}}>Full timeline of plan activity</p>
            </div>
            <div style={{padding:"20px 26px"}}>
              {[...idpChangeLog].reverse().map((cl,i) => {
                const tc = {created:teal,edit:purple,submitted:orange,comment:navy,approved:green,rejected:red}[cl.type]||tm;
                return <div key={cl.id} style={{display:"flex",gap:14,paddingBottom:16,position:"relative"}}>
                  {i<idpChangeLog.length-1&&<div style={{position:"absolute",left:15,top:32,bottom:0,width:1,background:bd}}/>}
                  <div style={{width:30,height:30,borderRadius:10,background:`${tc}12`,display:"flex",alignItems:"center",justifyContent:"center",color:tc,flexShrink:0}}>
                    {cl.type==="created"&&<I.Star/>}{cl.type==="edit"&&<I.Clip/>}{cl.type==="submitted"&&<I.Mail/>}{cl.type==="comment"&&<I.Users/>}{cl.type==="approved"&&<I.Check/>}{cl.type==="rejected"&&<I.Warn/>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:tx,fontFamily:f}}>{cl.text}</div>
                    <div style={{fontSize:11,color:tm,fontFamily:f,marginTop:2}}>{cl.by} &middot; {cl.ts}</div>
                    {cl.reason&&<div style={{marginTop:6,padding:"8px 12px",borderRadius:10,background:`${tc}06`,border:`1px solid ${tc}15`,fontSize:12,color:ts,fontFamily:f,lineHeight:1.5}}>&ldquo;{cl.reason}&rdquo;</div>}
                    {cl.type==="comment"&&<button onClick={()=>{setShowChangeLog(false);navigateToComment("sk1")}} style={{fontSize:11,fontWeight:600,color:teal,background:tealBg,border:"none",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontFamily:f,marginTop:4}}>Navigate to comment &rarr;</button>}
                  </div>
                </div>;
              })}
            </div>
            <button onClick={()=>setShowChangeLog(false)} style={{position:"absolute",top:16,right:16,background:"none",border:"none",color:tm,cursor:"pointer",padding:4}}><I.X/></button>
          </div>
        </div>}

        {/* MODALS */}
        {idpModal && <div onClick={()=>setIdpModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} className="sf" style={{background:card,borderRadius:20,width:"100%",maxWidth:idpModal==="addSkill"?600:520,maxHeight:"80vh",overflow:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.2)",border:`1px solid ${bd}`,position:"relative"}}>

            {idpModal==="addSkill" && <>
              <div style={{padding:"22px 26px",borderBottom:`1px solid ${bd}`}}>
                <h3 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,margin:0}}>Add a Skill</h3>
                <p style={{fontSize:13,color:ts,fontFamily:f,marginTop:4}}>Choose from our skill library by category.</p>
              </div>
              <div style={{padding:"20px 26px"}}>
                {Object.entries(skillLibrary).map(([cat,skills])=>(
                  <div key={cat} style={{marginBottom:20}}>
                    <div style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.6,textTransform:"uppercase",marginBottom:10}}>{cat}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                      {skills.filter(s=>!idpSkills.some(x=>x.name===s)).map(s=>(
                        <button key={s} onClick={()=>addSkillFromLib(s,cat)}
                          style={{padding:"8px 16px",borderRadius:12,border:`1px solid ${bd}`,background:dk?"rgba(255,255,255,.04)":bg,color:tx,fontSize:13,fontFamily:f,cursor:"pointer",transition:"all .15s"}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=teal;e.currentTarget.style.background=tealBg}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=dk?"rgba(255,255,255,.07)":"rgba(0,44,119,.07)";e.currentTarget.style.background=dk?"rgba(255,255,255,.04)":bg}}>
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>}

            {idpModal==="library" && <>
              <div style={{padding:"22px 26px",borderBottom:`1px solid ${bd}`}}>
                <h3 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,margin:0}}>Development Action Library</h3>
              </div>
              <div style={{padding:"20px 26px"}}>
                {[70,20,10].map(type=>(
                  <div key={type} style={{marginBottom:18}}>
                    <TypeBadge type={type}/>
                    <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:10}}>
                      {tipLibrary.filter(t=>t.type===type).map((tip,i)=>(
                        <div key={i} onClick={()=>addTipFromLib(tip)}
                          style={{padding:"12px 16px",borderRadius:12,border:`1px solid ${bd}`,cursor:"pointer",transition:"all .15s"}}
                          onMouseEnter={e=>e.currentTarget.style.background=dk?"rgba(255,255,255,.03)":"rgba(0,44,119,.02)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{tip.title}</div>
                          <div style={{fontSize:12,color:ts,fontFamily:f,marginTop:2}}>{tip.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>}

            {idpModal==="aiGen" && <>
              <div style={{padding:"22px 26px",borderBottom:`1px solid ${bd}`}}>
                <h3 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,margin:0}}>AI-Generated Suggestions</h3>
              </div>
              <div style={{padding:"20px 26px"}}>
                {aiGenLoading ? <div style={{textAlign:"center",padding:"32px 0"}}>
                  <div style={{display:"inline-flex",gap:4,marginBottom:10}}>{[0,1,2].map(i=>(<div key={i} style={{width:8,height:8,borderRadius:4,background:teal,opacity:.5,animation:`tpulse 1.2s ${i*.2}s infinite`}}/>))}</div>
                  <p style={{fontSize:14,color:ts,fontFamily:f}}>Generating tailored suggestions…</p>
                </div> :
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {aiSuggestions.length===0 && <p style={{fontSize:14,color:tm,fontFamily:f,textAlign:"center",padding:16}}>All suggestions added!</p>}
                  {aiSuggestions.map((tip,i)=>(
                    <div key={i} style={{padding:"14px 18px",borderRadius:14,border:`1px solid ${bd}`,display:"flex",alignItems:"flex-start",gap:12}}>
                      <div style={{width:4,borderRadius:2,alignSelf:"stretch",background:tip.type===70?navy:tip.type===20?teal:purple,flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><TypeBadge type={tip.type}/></div>
                        <div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f,marginBottom:2}}>{tip.title}</div>
                        <div style={{fontSize:12,color:ts,fontFamily:f}}>{tip.desc}</div>
                      </div>
                      <Btn small secondary onClick={()=>selectAiTip(tip)}>+ Add</Btn>
                    </div>
                  ))}
                </div>}
              </div>
            </>}

            {/* Manual Tip Creation Modal */}
            {idpModal==="manual" && <>
              <div style={{padding:"22px 26px",borderBottom:`1px solid ${bd}`}}>
                <h3 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,margin:0}}>Create Development Action</h3>
                <p style={{fontSize:13,color:ts,fontFamily:f,marginTop:4}}>Add a custom action to your plan.</p>
              </div>
              <div style={{padding:"20px 26px"}}>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,display:"block",marginBottom:6}}>CATEGORY</label>
                  <div style={{display:"flex",gap:8}}>
                    {[{t:70,l:"70% Experience"},{t:20,l:"20% Social"},{t:10,l:"10% Formal"}].map(c=>(
                      <button key={c.t} onClick={()=>setManualTip(p=>({...p,type:c.t}))}
                        style={{flex:1,padding:"10px 8px",borderRadius:12,border:`2px solid ${manualTip.type===c.t?teal:bd}`,background:manualTip.type===c.t?tealBg:"transparent",cursor:"pointer",fontSize:13,fontWeight:manualTip.type===c.t?700:500,color:manualTip.type===c.t?teal:ts,fontFamily:f,transition:"all .15s"}}>
                        {c.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,display:"block",marginBottom:6}}>TITLE</label>
                  <input value={manualTip.title} onChange={e=>setManualTip(p=>({...p,title:e.target.value}))}
                    placeholder="e.g., Lead a cross-functional workshop"
                    style={{width:"100%",padding:"11px 16px",borderRadius:12,border:`1px solid ${bd}`,background:dk?"rgba(255,255,255,.04)":"rgba(0,44,119,.02)",color:tx,fontSize:14,fontFamily:f,outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:20}}>
                  <label style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,display:"block",marginBottom:6}}>DESCRIPTION</label>
                  <textarea value={manualTip.desc} onChange={e=>setManualTip(p=>({...p,desc:e.target.value}))}
                    placeholder="Describe what you'll do and how it develops this skill…" rows={3}
                    style={{width:"100%",padding:"11px 16px",borderRadius:12,border:`1px solid ${bd}`,background:dk?"rgba(255,255,255,.04)":"rgba(0,44,119,.02)",color:tx,fontSize:14,fontFamily:f,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
                  <Btn small onClick={()=>setIdpModal(null)}>Cancel</Btn>
                  <Btn small primary onClick={addManualTipFn} disabled={!manualTip.title.trim()}>Add Action <I.Arrow/></Btn>
                </div>
              </div>
            </>}

            {idpModal==="insight" && idpInsight && <>
              <div style={{padding:"22px 26px",borderBottom:`1px solid ${bd}`}}>
                <h3 style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,margin:0,display:"flex",alignItems:"center",gap:8}}><I.Brain/> AI Insights</h3>
              </div>
              <div style={{padding:"20px 26px"}}>
                <h4 style={{fontSize:15,fontWeight:700,color:tx,fontFamily:f,marginBottom:6}}>{idpInsight.title}</h4>
                <TypeBadge type={idpInsight.type}/>
                <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.8,marginTop:12,padding:"16px",background:purpleBg,borderRadius:12,border:`1px solid ${purple}15`}}>{idpInsight.insight}</p>
                <div style={{marginTop:16,textAlign:"right"}}><Btn small secondary onClick={()=>setIdpModal(null)}>Close</Btn></div>
              </div>
            </>}

            <button onClick={()=>setIdpModal(null)} style={{position:"absolute",top:16,right:16,background:"none",border:"none",color:tm,cursor:"pointer",padding:4}}><I.X/></button>
          </div>
        </div>}
      </main>
    );
  };

  //  Scheduling (Scrollytelling) 
  const ScheduleView = () => (
    <main id="main" className="sf" style={{maxWidth:700,margin:"0 auto",padding:"0 0 60px"}}>
      {schedView ? (() => { const sl = slots.find(s=>s.id===schedView);
        if (!sl) return null;
        const isBooked = id => bookedSlots.some(b=>b.slotId===id);
        return <>
          <button onClick={()=>{setSchedView(null);setBookConf(null)}} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",color:ts,fontSize:14,fontFamily:f,fontWeight:500,marginBottom:18,paddingTop:6,background:"none",border:"none"}}><I.Back/> Back to Calendar</button>
          {bookConf ? <div className="sf" style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"36px 32px",textAlign:"center"}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:`${green}14`,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",color:green}}><I.Check/></div>
            <h2 style={{fontSize:22,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:8}}>Slot Booked!</h2>
            <p style={{fontSize:15,color:ts,fontFamily:f,lineHeight:1.7,maxWidth:400,margin:"0 auto 8px"}}><b>{bookConf.slot.title}</b></p>
            <p style={{fontSize:14,color:ts,fontFamily:f,marginBottom:6}}>{bookConf.slot.start} at {fmtTz(bookConf.time)} ({userTz})</p>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:13,color:teal,fontWeight:600,fontFamily:f,background:tealBg,padding:"8px 16px",borderRadius:10,marginBottom:20}}><I.Mail/> A calendar invite has been sent to your email</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn onClick={()=>{setSchedView(null);setBookConf(null)}}>Back to Calendar</Btn><Btn primary onClick={()=>{setPg("dash");setSchedView(null);setBookConf(null)}}>Go to Dashboard <I.Arrow/></Btn></div>
          </div> : <div style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"28px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:`linear-gradient(${navy},${teal})`}}/>
            <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:700,color:dk?"#ccc":navy,background:navyBg,padding:"4px 12px",borderRadius:8,fontFamily:f}}>Assessment Center Slot</span>
              <span style={{fontSize:12,fontWeight:600,color:ts,fontFamily:f}}>{sl.days} day{sl.days>1?"s":""}</span>
            </div>
            <h1 style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:6}}>{sl.title}</h1>
            <p style={{fontSize:14,color:ts,fontFamily:f,lineHeight:1.7,marginBottom:14}}>{sl.desc}</p>
            <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{display:"flex",alignItems:"center",gap:4,fontSize:13,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,background:navyBg,padding:"4px 12px",borderRadius:8}}><I.Cal/> {sl.start}{sl.start!==sl.end?` → ${sl.end}`:""}</span>
              <span style={{fontSize:12,color:ts,fontFamily:f,display:"flex",alignItems:"center",gap:4}}><I.Globe/> Times in {userTz}</span>
            </div>
            <div style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:12}}>Available Time Slots</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sl.times.map((t,i) => { const avail = t.seats - t.booked; const full = avail <= 0; const alreadyBooked = isBooked(sl.id);
                return <div key={i} style={{background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`,borderRadius:14,padding:"16px 20px",opacity:full?.5:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                    <div style={{minWidth:80}}><div style={{fontSize:18,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>{fmtTz(t.t)}</div><div style={{fontSize:11,color:tm,fontFamily:f}}>{t.t} UTC</div></div>
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>
                      <div style={{display:"flex",gap:3}}>{Array.from({length:t.seats}).map((_,j)=>(<div key={j} style={{width:10,height:10,borderRadius:5,background:j<t.booked?`${navy}30`:teal}}/>))}</div>
                      <span style={{fontSize:12,fontWeight:600,color:full?red:ts,fontFamily:f}}>{full?"Full":`${avail} seat${avail>1?"s":""} left`}</span>
                    </div>
                    {alreadyBooked?<span style={{fontSize:13,fontWeight:700,color:green,fontFamily:f,display:"flex",alignItems:"center",gap:4}}><I.Check/> Booked</span>:
                    full?<Btn disabled small>Full</Btn>:
                    <Btn primary small onClick={()=>bookSlot(sl,t)}>Book Slot <I.Arrow/></Btn>}
                  </div>
                </div>;
              })}
            </div>
          </div>}
        </>;
      })() : <>
        <div style={{padding:"20px 0 0",marginBottom:24}}>
          <h1 style={{fontSize:28,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-.3,marginBottom:6}}>Scheduling</h1>
          <p style={{fontSize:15,color:ts,fontFamily:f,marginBottom:6,lineHeight:1.6}}>Book your assessment center slots. Times shown in your local timezone.</p>
          <div style={{display:"flex",alignItems:"center",gap:6}}><I.Globe/><span style={{fontSize:13,color:ts,fontFamily:f}}>{userTz}</span></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {slots.map(sl => { const totalSeats = sl.times.reduce((a,t)=>a+t.seats,0); const totalBooked = sl.times.reduce((a,t)=>a+t.booked,0); const isBooked2 = bookedSlots.some(b=>b.slotId===sl.id);
            return <article key={sl.id} className="sf" style={{background:card,border:`1px solid ${bd}`,borderRadius:18,overflow:"hidden",display:"flex",alignItems:"stretch"}}>
              <div style={{width:85,background:`linear-gradient(135deg,${navy},${teal})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px 0",flexShrink:0}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.7)",fontFamily:f,textTransform:"uppercase"}}>{new Date(sl.start+"T00:00").toLocaleDateString("en",{month:"short"})}</div>
                <div style={{fontSize:28,fontWeight:800,color:"#fff",fontFamily:f,lineHeight:1}}>{new Date(sl.start+"T00:00").getDate()}</div>
                {sl.days>1&&<div style={{fontSize:10,color:"rgba(255,255,255,.6)",fontFamily:f,marginTop:2}}>{sl.days} days</div>}
              </div>
              <div style={{flex:1,padding:"18px 22px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                  <h3 style={{fontSize:16,fontWeight:700,color:tx,fontFamily:f,margin:0}}>{sl.title}</h3>
                  {isBooked2&&<span style={{fontSize:11,fontWeight:700,color:green,background:`${green}14`,padding:"2px 8px",borderRadius:6,fontFamily:f}}>✓ Booked</span>}
                </div>
                <p style={{fontSize:13,color:ts,fontFamily:f,marginBottom:10}}>{sl.desc}</p>
                <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <span style={{display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600,color:dk?"#fff":navy,fontFamily:f,background:navyBg,padding:"3px 10px",borderRadius:8}}><I.Clock/> {sl.times.length} time{sl.times.length>1?"s":""}</span>
                  <span style={{display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600,color:ts,fontFamily:f}}><I.Seat/> {totalSeats-totalBooked}/{totalSeats} seats</span>
                  <div style={{flex:1}}/>
                  <Btn primary small onClick={()=>setSchedView(sl.id)}>View Slots <I.Arrow/></Btn>
                </div>
              </div>
            </article>;
          })}
        </div>
      </>}
    </main>
  );

  //  Dashboard (scrollytelling) 
  //  Design Mode Picker (shown on dashboard) 
  const DesignPicker = () => (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
      <span style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1,textTransform:"uppercase"}}>Design Mode</span>
      <div style={{position:"relative"}}>
        <select value={designMode} onChange={e=>setDesignMode(e.target.value)}
          style={{appearance:"none",padding:"7px 32px 7px 14px",borderRadius:10,border:`1px solid ${bd}`,
            background:isGlass?(dk?"rgba(255,255,255,.06)":"rgba(255,255,255,.6)"):isNeu?card:card,
            ...glassBlur2,color:tx,fontWeight:700,fontSize:13,fontFamily:f,cursor:"pointer",outline:"none"}}>
          <option value="scrolly">Scrollytelling</option>
          <option value="bento">Bento Grid</option>
          <option value="glass">Glassmorphism</option>
          <option value="neu">Neumorphism</option>
          <option value="editorial">Editorial</option>
          <option value="clay">Claymorphism</option>
          <option value="aurora">Aurora / Gradient Mesh</option>
          <option value="darkprem">Dark Premium</option>
          <option value="brutal">Brutalist</option>
          <option value="notion">Notion / Block</option>
          <option value="material">Material 3</option>
          <option value="organic">Organic</option>
        </select>
        <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:tm}}><I.Down/></div>
      </div>
    </div>
  );

  //  Bento/Glass Dashboard (grid layout) 
  const GridDashboard = () => (
    <main id="main" style={{maxWidth:900,margin:"0 auto",padding:"0 0 60px"}}>
      <DesignPicker/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        {/* Hero (3) + Countdown (1) */}
        <div style={{gridColumn:"span 3",background:card,...glassBlur,border:`1px solid ${bd}`,borderRadius:isGlass?20:16,padding:"36px 34px",boxShadow:isGlass&&dk?`0 0 30px ${navy}20`:"none"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:16,background:dk?"rgba(0,180,160,.12)":"rgba(0,180,160,.08)",marginBottom:16}}>
            <div style={{width:6,height:6,borderRadius:3,background:teal,boxShadow:isGlass&&dk?`0 0 8px ${teal}`:"none"}}/>
            <span style={{fontSize:11,fontWeight:700,color:teal,fontFamily:f}}>Welcome back</span>
          </div>
          <h1 style={{fontSize:42,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-1.2,lineHeight:1.08,marginBottom:10}}>Good afternoon, Kshitij.</h1>
          <p style={{fontSize:16,color:ts,fontFamily:f,lineHeight:1.6}}>You have <span style={{color:teal,fontWeight:700}}>2 active programs</span> and <span style={{color:green,fontWeight:700}}>2 reports ready</span> for review.</p>
          {showTour&&!tour&&<div style={{display:"flex",alignItems:"center",gap:12,marginTop:20,padding:"14px 18px",borderRadius:12,...(isGlass?{...glassBlur2,border:`1px solid ${bd}`}:{background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`})}}>
            <div style={{width:36,height:36,borderRadius:10,background:tealBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal,flexShrink:0}}><I.Help/></div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:tx,fontFamily:f}}>New here? Take a quick tour</div><div style={{fontSize:12,color:ts,fontFamily:f}}>Learn Lighthouse in 30 seconds.</div></div>
            <Btn secondary small onClick={()=>setTour(1)}>Start Tour</Btn>
            <button onClick={()=>setShowTour(false)} aria-label="Dismiss" style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button>
          </div>}
        </div>
        <div style={{gridColumn:"span 1",background:card,...glassBlur,border:`1px solid ${bd}`,borderRadius:isGlass?20:16,padding:"24px",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",boxShadow:isGlass&&dk?`0 0 30px ${red}15`:"none"}}>
          <div style={{fontSize:48,fontWeight:800,color:red,fontFamily:f,lineHeight:1,textShadow:isGlass&&dk?`0 0 30px ${red}40`:"none"}}>12</div>
          <div style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,marginTop:6,textTransform:"uppercase",letterSpacing:1}}>Days Left</div>
          <div style={{fontSize:11,color:ts,fontFamily:f,marginTop:4}}>Until Mar 5</div>
        </div>

        {/* Stats (4x1) */}
        {[{l:"Active Programs",v:"2",c:teal,d:"+1 this month"},{l:"Pending",v:"5",c:dk?"#ddd":navy,d:"3 due this week"},{l:"Completed",v:"3",c:green,d:"75% pass rate"},{l:"Reports Ready",v:"2",c:purple,d:"Available for download"}].map((s,i)=>(
          <div key={i} style={{background:card,...(isGlass?glassBlur2:{}),border:`1px solid ${bd}`,borderRadius:isGlass?16:14,padding:isBento?"20px 22px":"20px 16px",textAlign:isBento?"left":"center"}}>
            {isBento?<>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:32,fontWeight:800,color:s.c,fontFamily:f,lineHeight:1}}>{s.v}</div>
                <div style={{width:8,height:8,borderRadius:4,background:s.c,opacity:.25,marginTop:8}}/>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:tx,fontFamily:f,marginBottom:2}}>{s.l}</div>
              <div style={{fontSize:11,color:ts,fontFamily:f}}>{s.d}</div>
            </>:<>
              <div style={{fontSize:34,fontWeight:800,color:s.c,fontFamily:f,lineHeight:1,textShadow:isGlass&&dk?`0 0 20px ${s.c}30`:"none"}}>{s.v}</div>
              <div style={{fontSize:12,fontWeight:600,color:ts,fontFamily:f,marginTop:6}}>{s.l}</div>
            </>}
          </div>
        ))}

        {/* Priority Program (2) + Quick Links (2) */}
        <div style={{gridColumn:"span 2",background:card,...glassBlur,border:`1px solid ${bd}`,borderRadius:isGlass?20:16,overflow:"hidden",boxShadow:isGlass&&dk?`0 0 30px ${navy}20`:"none"}}>
          <div style={{padding:"24px 26px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:10,fontWeight:800,color:"#fff",fontFamily:f,letterSpacing:.5,textTransform:"uppercase",background:navy,padding:"3px 10px",borderRadius:6,boxShadow:isGlass&&dk?`0 0 12px ${navy}60`:"none"}}>Priority</span>
              <span style={{fontSize:11,color:ts,fontFamily:f}}>Assessment &middot; Proctored</span>
            </div>
            <h3 style={{fontSize:20,fontWeight:800,color:tx,fontFamily:f,lineHeight:1.25,marginBottom:10,cursor:"pointer"}} onClick={()=>setPg("program")}>Leadership Potential Assessment 2026</h3>
            <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
              <DueDate date="Mar 5" urgent/>
              <span style={{fontSize:12,fontWeight:700,color:dk?"#ddd":navy,fontFamily:f}}>~4 hours</span>
            </div>
            <div style={{display:"flex",gap:3,marginBottom:14}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{flex:1,height:5,borderRadius:3,background:i<=2?(isBento?navy:`linear-gradient(90deg,${navy},${teal})`):(dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)"),boxShadow:i<=2&&isGlass&&dk?`0 0 8px ${teal}30`:"none"}}/>))}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:ts,fontFamily:f}}>2 of 6 sections</span>
              <Btn primary small onClick={()=>setSysStep(1)}>System Check <I.Arrow/></Btn>
            </div>
          </div>
          <div style={{borderTop:`1px solid ${dk?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)"}`,padding:"14px 26px",background:isGlass?(dk?"rgba(255,255,255,.02)":"rgba(255,255,255,.3)"):(dk?"rgba(255,255,255,.02)":bg)}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:10,fontWeight:800,color:purple,fontFamily:f,background:purpleBg,padding:"3px 10px",borderRadius:6}}>360&deg;</span>
              <span style={{flex:1,fontSize:13,fontWeight:700,color:tx,fontFamily:f}}>360&deg; Perspective Index &mdash; Q1</span>
              <span style={{fontSize:11,color:ts,fontFamily:f}}>1/4 &middot; Mar 15</span>
            </div>
          </div>
        </div>
        <div style={{gridColumn:"span 2",background:card,...glassBlur,border:`1px solid ${bd}`,borderRadius:isGlass?20:16,padding:"24px 26px"}}>
          <h3 style={{fontSize:isGlass?10:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:isGlass?1.5:1.2,textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:6}}><I.Zap/> Quick Links</h3>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {quickLinks.map((q,i)=>(
              <div key={i} onClick={q.action} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:isGlass?14:12,cursor:"pointer",transition:"all .15s",
                ...(isGlass?{...glassBlur2,border:`1px solid ${bd}`}:{background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`})}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                <div style={{width:36,height:36,borderRadius:10,background:isGlass?(dk?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)"):`${q.color}10`,display:"flex",alignItems:"center",justifyContent:"center",color:q.color,flexShrink:0}}><q.icon/></div>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{q.label}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{q.desc}</div></div>
                <span style={{color:tm,fontSize:14}}>&rarr;</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events (2) + Reports (2) */}
        <div style={{gridColumn:"span 2",background:card,...glassBlur,border:`1px solid ${bd}`,borderRadius:isGlass?20:16,padding:"24px 26px"}}>
          <h3 style={{fontSize:isGlass?10:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:isGlass?1.5:1.2,textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:6}}><I.Cal/> Upcoming Events</h3>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {upcomingEvents.map(ev=>(
              <div key={ev.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:`1px solid ${dk?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)"}`}}>
                <div style={{width:48,textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:10,fontWeight:800,color:tm,fontFamily:f,textTransform:"uppercase",letterSpacing:1}}>{ev.date.split(" ")[0]}</div>
                  <div style={{fontSize:24,fontWeight:800,color:tx,fontFamily:f,lineHeight:1.1}}>{ev.date.split(" ")[1]}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{ev.title}</div>
                  <div style={{fontSize:12,color:ts,fontFamily:f}}>{ev.time} &middot; {ev.type}</div>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:ev.daysAway<=7?red:ts,fontFamily:f,
                  ...(isGlass?{...glassBlur2,border:`1px solid ${bd}`}:{background:ev.daysAway<=7?`${red}10`:navyBg}),
                  padding:"3px 9px",borderRadius:isGlass?8:6}}>{ev.daysAway}d</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{gridColumn:"span 2",background:card,...glassBlur,border:`1px solid ${bd}`,borderRadius:isGlass?20:16,padding:"24px 26px"}}>
          <h3 style={{fontSize:isGlass?10:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:isGlass?1.5:1.2,textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:6}}><I.FileText/> Reports Ready</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {reports.map(r=>(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:isGlass?14:12,
                ...(isGlass?{...glassBlur2,border:`1px solid ${bd}`}:{background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`})}}>
                <div style={{width:40,height:40,borderRadius:12,background:`${r.color}10`,display:"flex",alignItems:"center",justifyContent:"center",color:r.color,flexShrink:0}}><r.icon/></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:tx,fontFamily:f}}>{r.assessment}</div>
                  <div style={{fontSize:12,color:ts,fontFamily:f}}>{r.type} &middot; {r.date}</div>
                </div>
                <Btn small style={{padding:"5px 10px"}}><I.Dl/> PDF</Btn>
              </div>
            ))}
          </div>
        </div>

        {/* IDP Progress (full) */}
        <div style={{gridColumn:"span 4",background:card,...glassBlur,border:`1px solid ${bd}`,borderRadius:isGlass?20:16,padding:"22px 26px",boxShadow:isGlass&&dk?`0 0 30px ${purple}15`:"none"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <h3 style={{fontSize:isGlass?10:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:isGlass?1.5:1.2,textTransform:"uppercase",marginBottom:14}}>Development Plan Progress</h3>
              <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
                {[{s:"Executive Presence",p:45,c:navy},{s:"Coaching Others",p:30,c:teal},{s:"Strategic Thinking",p:20,c:purple}].map((sk,i)=>{
                  const r=17,circ=2*Math.PI*r;
                  return <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                    <svg width="44" height="44" style={{transform:"rotate(-90deg)"}}><circle cx="22" cy="22" r={r} fill="none" stroke={dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)"} strokeWidth="3.5"/><circle cx="22" cy="22" r={r} fill="none" stroke={sk.c} strokeWidth="3.5" strokeDasharray={circ} strokeDashoffset={circ*(1-sk.p/100)} strokeLinecap="round" style={{filter:isGlass&&dk?`drop-shadow(0 0 6px ${sk.c}60)`:"none"}}/></svg>
                    <div><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{sk.s}</div><div style={{fontSize:11,color:ts,fontFamily:f}}>3 actions &middot; {sk.p}%</div></div>
                  </div>;
                })}
              </div>
            </div>
            <Btn small onClick={()=>setPg("idp")}>View Full Plan &rarr;</Btn>
          </div>
        </div>
      </div>
    </main>
  );

  //  Scrollytelling Dashboard (vertical flow) 
  const ScrollyDashboard = () => (
    <main id="main" style={{maxWidth:700,margin:"0 auto",padding:"0 0 60px"}}>
      <DesignPicker/>
      <Section id="hero" className="tv">
        <div style={{padding:"36px 0 0",marginBottom:8}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:20,background:tealBg,marginBottom:14}}>
            <div style={{width:6,height:6,borderRadius:3,background:teal}}/>
            <span style={{fontSize:12,fontWeight:700,color:teal,fontFamily:f}}>Welcome back</span>
          </div>
          <h1 style={{fontSize:38,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-.8,lineHeight:1.12,marginBottom:12}}>Good afternoon,<br/>Kshitij.</h1>
          <p style={{fontSize:16,color:ts,fontFamily:f,lineHeight:1.75,maxWidth:460}}>You have <span style={{color:teal,fontWeight:700}}>2 active programs</span> and <span style={{color:green,fontWeight:700}}>2 reports ready</span>.</p>
        </div>
        {showTour&&!tour&&<div className="tv2 show" style={{background:card,border:`1px solid ${bd}`,borderRadius:14,padding:"16px 20px",marginTop:20,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:40,height:40,borderRadius:10,background:tealBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal,flexShrink:0}}><I.Help/></div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f,marginBottom:2}}>New here? Take a quick tour</div><div style={{fontSize:13,color:ts,fontFamily:f}}>Learn how to navigate Lighthouse in 30 seconds.</div></div>
          <Btn secondary small onClick={()=>setTour(1)}>Start Tour</Btn>
          <button onClick={()=>setShowTour(false)} aria-label="Dismiss tour" style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button>
        </div>}
        <div style={{display:"flex",justifyContent:"center",marginTop:24,color:tm}}><I.ChevD/></div>
      </Section>
      <Section id="status" className="tv">
        <div style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:16}}>Your Status</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {[{l:"Active",v:"2",c:teal},{l:"Pending",v:"5",c:dk?"#fff":navy},{l:"Complete",v:"3",c:green},{l:"Days Left",v:"12",c:red}].map((s,i)=>(
            <div key={s.l} className={`tv${i>1?"2":""} ${vis["status"]?"show":""}`}
              style={{background:card,border:`1px solid ${bd}`,borderRadius:14,padding:"18px 14px",textAlign:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:"15%",right:"15%",height:2,background:s.c,borderRadius:"0 0 2px 2px",opacity:.3}} aria-hidden="true"/>
              <div style={{fontSize:30,fontWeight:800,color:s.c,fontFamily:f,lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:12,color:ts,fontFamily:f,fontWeight:600,marginTop:6}}>{s.l}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section id="quicklinks" className="tv">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14}}>
          <div style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"22px 24px"}}>
            <h3 style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:6}}><I.Zap/> Quick Links</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {quickLinks.map((q,i)=>(
                <div key={i} onClick={q.action} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:14,cursor:"pointer",background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`,transition:"all .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                  <div style={{width:36,height:36,borderRadius:10,background:`${q.color}10`,display:"flex",alignItems:"center",justifyContent:"center",color:q.color,flexShrink:0}}><q.icon/></div>
                  <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{q.label}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{q.desc}</div></div>
                  <I.Arrow/>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"22px 24px"}}>
            <h3 style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:6}}><I.Cal/> Upcoming Events</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {upcomingEvents.map(ev=>(
                <div key={ev.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:14,background:dk?"rgba(255,255,255,.03)":bg,border:`1px solid ${bd}`}}>
                  <div style={{width:42,textAlign:"center",flexShrink:0}}>
                    <div style={{fontSize:11,fontWeight:700,color:ev.color,fontFamily:f,textTransform:"uppercase"}}>{ev.date.split(" ")[0]}</div>
                    <div style={{fontSize:20,fontWeight:800,color:dk?"#fff":navy,fontFamily:f}}>{ev.date.split(" ")[1]}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{ev.title}</div>
                    <div style={{fontSize:12,color:ts,fontFamily:f}}>{ev.time} &middot; {ev.type}</div>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:ev.daysAway<=7?red:ts,fontFamily:f,background:ev.daysAway<=7?`${red}10`:navyBg,padding:"3px 8px",borderRadius:6}}>{ev.daysAway}d</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
      <Section id="reports" className="tv">
        <div style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:6}}><I.FileText/> Reports Ready</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {reports.map(r=>(
            <div key={r.id} style={{flex:1,minWidth:240,background:card,border:`1px solid ${bd}`,borderRadius:16,padding:"18px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:12,background:`${r.color}10`,display:"flex",alignItems:"center",justifyContent:"center",color:r.color,flexShrink:0}}><r.icon/></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:tx,fontFamily:f}}>{r.assessment}</div>
                  <div style={{fontSize:12,color:ts,fontFamily:f}}>{r.type} &middot; {r.date}</div>
                </div>
                <Btn small secondary style={{padding:"5px 10px"}}><I.Dl/> PDF</Btn>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section id="next" className="tv">
        <div style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:16}}>What's Next</div>
        <article className={`tv2 ${vis["next"]?"show":""}`}
          style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"26px",marginBottom:14,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:`linear-gradient(${navy},${teal})`}} aria-hidden="true"/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:800,color:dk?"#ccc":navy,fontFamily:f,letterSpacing:.5,textTransform:"uppercase",background:navyBg,padding:"3px 10px",borderRadius:6}}>Priority</span><span style={{fontSize:12,color:ts,fontFamily:f}}>Assessment &middot; Proctored</span></div>
          <h3 style={{fontSize:19,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,marginBottom:12,lineHeight:1.35}}>Leadership Potential Assessment 2026</h3>
          <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
            <DueDate date="Mar 5" urgent/>
            <span style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,display:"flex",alignItems:"center",gap:4,background:navyBg,padding:"4px 12px",borderRadius:8}}><I.Clock/> ~4 hours</span>
            <span style={{display:"flex",alignItems:"center",gap:3,fontSize:14,fontWeight:600,color:ts,fontFamily:f}}><I.Video/> Video</span>
          </div>
          <div style={{display:"flex",gap:4,marginBottom:14}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{flex:1,height:5,borderRadius:3,background:i<=2?`linear-gradient(90deg,${navy},${teal})`:(dk?"rgba(255,255,255,.06)":"rgba(0,44,119,.05)")}}/>))}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
            <span style={{fontSize:14,fontWeight:600,color:ts,fontFamily:f}}>2 of 6 sections complete</span>
            <Btn primary onClick={()=>setSysStep(1)} ariaLabel="Begin system check">System Check <I.Arrow/></Btn>
          </div>
        </article>
        <article className={`tv3 ${vis["next"]?"show":""}`}
          style={{background:card,border:`1px solid ${bd}`,borderRadius:18,padding:"26px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:purple}} aria-hidden="true"/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:11,fontWeight:800,color:purple,fontFamily:f,letterSpacing:.5,textTransform:"uppercase",background:purpleBg,padding:"3px 10px",borderRadius:6}}>360&deg; Survey</span></div>
          <h3 style={{fontSize:19,fontWeight:800,color:tx,fontFamily:f,marginBottom:12}}>360&deg; Perspective Index &mdash; Q1</h3>
          <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}><DueDate date="Mar 15"/><span style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:f,display:"flex",alignItems:"center",gap:4,background:navyBg,padding:"4px 12px",borderRadius:8}}><I.Clock/> 45 min</span></div>
          <div style={{display:"flex",gap:4,marginBottom:14}}>{[1,2,3,4].map(i=>(<div key={i} style={{flex:1,height:5,borderRadius:3,background:i<=1?purple:(dk?"rgba(255,255,255,.06)":"rgba(123,97,255,.05)")}}/>))}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
            <span style={{fontSize:14,fontWeight:600,color:ts,fontFamily:f}}>1 of 4 sections complete</span>
            <Btn style={{borderColor:purple+"30",color:purple}}>Continue <I.Arrow/></Btn>
          </div>
        </article>
      </Section>
    </main>
  );


  //  Neumorphism Dashboard (soft shadows, no borders) 
  const NeuDashboard = () => (
    <main id="main" style={{maxWidth:900,margin:"0 auto",padding:"0 0 60px"}}>
      <DesignPicker/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18}}>
        {/* Hero (3) + Countdown (1) */}
        <div style={{gridColumn:"span 3",background:card,borderRadius:24,padding:"40px 36px",border:"none",...neuSh}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:20,background:tealBg,marginBottom:16}}>
            <div style={{width:6,height:6,borderRadius:3,background:teal}}/>
            <span style={{fontSize:11,fontWeight:700,color:teal,fontFamily:f}}>Welcome back</span>
          </div>
          <h1 style={{fontSize:40,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-1,lineHeight:1.1,marginBottom:10}}>Good afternoon, Kshitij.</h1>
          <p style={{fontSize:16,color:ts,fontFamily:f,lineHeight:1.6}}>You have <span style={{color:teal,fontWeight:700}}>2 active programs</span> and <span style={{color:green,fontWeight:700}}>2 reports ready</span> for review.</p>
          {showTour&&!tour&&<div style={{display:"flex",alignItems:"center",gap:12,marginTop:20,padding:"14px 18px",borderRadius:16,...neuShIn}}>
            <div style={{width:36,height:36,borderRadius:10,background:tealBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal,flexShrink:0}}><I.Help/></div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:tx,fontFamily:f}}>New here? Take a quick tour</div><div style={{fontSize:12,color:ts,fontFamily:f}}>Learn Lighthouse in 30 seconds.</div></div>
            <Btn secondary small onClick={()=>setTour(1)}>Start Tour</Btn>
            <button onClick={()=>setShowTour(false)} aria-label="Dismiss" style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button>
          </div>}
        </div>
        <div style={{gridColumn:"span 1",background:card,borderRadius:24,padding:"24px",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",border:"none",...neuSh}}>
          <div style={{fontSize:48,fontWeight:800,color:red,fontFamily:f,lineHeight:1}}>12</div>
          <div style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,marginTop:6,textTransform:"uppercase",letterSpacing:1}}>Days Left</div>
          <div style={{fontSize:11,color:ts,fontFamily:f,marginTop:4}}>Until Mar 5</div>
        </div>

        {/* Stats (3x + 1 spacer using span) */}
        {[{l:"Active Programs",v:"2",c:teal},{l:"Pending",v:"5",c:dk?"#ddd":navy},{l:"Completed",v:"3",c:green},{l:"Reports Ready",v:"2",c:purple}].map((s,i)=>(
          <div key={i} style={{background:card,borderRadius:20,padding:"22px 18px",textAlign:"center",border:"none",...neuSh}}>
            <div style={{fontSize:32,fontWeight:800,color:s.c,fontFamily:f,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:12,fontWeight:600,color:ts,fontFamily:f,marginTop:8}}>{s.l}</div>
          </div>
        ))}

        {/* Priority Program (2) + Quick Links (2) */}
        <div style={{gridColumn:"span 2",background:card,borderRadius:24,overflow:"hidden",border:"none",...neuSh}}>
          <div style={{padding:"24px 26px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:10,fontWeight:800,color:"#fff",fontFamily:f,letterSpacing:.5,textTransform:"uppercase",background:navy,padding:"4px 12px",borderRadius:10}}>Priority</span>
              <span style={{fontSize:11,color:ts,fontFamily:f}}>Assessment &middot; Proctored</span>
            </div>
            <h3 style={{fontSize:20,fontWeight:800,color:tx,fontFamily:f,lineHeight:1.25,marginBottom:10,cursor:"pointer"}} onClick={()=>setPg("program")}>Leadership Potential Assessment 2026</h3>
            <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
              <DueDate date="Mar 5" urgent/>
              <span style={{fontSize:12,fontWeight:700,color:dk?"#ddd":navy,fontFamily:f}}>~4 hours</span>
            </div>
            <div style={{display:"flex",gap:4,marginBottom:14}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{flex:1,height:6,borderRadius:4,...(i<=2?{background:navy}:neuShIn),background:i<=2?navy:card}}/>))}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:ts,fontFamily:f}}>2 of 6 sections</span>
              <Btn primary small onClick={()=>setSysStep(1)}>System Check <I.Arrow/></Btn>
            </div>
          </div>
          <div style={{padding:"14px 26px",...neuShIn}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:10,fontWeight:800,color:purple,fontFamily:f,background:purpleBg,padding:"3px 10px",borderRadius:8}}>360&deg;</span>
              <span style={{flex:1,fontSize:13,fontWeight:700,color:tx,fontFamily:f}}>360&deg; Perspective Index</span>
              <span style={{fontSize:11,color:ts,fontFamily:f}}>1/4 &middot; Mar 15</span>
            </div>
          </div>
        </div>
        <div style={{gridColumn:"span 2",background:card,borderRadius:24,padding:"24px 26px",border:"none",...neuSh}}>
          <h3 style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:6}}><I.Zap/> Quick Links</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {quickLinks.map((q,i)=>(
              <div key={i} onClick={q.action} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:16,cursor:"pointer",background:card,border:"none",transition:"all .15s",...neuShIn}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                <div style={{width:36,height:36,borderRadius:10,background:`${q.color}10`,display:"flex",alignItems:"center",justifyContent:"center",color:q.color,flexShrink:0}}><q.icon/></div>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{q.label}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{q.desc}</div></div>
                <span style={{color:tm,fontSize:14}}>&rarr;</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events (2) + Reports (2) */}
        <div style={{gridColumn:"span 2",background:card,borderRadius:24,padding:"24px 26px",border:"none",...neuSh}}>
          <h3 style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:6}}><I.Cal/> Upcoming Events</h3>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {upcomingEvents.map(ev=>(
              <div key={ev.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:`1px solid ${dk?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)"}`}}>
                <div style={{width:48,textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:10,fontWeight:800,color:tm,fontFamily:f,textTransform:"uppercase",letterSpacing:1}}>{ev.date.split(" ")[0]}</div>
                  <div style={{fontSize:24,fontWeight:800,color:tx,fontFamily:f,lineHeight:1.1}}>{ev.date.split(" ")[1]}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{ev.title}</div>
                  <div style={{fontSize:12,color:ts,fontFamily:f}}>{ev.time} &middot; {ev.type}</div>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:ev.daysAway<=7?red:ts,fontFamily:f,background:ev.daysAway<=7?`${red}10`:navyBg,padding:"3px 9px",borderRadius:8}}>{ev.daysAway}d</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{gridColumn:"span 2",background:card,borderRadius:24,padding:"24px 26px",border:"none",...neuSh}}>
          <h3 style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:6}}><I.FileText/> Reports Ready</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {reports.map(r=>(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:16,background:card,border:"none",...neuShIn}}>
                <div style={{width:40,height:40,borderRadius:12,background:`${r.color}10`,display:"flex",alignItems:"center",justifyContent:"center",color:r.color,flexShrink:0}}><r.icon/></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:tx,fontFamily:f}}>{r.assessment}</div>
                  <div style={{fontSize:12,color:ts,fontFamily:f}}>{r.type} &middot; {r.date}</div>
                </div>
                <Btn small style={{padding:"5px 10px"}}><I.Dl/> PDF</Btn>
              </div>
            ))}
          </div>
        </div>

        {/* IDP Progress (full) */}
        <div style={{gridColumn:"span 4",background:card,borderRadius:24,padding:"22px 26px",border:"none",...neuSh}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <h3 style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14}}>Development Plan Progress</h3>
              <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
                {[{s:"Executive Presence",p:45,c:navy},{s:"Coaching Others",p:30,c:teal},{s:"Strategic Thinking",p:20,c:purple}].map((sk,i)=>{
                  const r=17,circ=2*Math.PI*r;
                  return <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                    <svg width="44" height="44" style={{transform:"rotate(-90deg)"}}><circle cx="22" cy="22" r={r} fill="none" stroke={dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"} strokeWidth="3.5"/><circle cx="22" cy="22" r={r} fill="none" stroke={sk.c} strokeWidth="3.5" strokeDasharray={circ} strokeDashoffset={circ*(1-sk.p/100)} strokeLinecap="round"/></svg>
                    <div><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{sk.s}</div><div style={{fontSize:11,color:ts,fontFamily:f}}>3 actions &middot; {sk.p}%</div></div>
                  </div>;
                })}
              </div>
            </div>
            <Btn small onClick={()=>setPg("idp")}>View Full Plan &rarr;</Btn>
          </div>
        </div>
      </div>
    </main>
  );

  //  Editorial Dashboard (large type, generous whitespace, content-first) 
  const EditorialDashboard = () => (
    <main id="main" style={{maxWidth:780,margin:"0 auto",padding:"0 0 60px"}}>
      <DesignPicker/>
      {/* Hero */}
      <div style={{paddingTop:40,marginBottom:48}}>
        <p style={{fontSize:13,fontWeight:600,color:teal,fontFamily:f,letterSpacing:.5,marginBottom:12}}>Welcome back</p>
        <h1 style={{fontSize:52,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-1.8,lineHeight:1.05,marginBottom:16}}>Good afternoon,<br/>Kshitij.</h1>
        <p style={{fontSize:18,color:ts,fontFamily:f,lineHeight:1.7,maxWidth:500}}>You have <span style={{color:teal,fontWeight:600}}>2 active programs</span> and <span style={{color:green,fontWeight:600}}>2 reports ready</span> for review.</p>
        {showTour&&!tour&&<div style={{display:"flex",alignItems:"center",gap:12,marginTop:28,padding:"16px 20px",borderRadius:12,border:`1px solid ${bd}`}}>
          <div style={{width:36,height:36,borderRadius:10,background:tealBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal,flexShrink:0}}><I.Help/></div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>New here? Take a quick tour</div><div style={{fontSize:13,color:ts,fontFamily:f}}>Learn Lighthouse in 30 seconds.</div></div>
          <Btn secondary small onClick={()=>setTour(1)}>Start Tour</Btn>
          <button onClick={()=>setShowTour(false)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button>
        </div>}
      </div>

      {/* Status row */}
      <div style={{borderTop:`1px solid ${bd}`,paddingTop:32,marginBottom:40}}>
        <div style={{display:"flex",gap:48,flexWrap:"wrap"}}>
          {[{l:"Active",v:"2",c:teal},{l:"Pending",v:"5",c:dk?"#ccc":navy},{l:"Complete",v:"3",c:green},{l:"Days Left",v:"12",c:red}].map((s,i)=>(
            <div key={i}>
              <div style={{fontSize:36,fontWeight:800,color:s.c,fontFamily:f,lineHeight:1,marginBottom:4}}>{s.v}</div>
              <div style={{fontSize:13,fontWeight:500,color:ts,fontFamily:f}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Assessment */}
      <div style={{borderTop:`1px solid ${bd}`,paddingTop:32,marginBottom:40}}>
        <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:20}}>Priority</p>
        <h2 style={{fontSize:28,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-.6,lineHeight:1.2,marginBottom:12,cursor:"pointer"}} onClick={()=>setPg("program")}>Leadership Potential Assessment 2026</h2>
        <p style={{fontSize:15,color:ts,fontFamily:f,lineHeight:1.7,marginBottom:20}}>Assessment &middot; Proctored &middot; ~4 hours &middot; Due Mar 5</p>
        <div style={{display:"flex",gap:3,marginBottom:16,maxWidth:400}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=2?navy:(dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)")}}/>))}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:400}}>
          <span style={{fontSize:14,color:ts,fontFamily:f}}>2 of 6 sections complete</span>
          <Btn primary small onClick={()=>setSysStep(1)}>System Check <I.Arrow/></Btn>
        </div>
      </div>

      {/* 360 Survey — compact */}
      <div style={{borderTop:`1px solid ${bd}`,paddingTop:24,marginBottom:40,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
        <div>
          <span style={{fontSize:11,fontWeight:700,color:purple,fontFamily:f,letterSpacing:1,textTransform:"uppercase"}}>360&deg; Survey</span>
          <h3 style={{fontSize:20,fontWeight:800,color:tx,fontFamily:f,marginTop:6}}>360&deg; Perspective Index &mdash; Q1</h3>
          <p style={{fontSize:14,color:ts,fontFamily:f,marginTop:4}}>1 of 4 sections &middot; Due Mar 15 &middot; 45 min</p>
        </div>
        <Btn style={{borderColor:purple+"30",color:purple}}>Continue <I.Arrow/></Btn>
      </div>

      {/* Two-column: Quick Links + Events */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,marginBottom:40}}>
        <div>
          <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:20}}>Quick Links</p>
          {quickLinks.map((q,i)=>(
            <div key={i} onClick={q.action} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",cursor:"pointer",borderBottom:`1px solid ${bd}`,transition:"all .15s"}}
              onMouseEnter={e=>e.currentTarget.style.paddingLeft="8px"} onMouseLeave={e=>e.currentTarget.style.paddingLeft="0"}>
              <div style={{color:q.color}}><q.icon/></div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:tx,fontFamily:f}}>{q.label}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{q.desc}</div></div>
              <span style={{color:tm,fontSize:14}}>&rarr;</span>
            </div>
          ))}
        </div>
        <div>
          <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:20}}>Upcoming</p>
          {upcomingEvents.map(ev=>(
            <div key={ev.id} style={{display:"flex",alignItems:"center",gap:16,padding:"12px 0",borderBottom:`1px solid ${bd}`}}>
              <div style={{textAlign:"center",width:44}}>
                <div style={{fontSize:10,fontWeight:800,color:tm,fontFamily:f,textTransform:"uppercase",letterSpacing:1}}>{ev.date.split(" ")[0]}</div>
                <div style={{fontSize:24,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,lineHeight:1.1}}>{ev.date.split(" ")[1]}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{ev.title}</div>
                <div style={{fontSize:12,color:ts,fontFamily:f}}>{ev.time}</div>
              </div>
              <span style={{fontSize:11,fontWeight:700,color:ev.daysAway<=7?red:ts,fontFamily:f}}>{ev.daysAway}d</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reports */}
      <div style={{borderTop:`1px solid ${bd}`,paddingTop:32,marginBottom:40}}>
        <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:20}}>Reports Ready</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {reports.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 0",borderBottom:`1px solid ${bd}`}}>
              <div style={{width:40,height:40,borderRadius:12,background:`${r.color}10`,display:"flex",alignItems:"center",justifyContent:"center",color:r.color,flexShrink:0}}><r.icon/></div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:tx,fontFamily:f}}>{r.assessment}</div>
                <div style={{fontSize:12,color:ts,fontFamily:f}}>{r.type} &middot; {r.date}</div>
              </div>
              <Btn small style={{padding:"5px 10px"}}><I.Dl/> PDF</Btn>
            </div>
          ))}
        </div>
      </div>

      {/* IDP Progress */}
      <div style={{borderTop:`1px solid ${bd}`,paddingTop:32}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <p style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase"}}>Development Plan</p>
          <Btn small onClick={()=>setPg("idp")}>View Full Plan &rarr;</Btn>
        </div>
        <div style={{display:"flex",gap:32,flexWrap:"wrap"}}>
          {[{s:"Executive Presence",p:45,c:navy},{s:"Coaching Others",p:30,c:teal},{s:"Strategic Thinking",p:20,c:purple}].map((sk,i)=>{
            const r=17,circ=2*Math.PI*r;
            return <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
              <svg width="44" height="44" style={{transform:"rotate(-90deg)"}}><circle cx="22" cy="22" r={r} fill="none" stroke={dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"} strokeWidth="3.5"/><circle cx="22" cy="22" r={r} fill="none" stroke={sk.c} strokeWidth="3.5" strokeDasharray={circ} strokeDashoffset={circ*(1-sk.p/100)} strokeLinecap="round"/></svg>
              <div><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{sk.s}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>3 actions &middot; {sk.p}%</div></div>
            </div>;
          })}
        </div>
      </div>
    </main>
  );


  //  CLAYMORPHISM DASHBOARD 
  const ClayDashboard = () => {
    const claySh = dk ? "8px 8px 20px rgba(0,0,0,.4), -4px -4px 12px rgba(255,255,255,.03)" : "8px 8px 20px rgba(0,0,0,.08), -4px -4px 12px rgba(255,255,255,1), inset 0 2px 0 rgba(255,255,255,.7)";
    const clayCard = (color) => ({background:dk?`${color}18`:color+"08",borderRadius:24,padding:"24px 26px",border:`2px solid ${dk?color+"30":color+"15"}`,boxShadow:claySh});
    return <main id="main" style={{maxWidth:900,margin:"0 auto",padding:"0 0 60px"}}>
      <DesignPicker/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        <div style={{gridColumn:"span 3",...clayCard(navy),padding:"40px 36px"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:20,background:teal+"20",marginBottom:16}}>
            <div style={{width:8,height:8,borderRadius:4,background:teal}}/>
            <span style={{fontSize:12,fontWeight:700,color:teal,fontFamily:f}}>Welcome back</span>
          </div>
          <h1 style={{fontSize:40,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-1,lineHeight:1.1,marginBottom:10}}>Good afternoon, Kshitij.</h1>
          <p style={{fontSize:16,color:ts,fontFamily:f,lineHeight:1.6}}>You have <span style={{color:teal,fontWeight:700}}>2 active programs</span> and <span style={{color:green,fontWeight:700}}>2 reports ready</span>.</p>
          {showTour&&!tour&&<div style={{display:"flex",alignItems:"center",gap:12,marginTop:20,padding:"14px 18px",borderRadius:16,background:teal+"10",border:`2px solid ${teal}20`}}>
            <div style={{width:36,height:36,borderRadius:12,background:teal+"20",display:"flex",alignItems:"center",justifyContent:"center",color:teal}}><I.Help/></div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:tx,fontFamily:f}}>Take a quick tour</div><div style={{fontSize:12,color:ts,fontFamily:f}}>30 seconds to learn Lighthouse.</div></div>
            <Btn secondary small onClick={()=>setTour(1)}>Start</Btn>
            <button onClick={()=>setShowTour(false)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button>
          </div>}
        </div>
        <div style={{gridColumn:"span 1",...clayCard(red),display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
          <div style={{fontSize:48,fontWeight:800,color:red,fontFamily:f,lineHeight:1}}>12</div>
          <div style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,marginTop:6,textTransform:"uppercase",letterSpacing:1}}>Days Left</div>
        </div>
        {[{l:"Active",v:"2",c:teal},{l:"Pending",v:"5",c:purple},{l:"Complete",v:"3",c:green},{l:"Reports",v:"2",c:orange}].map((s,i)=>(
          <div key={i} style={{...clayCard(s.c),textAlign:"center",padding:"20px 16px"}}>
            <div style={{fontSize:32,fontWeight:800,color:s.c,fontFamily:f,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:12,fontWeight:600,color:ts,fontFamily:f,marginTop:6}}>{s.l}</div>
          </div>
        ))}
        <div style={{gridColumn:"span 2",...clayCard(navy),overflow:"hidden",padding:0}}>
          <div style={{padding:"24px 26px"}}>
            <span style={{fontSize:10,fontWeight:800,color:"#fff",background:navy,padding:"4px 12px",borderRadius:10,fontFamily:f}}>PRIORITY</span>
            <h3 style={{fontSize:20,fontWeight:800,color:tx,fontFamily:f,lineHeight:1.25,margin:"12px 0 10px",cursor:"pointer"}} onClick={()=>setPg("program")}>Leadership Potential Assessment 2026</h3>
            <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}><DueDate date="Mar 5" urgent/><span style={{fontSize:12,fontWeight:700,color:ts,fontFamily:f}}>~4 hours</span></div>
            <div style={{display:"flex",gap:4,marginBottom:14}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{flex:1,height:6,borderRadius:4,background:i<=2?navy:(dk?"rgba(255,255,255,.08)":"rgba(0,0,0,.05)")}}/>))}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:ts,fontFamily:f}}>2/6 sections</span><Btn primary small onClick={()=>setSysStep(1)}>System Check <I.Arrow/></Btn></div>
          </div>
          <div style={{padding:"12px 26px",background:purple+"08",borderTop:`2px solid ${purple}15`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:10,fontWeight:800,color:purple,fontFamily:f,background:purple+"15",padding:"3px 10px",borderRadius:8}}>360&deg;</span><span style={{flex:1,fontSize:13,fontWeight:700,color:tx,fontFamily:f}}>360&deg; Perspective Index</span><span style={{fontSize:11,color:ts,fontFamily:f}}>1/4</span></div>
          </div>
        </div>
        <div style={{gridColumn:"span 2",...clayCard(teal)}}>
          <h3 style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14}}><I.Zap/> Quick Links</h3>
          {quickLinks.map((q,i)=>(<div key={i} onClick={q.action} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:16,cursor:"pointer",background:q.color+"08",border:`2px solid ${q.color}12`,marginBottom:8,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}><div style={{width:36,height:36,borderRadius:12,background:q.color+"15",display:"flex",alignItems:"center",justifyContent:"center",color:q.color}}><q.icon/></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{q.label}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{q.desc}</div></div><span style={{color:tm}}>&rarr;</span></div>))}
        </div>
        <div style={{gridColumn:"span 2",...clayCard(orange)}}><h3 style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14}}>Upcoming Events</h3>{upcomingEvents.map(ev=>(<div key={ev.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:`1px solid ${bd}`}}><div style={{width:48,textAlign:"center"}}><div style={{fontSize:10,fontWeight:800,color:tm,fontFamily:f,textTransform:"uppercase"}}>{ev.date.split(" ")[0]}</div><div style={{fontSize:24,fontWeight:800,color:tx,fontFamily:f}}>{ev.date.split(" ")[1]}</div></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{ev.title}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{ev.time}</div></div><span style={{fontSize:11,fontWeight:700,color:ev.daysAway<=7?red:ts,fontFamily:f}}>{ev.daysAway}d</span></div>))}</div>
        <div style={{gridColumn:"span 2",...clayCard(green)}}><h3 style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14}}>Reports Ready</h3>{reports.map(r=>(<div key={r.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:16,background:r.color+"08",border:`2px solid ${r.color}10`,marginBottom:8}}><div style={{width:40,height:40,borderRadius:12,background:r.color+"15",display:"flex",alignItems:"center",justifyContent:"center",color:r.color}}><r.icon/></div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:tx,fontFamily:f}}>{r.assessment}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{r.type} &middot; {r.date}</div></div><Btn small style={{padding:"5px 10px"}}><I.Dl/> PDF</Btn></div>))}</div>
        <div style={{gridColumn:"span 4",...clayCard(purple),padding:"22px 26px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}><div><h3 style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14}}>Development Plan</h3><div style={{display:"flex",gap:24,flexWrap:"wrap"}}>{[{s:"Executive Presence",p:45,c:navy},{s:"Coaching Others",p:30,c:teal},{s:"Strategic Thinking",p:20,c:purple}].map((sk,i)=>{const r=17,ci=2*Math.PI*r;return <div key={i} style={{display:"flex",alignItems:"center",gap:12}}><svg width="44" height="44" style={{transform:"rotate(-90deg)"}}><circle cx="22" cy="22" r={r} fill="none" stroke={dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"} strokeWidth="3.5"/><circle cx="22" cy="22" r={r} fill="none" stroke={sk.c} strokeWidth="3.5" strokeDasharray={ci} strokeDashoffset={ci*(1-sk.p/100)} strokeLinecap="round"/></svg><div><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{sk.s}</div><div style={{fontSize:11,color:ts,fontFamily:f}}>{sk.p}%</div></div></div>})}</div></div><Btn small onClick={()=>setPg("idp")}>View Plan &rarr;</Btn></div></div>
      </div>
    </main>;
  };

  //  AURORA / GRADIENT MESH DASHBOARD 
  const AuroraDashboard = () => {
    const aGls = {background:dk?"rgba(255,255,255,.03)":"rgba(255,255,255,.7)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",border:`1px solid ${dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)"}`,borderRadius:20};
    return <main id="main" style={{maxWidth:900,margin:"0 auto",padding:"0 0 60px",position:"relative"}}>
      <DesignPicker/>
      {/* Aurora blobs */}
      <div style={{position:"fixed",top:"5%",left:"10%",width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${navy}30,transparent 70%)`,filter:"blur(100px)",animation:"floatOrb 18s ease-in-out infinite",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",top:"40%",right:"5%",width:350,height:350,borderRadius:"50%",background:`radial-gradient(circle,${purple}20,transparent 70%)`,filter:"blur(90px)",animation:"floatOrb 22s ease-in-out infinite reverse",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"5%",left:"30%",width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,${teal}18,transparent 70%)`,filter:"blur(80px)",animation:"floatOrb 20s ease-in-out infinite",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"relative",zIndex:1,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        <div style={{gridColumn:"span 3",...aGls,padding:"40px 36px"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:20,background:teal+"12",marginBottom:16}}><div style={{width:6,height:6,borderRadius:3,background:teal,boxShadow:`0 0 8px ${teal}`}}/><span style={{fontSize:11,fontWeight:700,color:teal,fontFamily:f}}>Welcome back</span></div>
          <h1 style={{fontSize:42,fontWeight:800,color:dk?"#fff":navy,fontFamily:f,letterSpacing:-1.2,lineHeight:1.08,marginBottom:10}}>Good afternoon, Kshitij.</h1>
          <p style={{fontSize:16,color:ts,fontFamily:f,lineHeight:1.6}}>You have <span style={{color:teal,fontWeight:700}}>2 active programs</span> and <span style={{color:green,fontWeight:700}}>2 reports ready</span>.</p>
          {showTour&&!tour&&<div style={{display:"flex",alignItems:"center",gap:12,marginTop:20,padding:"14px 18px",borderRadius:14,...aGls}}><div style={{width:36,height:36,borderRadius:10,background:teal+"15",display:"flex",alignItems:"center",justifyContent:"center",color:teal}}><I.Help/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:tx,fontFamily:f}}>Take a quick tour</div><div style={{fontSize:12,color:ts,fontFamily:f}}>30 seconds.</div></div><Btn secondary small onClick={()=>setTour(1)}>Start</Btn><button onClick={()=>setShowTour(false)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button></div>}
        </div>
        <div style={{gridColumn:"span 1",...aGls,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",boxShadow:dk?`0 0 40px ${red}15`:"none"}}>
          <div style={{fontSize:52,fontWeight:800,color:red,fontFamily:f,lineHeight:1,textShadow:dk?`0 0 30px ${red}40`:"none"}}>12</div>
          <div style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,marginTop:6,textTransform:"uppercase",letterSpacing:1}}>Days Left</div>
        </div>
        {[{l:"Active",v:"2",c:teal},{l:"Pending",v:"5",c:dk?"#ccc":navy},{l:"Complete",v:"3",c:green},{l:"Reports",v:"2",c:purple}].map((s,i)=>(<div key={i} style={{...aGls,padding:"20px 16px",textAlign:"center"}}><div style={{fontSize:34,fontWeight:800,color:s.c,fontFamily:f,lineHeight:1,textShadow:dk?`0 0 20px ${s.c}30`:"none"}}>{s.v}</div><div style={{fontSize:12,fontWeight:600,color:ts,fontFamily:f,marginTop:6}}>{s.l}</div></div>))}
        <div style={{gridColumn:"span 2",...aGls,overflow:"hidden",padding:0,boxShadow:dk?`0 0 30px ${navy}15`:"none"}}><div style={{padding:"24px 26px"}}><span style={{fontSize:10,fontWeight:800,color:"#fff",background:navy,padding:"3px 10px",borderRadius:6,fontFamily:f,boxShadow:dk?`0 0 12px ${navy}60`:"none"}}>PRIORITY</span><h3 style={{fontSize:20,fontWeight:800,color:tx,fontFamily:f,margin:"12px 0 10px",cursor:"pointer"}} onClick={()=>setPg("program")}>Leadership Potential Assessment 2026</h3><div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}><DueDate date="Mar 5" urgent/><span style={{fontSize:12,fontWeight:700,color:ts,fontFamily:f}}>~4 hours</span></div><div style={{display:"flex",gap:3,marginBottom:14}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{flex:1,height:5,borderRadius:3,background:i<=2?`linear-gradient(90deg,${navy},${teal})`:(dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)"),boxShadow:i<=2&&dk?`0 0 8px ${teal}30`:"none"}}/>))}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:ts,fontFamily:f}}>2/6</span><Btn primary small onClick={()=>setSysStep(1)}>System Check <I.Arrow/></Btn></div></div><div style={{padding:"14px 26px",background:dk?"rgba(255,255,255,.02)":"rgba(255,255,255,.3)",borderTop:`1px solid ${dk?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)"}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:10,fontWeight:800,color:purple,fontFamily:f,background:purple+"12",padding:"3px 10px",borderRadius:6}}>360&deg;</span><span style={{flex:1,fontSize:13,fontWeight:700,color:tx,fontFamily:f}}>360&deg; Perspective Index</span><span style={{fontSize:11,color:ts,fontFamily:f}}>1/4</span></div></div></div>
        <div style={{gridColumn:"span 2",...aGls,padding:"24px 26px"}}><h3 style={{fontSize:10,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>Quick Links</h3>{quickLinks.map((q,i)=>(<div key={i} onClick={q.action} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:14,cursor:"pointer",marginBottom:6,...aGls,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}><div style={{width:36,height:36,borderRadius:10,background:dk?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)",display:"flex",alignItems:"center",justifyContent:"center",color:q.color}}><q.icon/></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{q.label}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{q.desc}</div></div><span style={{color:tm}}>&rarr;</span></div>))}</div>
        <div style={{gridColumn:"span 2",...aGls,padding:"24px 26px"}}><h3 style={{fontSize:10,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>Upcoming Events</h3>{upcomingEvents.map(ev=>(<div key={ev.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:`1px solid ${dk?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)"}`}}><div style={{width:48,textAlign:"center"}}><div style={{fontSize:10,fontWeight:800,color:tm,fontFamily:f,textTransform:"uppercase"}}>{ev.date.split(" ")[0]}</div><div style={{fontSize:24,fontWeight:800,color:tx,fontFamily:f}}>{ev.date.split(" ")[1]}</div></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{ev.title}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{ev.time}</div></div><span style={{fontSize:11,fontWeight:700,color:ev.daysAway<=7?red:ts,fontFamily:f}}>{ev.daysAway}d</span></div>))}</div>
        <div style={{gridColumn:"span 2",...aGls,padding:"24px 26px"}}><h3 style={{fontSize:10,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>Reports Ready</h3>{reports.map(r=>(<div key={r.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:14,marginBottom:8,...aGls}}><div style={{width:40,height:40,borderRadius:12,background:r.color+"10",display:"flex",alignItems:"center",justifyContent:"center",color:r.color}}><r.icon/></div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:tx,fontFamily:f}}>{r.assessment}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{r.type} &middot; {r.date}</div></div><Btn small style={{padding:"5px 10px"}}><I.Dl/> PDF</Btn></div>))}</div>
        <div style={{gridColumn:"span 4",...aGls,padding:"22px 26px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}><div><h3 style={{fontSize:10,fontWeight:800,color:tm,fontFamily:f,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>Development Plan</h3><div style={{display:"flex",gap:24,flexWrap:"wrap"}}>{[{s:"Executive Presence",p:45,c:navy},{s:"Coaching Others",p:30,c:teal},{s:"Strategic Thinking",p:20,c:purple}].map((sk,i)=>{const r=17,ci=2*Math.PI*r;return <div key={i} style={{display:"flex",alignItems:"center",gap:12}}><svg width="44" height="44" style={{transform:"rotate(-90deg)"}}><circle cx="22" cy="22" r={r} fill="none" stroke={dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"} strokeWidth="3.5"/><circle cx="22" cy="22" r={r} fill="none" stroke={sk.c} strokeWidth="3.5" strokeDasharray={ci} strokeDashoffset={ci*(1-sk.p/100)} strokeLinecap="round" style={{filter:dk?`drop-shadow(0 0 6px ${sk.c}60)`:"none"}}/></svg><div><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{sk.s}</div><div style={{fontSize:11,color:ts,fontFamily:f}}>{sk.p}%</div></div></div>})}</div></div><Btn small onClick={()=>setPg("idp")}>View Plan &rarr;</Btn></div></div>
      </div>
    </main>;
  };

  //  DARK PREMIUM DASHBOARD 
  const DarkPremDashboard = () => {
    const gold = "#C9A84C";
    const goldTx = dk ? gold : "#8B7230";
    const accent = designMode==="darkprem" ? gold : teal;
    const accentTx = designMode==="darkprem" ? goldTx : teal;
    const premCard = {background:dk?"#16141c":"#fff",border:`1px solid ${dk?"rgba(201,168,76,.12)":"rgba(0,0,0,.06)"}`,borderRadius:16};
    return <main id="main" style={{maxWidth:900,margin:"0 auto",padding:"0 0 60px"}}>
      <DesignPicker/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        <div style={{gridColumn:"span 3",...premCard,padding:"40px 36px"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:20,background:accent+"12",marginBottom:16}}><div style={{width:6,height:6,borderRadius:3,background:accent}}/><span style={{fontSize:11,fontWeight:700,color:accentTx,fontFamily:f}}>Welcome back</span></div>
          <h1 style={{fontSize:40,fontWeight:800,color:dk?"#fff":"#1a1a1a",fontFamily:f,letterSpacing:-1,lineHeight:1.1,marginBottom:10}}>Good afternoon, Kshitij.</h1>
          <p style={{fontSize:16,color:ts,fontFamily:f,lineHeight:1.6}}>You have <span style={{color:accent,fontWeight:700}}>2 active programs</span> and <span style={{color:green,fontWeight:700}}>2 reports ready</span>.</p>
          {showTour&&!tour&&<div style={{display:"flex",alignItems:"center",gap:12,marginTop:20,padding:"14px 18px",borderRadius:12,background:accent+"08",border:`1px solid ${accent}20`}}><div style={{width:36,height:36,borderRadius:10,background:accent+"15",display:"flex",alignItems:"center",justifyContent:"center",color:accent}}><I.Help/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:tx,fontFamily:f}}>Take a quick tour</div></div><Btn secondary small onClick={()=>setTour(1)}>Start</Btn><button onClick={()=>setShowTour(false)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button></div>}
        </div>
        <div style={{gridColumn:"span 1",...premCard,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"24px"}}>
          <div style={{fontSize:48,fontWeight:800,color:red,fontFamily:f,lineHeight:1}}>12</div>
          <div style={{fontSize:11,fontWeight:800,color:tm,fontFamily:f,marginTop:6,textTransform:"uppercase",letterSpacing:1}}>Days Left</div>
        </div>
        {[{l:"Active",v:"2",c:accent},{l:"Pending",v:"5",c:dk?"#ccc":"#333"},{l:"Complete",v:"3",c:green},{l:"Reports",v:"2",c:purple}].map((s,i)=>(<div key={i} style={{...premCard,padding:"20px 16px",textAlign:"center"}}><div style={{fontSize:32,fontWeight:800,color:s.c,fontFamily:f,lineHeight:1}}>{s.v}</div><div style={{fontSize:12,fontWeight:600,color:ts,fontFamily:f,marginTop:6}}>{s.l}</div></div>))}
        <div style={{gridColumn:"span 2",...premCard,overflow:"hidden",padding:0}}><div style={{padding:"24px 26px"}}><span style={{fontSize:10,fontWeight:800,color:"#fff",background:dk?"#333":navy,padding:"3px 10px",borderRadius:6,fontFamily:f}}>PRIORITY</span><h3 style={{fontSize:20,fontWeight:800,color:tx,fontFamily:f,margin:"12px 0 10px",cursor:"pointer"}} onClick={()=>setPg("program")}>Leadership Potential Assessment 2026</h3><div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}><DueDate date="Mar 5" urgent/><span style={{fontSize:12,fontWeight:700,color:ts,fontFamily:f}}>~4 hours</span></div><div style={{display:"flex",gap:3,marginBottom:14}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{flex:1,height:5,borderRadius:3,background:i<=2?accent:(dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)")}}/>))}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:ts,fontFamily:f}}>2/6</span><Btn primary small onClick={()=>setSysStep(1)}>System Check <I.Arrow/></Btn></div></div><div style={{padding:"14px 26px",background:dk?"rgba(255,255,255,.02)":"#F9F9F9",borderTop:`1px solid ${bd}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:10,fontWeight:800,color:purple,fontFamily:f,background:purple+"12",padding:"3px 10px",borderRadius:6}}>360&deg;</span><span style={{flex:1,fontSize:13,fontWeight:700,color:tx,fontFamily:f}}>360&deg; Perspective Index</span><span style={{fontSize:11,color:ts,fontFamily:f}}>1/4</span></div></div></div>
        <div style={{gridColumn:"span 2",...premCard,padding:"24px 26px"}}><h3 style={{fontSize:11,fontWeight:800,color:accentTx,fontFamily:f,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14}}>Quick Links</h3>{quickLinks.map((q,i)=>(<div key={i} onClick={q.action} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:12,cursor:"pointer",border:`1px solid ${bd}`,marginBottom:8,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}><div style={{width:36,height:36,borderRadius:10,background:accent+"10",display:"flex",alignItems:"center",justifyContent:"center",color:accent}}><q.icon/></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{q.label}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{q.desc}</div></div><span style={{color:tm}}>&rarr;</span></div>))}</div>
        <div style={{gridColumn:"span 2",...premCard,padding:"24px 26px"}}><h3 style={{fontSize:11,fontWeight:800,color:accentTx,fontFamily:f,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14}}>Upcoming Events</h3>{upcomingEvents.map(ev=>(<div key={ev.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:`1px solid ${bd}`}}><div style={{width:48,textAlign:"center"}}><div style={{fontSize:10,fontWeight:800,color:tm,fontFamily:f,textTransform:"uppercase"}}>{ev.date.split(" ")[0]}</div><div style={{fontSize:24,fontWeight:800,color:tx,fontFamily:f}}>{ev.date.split(" ")[1]}</div></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{ev.title}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{ev.time}</div></div><span style={{fontSize:11,fontWeight:700,color:ev.daysAway<=7?red:ts,fontFamily:f}}>{ev.daysAway}d</span></div>))}</div>
        <div style={{gridColumn:"span 2",...premCard,padding:"24px 26px"}}><h3 style={{fontSize:11,fontWeight:800,color:accentTx,fontFamily:f,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14}}>Reports Ready</h3>{reports.map(r=>(<div key={r.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,border:`1px solid ${bd}`,marginBottom:8}}><div style={{width:40,height:40,borderRadius:12,background:r.color+"10",display:"flex",alignItems:"center",justifyContent:"center",color:r.color}}><r.icon/></div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:tx,fontFamily:f}}>{r.assessment}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{r.type} &middot; {r.date}</div></div><Btn small style={{padding:"5px 10px"}}><I.Dl/> PDF</Btn></div>))}</div>
        <div style={{gridColumn:"span 4",...premCard,padding:"22px 26px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}><div><h3 style={{fontSize:11,fontWeight:800,color:accentTx,fontFamily:f,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14}}>Development Plan</h3><div style={{display:"flex",gap:24,flexWrap:"wrap"}}>{[{s:"Executive Presence",p:45,c:accent},{s:"Coaching Others",p:30,c:teal},{s:"Strategic Thinking",p:20,c:purple}].map((sk,i)=>{const r=17,ci=2*Math.PI*r;return <div key={i} style={{display:"flex",alignItems:"center",gap:12}}><svg width="44" height="44" style={{transform:"rotate(-90deg)"}}><circle cx="22" cy="22" r={r} fill="none" stroke={dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"} strokeWidth="3.5"/><circle cx="22" cy="22" r={r} fill="none" stroke={sk.c} strokeWidth="3.5" strokeDasharray={ci} strokeDashoffset={ci*(1-sk.p/100)} strokeLinecap="round"/></svg><div><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{sk.s}</div><div style={{fontSize:11,color:ts,fontFamily:f}}>{sk.p}%</div></div></div>})}</div></div><Btn small onClick={()=>setPg("idp")}>View Plan &rarr;</Btn></div></div>
      </div>
    </main>;
  };

  //  BRUTALIST DASHBOARD 
  const BrutalDashboard = () => {
    const mono = "'DM Mono','Courier New',monospace";
    const bBd = dk?"2px solid #fff":"2px solid #000";
    return <main id="main" style={{maxWidth:900,margin:"0 auto",padding:"0 0 60px"}}>
      <DesignPicker/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0}}>
        <div style={{gridColumn:"span 3",border:bBd,padding:"40px 36px"}}>
          <div style={{fontSize:11,fontWeight:700,color:teal,fontFamily:mono,textTransform:"uppercase",letterSpacing:2,marginBottom:16}}>// WELCOME_BACK</div>
          <h1 style={{fontSize:48,fontWeight:900,color:tx,fontFamily:mono,letterSpacing:-2,lineHeight:1,marginBottom:12,textTransform:"uppercase"}}>Good afternoon, Kshitij.</h1>
          <p style={{fontSize:16,color:ts,fontFamily:mono,lineHeight:1.7}}>active_programs: <span style={{color:teal,fontWeight:700}}>2</span> | reports_ready: <span style={{color:green,fontWeight:700}}>2</span></p>
          {showTour&&!tour&&<div style={{display:"flex",alignItems:"center",gap:12,marginTop:20,padding:"14px 18px",border:bBd}}><div style={{flex:1,fontFamily:mono,fontSize:13,color:tx}}>{'>'} NEW_USER? Run quick_tour.sh</div><button onClick={()=>setTour(1)} style={{background:dk?"#fff":"#000",color:dk?"#000":"#fff",border:"none",padding:"8px 16px",fontWeight:900,fontFamily:mono,fontSize:12,cursor:"pointer"}}>START</button><button onClick={()=>setShowTour(false)} style={{background:"none",border:"none",cursor:"pointer",color:tm,fontFamily:mono,fontSize:16}}>X</button></div>}
        </div>
        <div style={{gridColumn:"span 1",border:bBd,borderLeft:"none",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"24px"}}>
          <div style={{fontSize:56,fontWeight:900,color:red,fontFamily:mono,lineHeight:1}}>12</div>
          <div style={{fontSize:10,fontWeight:900,color:tm,fontFamily:mono,marginTop:6,textTransform:"uppercase",letterSpacing:2}}>DAYS_LEFT</div>
        </div>
        {[{l:"ACTIVE",v:"2",c:teal},{l:"PENDING",v:"5",c:dk?"#fff":navy},{l:"DONE",v:"3",c:green},{l:"REPORTS",v:"2",c:purple}].map((s,i)=>(<div key={i} style={{border:bBd,borderTop:"none",padding:"20px 16px",textAlign:"center",...(i>0?{borderLeft:"none"}:{})}}><div style={{fontSize:36,fontWeight:900,color:s.c,fontFamily:mono,lineHeight:1}}>{s.v}</div><div style={{fontSize:10,fontWeight:900,color:tm,fontFamily:mono,marginTop:6,letterSpacing:2}}>{s.l}</div></div>))}
        <div style={{gridColumn:"span 2",border:bBd,borderTop:"none",padding:0}}>
          <div style={{padding:"24px 26px"}}>
            <div style={{fontSize:10,fontWeight:900,color:teal,fontFamily:mono,letterSpacing:2,marginBottom:12}}>// PRIORITY_TASK</div>
            <h3 style={{fontSize:22,fontWeight:900,color:tx,fontFamily:mono,lineHeight:1.2,marginBottom:10,textTransform:"uppercase",cursor:"pointer"}} onClick={()=>setPg("program")}>Leadership Potential Assessment 2026</h3>
            <div style={{fontFamily:mono,fontSize:12,color:ts,marginBottom:16}}>type: proctored | eta: ~4h | due: Mar_5 | <span style={{color:red,fontWeight:700}}>URGENT</span></div>
            <div style={{display:"flex",gap:2,marginBottom:14}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{flex:1,height:6,background:i<=2?(dk?"#fff":"#000"):(dk?"rgba(255,255,255,.1)":"rgba(0,0,0,.06)")}}/>))}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:ts,fontFamily:mono}}>progress: 2/6</span><button onClick={()=>setSysStep(1)} style={{background:dk?"#fff":"#000",color:dk?"#000":"#fff",border:"none",padding:"8px 20px",fontWeight:900,fontFamily:mono,fontSize:12,cursor:"pointer"}}>SYS_CHECK &rarr;</button></div>
          </div>
          <div style={{padding:"12px 26px",borderTop:bBd}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:10,fontWeight:900,color:purple,fontFamily:mono,letterSpacing:2}}>360_SURVEY</span><span style={{flex:1,fontSize:13,fontWeight:700,color:tx,fontFamily:mono}}>Perspective Index Q1</span><span style={{fontSize:11,color:ts,fontFamily:mono}}>1/4</span></div></div>
        </div>
        <div style={{gridColumn:"span 2",border:bBd,borderTop:"none",borderLeft:"none",padding:"24px 26px"}}>
          <div style={{fontSize:10,fontWeight:900,color:tm,fontFamily:mono,letterSpacing:2,marginBottom:14}}>// QUICK_LINKS</div>
          {quickLinks.map((q,i)=>(<div key={i} onClick={q.action} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:bBd,cursor:"pointer",transition:"all .1s"}} onMouseEnter={e=>e.currentTarget.style.paddingLeft="8px"} onMouseLeave={e=>e.currentTarget.style.paddingLeft="0"}><div style={{color:q.color}}><q.icon/></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:900,color:tx,fontFamily:mono,textTransform:"uppercase"}}>{q.label}</div><div style={{fontSize:11,color:ts,fontFamily:mono}}>{q.desc}</div></div><span style={{fontFamily:mono,color:tm}}>&rarr;</span></div>))}
        </div>
        <div style={{gridColumn:"span 2",border:bBd,borderTop:"none",padding:"24px 26px"}}><div style={{fontSize:10,fontWeight:900,color:tm,fontFamily:mono,letterSpacing:2,marginBottom:14}}>// EVENTS</div>{upcomingEvents.map(ev=>(<div key={ev.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:bBd}}><div style={{fontFamily:mono,fontSize:11,color:tm,width:44}}>{ev.date.split(" ")[0]}_{ev.date.split(" ")[1]}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:900,color:tx,fontFamily:mono,textTransform:"uppercase"}}>{ev.title}</div><div style={{fontSize:11,color:ts,fontFamily:mono}}>{ev.time}</div></div><span style={{fontSize:11,fontWeight:900,color:ev.daysAway<=7?red:ts,fontFamily:mono}}>{ev.daysAway}d</span></div>))}</div>
        <div style={{gridColumn:"span 2",border:bBd,borderTop:"none",borderLeft:"none",padding:"24px 26px"}}><div style={{fontSize:10,fontWeight:900,color:tm,fontFamily:mono,letterSpacing:2,marginBottom:14}}>// REPORTS</div>{reports.map(r=>(<div key={r.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:bBd}}><div style={{color:r.color}}><r.icon/></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:900,color:tx,fontFamily:mono,textTransform:"uppercase"}}>{r.assessment}</div><div style={{fontSize:11,color:ts,fontFamily:mono}}>{r.type} | {r.date}</div></div><button style={{background:"none",border:bBd,padding:"4px 10px",fontFamily:mono,fontSize:11,color:tx,cursor:"pointer"}}>DL</button></div>))}</div>
        <div style={{gridColumn:"span 4",border:bBd,borderTop:"none",padding:"22px 26px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}><div><div style={{fontSize:10,fontWeight:900,color:tm,fontFamily:mono,letterSpacing:2,marginBottom:14}}>// DEV_PLAN</div><div style={{display:"flex",gap:32,flexWrap:"wrap"}}>{[{s:"EXEC_PRESENCE",p:45,c:navy},{s:"COACHING",p:30,c:teal},{s:"STRATEGY",p:20,c:purple}].map((sk,i)=>(<div key={i}><div style={{fontSize:28,fontWeight:900,color:sk.c,fontFamily:mono}}>{sk.p}%</div><div style={{fontSize:10,color:ts,fontFamily:mono,letterSpacing:1}}>{sk.s}</div></div>))}</div></div><button onClick={()=>setPg("idp")} style={{background:dk?"#fff":"#000",color:dk?"#000":"#fff",border:"none",padding:"8px 20px",fontWeight:900,fontFamily:mono,fontSize:12,cursor:"pointer"}}>VIEW_PLAN &rarr;</button></div></div>
      </div>
    </main>;
  };

  //  NOTION / BLOCK-BASED DASHBOARD 
  const NotionDashboard = () => {
    const nCard = {background:card,border:`1px solid ${bd}`,borderRadius:8,padding:"18px 20px",transition:"all .15s"};
    return <main id="main" style={{maxWidth:800,margin:"0 auto",padding:"0 0 60px"}}>
      <DesignPicker/>
      <div style={{paddingTop:32,marginBottom:28}}>
        <h1 style={{fontSize:36,fontWeight:700,color:tx,fontFamily:f,letterSpacing:-.5,lineHeight:1.15,marginBottom:8}}>Good afternoon, Kshitij</h1>
        <p style={{fontSize:15,color:ts,fontFamily:f,lineHeight:1.6}}>2 active programs &middot; 2 reports ready</p>
      </div>
      {showTour&&!tour&&<div style={{...nCard,display:"flex",alignItems:"center",gap:12,marginBottom:20,borderLeft:`3px solid ${teal}`}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>New here? Take a quick tour</div></div><button onClick={()=>setTour(1)} style={{background:dk?"rgba(255,255,255,.06)":"#F3F3F3",border:"none",padding:"6px 14px",borderRadius:6,fontWeight:600,fontSize:13,fontFamily:f,cursor:"pointer",color:tx}}>Start Tour</button><button onClick={()=>setShowTour(false)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button></div>}
      {/* Status blocks inline */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
        {[{l:"Active",v:"2",c:teal},{l:"Pending",v:"5",c:dk?"#ccc":navy},{l:"Complete",v:"3",c:green},{l:"Days Left",v:"12",c:red}].map((s,i)=>(<div key={i} style={{...nCard,textAlign:"center",cursor:"default"}} onMouseEnter={e=>e.currentTarget.style.background=dk?"rgba(255,255,255,.04)":"#F7F7F5"} onMouseLeave={e=>e.currentTarget.style.background=card}><div style={{fontSize:28,fontWeight:700,color:s.c,fontFamily:f,lineHeight:1}}>{s.v}</div><div style={{fontSize:12,color:ts,fontFamily:f,marginTop:4}}>{s.l}</div></div>))}
      </div>
      {/* Toggle sections */}
      {[{title:"Priority Assessment",content:()=><div style={{padding:"16px 20px"}}><h3 style={{fontSize:18,fontWeight:700,color:tx,fontFamily:f,marginBottom:8,cursor:"pointer"}} onClick={()=>setPg("program")}>Leadership Potential Assessment 2026</h3><p style={{fontSize:14,color:ts,fontFamily:f,marginBottom:14}}>Proctored &middot; ~4 hours &middot; Due Mar 5</p><div style={{display:"flex",gap:3,marginBottom:12}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=2?navy:(dk?"rgba(255,255,255,.06)":"#EDEDEC")}}/>))}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:ts,fontFamily:f}}>2 of 6 sections</span><Btn primary small onClick={()=>setSysStep(1)}>System Check <I.Arrow/></Btn></div></div>},
        {title:"Quick Links",content:()=><div style={{padding:"4px 20px 16px"}}>{quickLinks.map((q,i)=>(<div key={i} onClick={q.action} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 8px",borderRadius:6,cursor:"pointer",transition:"all .1s"}} onMouseEnter={e=>e.currentTarget.style.background=dk?"rgba(255,255,255,.04)":"#F7F7F5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{color:q.color}}><q.icon/></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{q.label}</div></div><span style={{color:tm,fontSize:13}}>&rarr;</span></div>))}</div>},
        {title:"Upcoming Events",content:()=><div style={{padding:"4px 20px 16px"}}>{upcomingEvents.map(ev=>(<div key={ev.id} style={{display:"flex",alignItems:"center",gap:14,padding:"8px 8px",borderRadius:6}} onMouseEnter={e=>e.currentTarget.style.background=dk?"rgba(255,255,255,.04)":"#F7F7F5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{width:44,textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:tm,fontFamily:f,textTransform:"uppercase"}}>{ev.date.split(" ")[0]}</div><div style={{fontSize:20,fontWeight:700,color:tx,fontFamily:f}}>{ev.date.split(" ")[1]}</div></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{ev.title}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{ev.time}</div></div><span style={{fontSize:11,fontWeight:600,color:ev.daysAway<=7?red:ts,fontFamily:f}}>{ev.daysAway}d</span></div>))}</div>},
        {title:"Reports Ready",content:()=><div style={{padding:"4px 20px 16px"}}>{reports.map(r=>(<div key={r.id} style={{display:"flex",alignItems:"center",gap:14,padding:"8px 8px",borderRadius:6}} onMouseEnter={e=>e.currentTarget.style.background=dk?"rgba(255,255,255,.04)":"#F7F7F5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{width:36,height:36,borderRadius:8,background:r.color+"10",display:"flex",alignItems:"center",justifyContent:"center",color:r.color}}><r.icon/></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{r.assessment}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{r.type}</div></div><Btn small style={{padding:"4px 10px",fontSize:12}}><I.Dl/> PDF</Btn></div>))}</div>},
        {title:"Development Plan",content:()=><div style={{padding:"4px 20px 16px"}}><div style={{display:"flex",gap:24,flexWrap:"wrap"}}>{[{s:"Executive Presence",p:45,c:navy},{s:"Coaching Others",p:30,c:teal},{s:"Strategic Thinking",p:20,c:purple}].map((sk,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:40,height:4,borderRadius:2,background:dk?"rgba(255,255,255,.06)":"#EDEDEC",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",left:0,top:0,bottom:0,width:sk.p+"%",background:sk.c,borderRadius:2}}/></div><div style={{fontSize:13,fontWeight:600,color:tx,fontFamily:f}}>{sk.s}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{sk.p}%</div></div>))}</div><div style={{marginTop:12}}><Btn small onClick={()=>setPg("idp")}>View Full Plan &rarr;</Btn></div></div>}
      ].map((sec,i)=>(<div key={i} style={{...nCard,padding:0,marginBottom:10}}>
        <div style={{padding:"12px 20px",display:"flex",alignItems:"center",gap:8,borderBottom:`1px solid ${bd}`}}>
          <span style={{fontSize:14,fontWeight:700,color:tx,fontFamily:f}}>{sec.title}</span>
        </div>
        {sec.content()}
      </div>))}
    </main>;
  };

  //  MATERIAL 3 DASHBOARD 
  const MaterialDashboard = () => {
    const mCard = {background:card,borderRadius:16,padding:"20px 22px",border:"none",boxShadow:dk?"0 1px 3px rgba(0,0,0,.3),0 4px 8px rgba(0,0,0,.15)":"0 1px 3px rgba(0,0,0,.06),0 4px 8px rgba(0,0,0,.04)"};
    const mPill = (c) => ({fontSize:11,fontWeight:700,color:c,background:c+"14",padding:"4px 14px",borderRadius:20,fontFamily:f});
    return <main id="main" style={{maxWidth:900,margin:"0 auto",padding:"0 0 60px"}}>
      <DesignPicker/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        <div style={{gridColumn:"span 3",...mCard,padding:"36px 34px",borderRadius:28}}>
          <span style={{...mPill(teal),marginBottom:16,display:"inline-block"}}>Welcome back</span>
          <h1 style={{fontSize:38,fontWeight:700,color:tx,fontFamily:f,letterSpacing:-.8,lineHeight:1.12,marginBottom:10}}>Good afternoon, Kshitij.</h1>
          <p style={{fontSize:16,color:ts,fontFamily:f,lineHeight:1.6}}>You have <span style={{color:teal,fontWeight:600}}>2 active programs</span> and <span style={{color:green,fontWeight:600}}>2 reports ready</span>.</p>
          {showTour&&!tour&&<div style={{display:"flex",alignItems:"center",gap:12,marginTop:20,padding:"14px 18px",borderRadius:16,background:teal+"08"}}><div style={{width:40,height:40,borderRadius:20,background:teal+"15",display:"flex",alignItems:"center",justifyContent:"center",color:teal}}><I.Help/></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>Take a quick tour</div></div><button onClick={()=>setTour(1)} style={{background:teal,color:"#fff",border:"none",padding:"10px 24px",borderRadius:20,fontWeight:700,fontSize:13,fontFamily:f,cursor:"pointer"}}>Start Tour</button><button onClick={()=>setShowTour(false)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button></div>}
        </div>
        <div style={{gridColumn:"span 1",...mCard,borderRadius:28,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",background:dk?"#2B2930":red+"08"}}>
          <div style={{fontSize:48,fontWeight:800,color:red,fontFamily:f,lineHeight:1}}>12</div>
          <div style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,marginTop:6,textTransform:"uppercase",letterSpacing:1}}>Days Left</div>
        </div>
        {[{l:"Active",v:"2",c:teal},{l:"Pending",v:"5",c:dk?"#ccc":navy},{l:"Complete",v:"3",c:green},{l:"Reports",v:"2",c:purple}].map((s,i)=>(<div key={i} style={{...mCard,textAlign:"center",borderRadius:20,background:dk?"#2B2930":s.c+"06"}}><div style={{fontSize:30,fontWeight:700,color:s.c,fontFamily:f,lineHeight:1}}>{s.v}</div><div style={{fontSize:12,color:ts,fontFamily:f,marginTop:6}}>{s.l}</div></div>))}
        <div style={{gridColumn:"span 2",...mCard,borderRadius:28,overflow:"hidden",padding:0}}><div style={{padding:"24px 26px"}}><span style={{...mPill(navy)}}>Priority</span><h3 style={{fontSize:20,fontWeight:700,color:tx,fontFamily:f,margin:"12px 0 10px",cursor:"pointer"}} onClick={()=>setPg("program")}>Leadership Potential Assessment 2026</h3><div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}><DueDate date="Mar 5" urgent/><span style={{fontSize:12,fontWeight:600,color:ts,fontFamily:f}}>~4 hours</span></div><div style={{display:"flex",gap:3,marginBottom:14}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{flex:1,height:5,borderRadius:3,background:i<=2?navy:(dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)")}}/>))}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:ts,fontFamily:f}}>2/6</span><button onClick={()=>setSysStep(1)} style={{background:navy,color:"#fff",border:"none",padding:"10px 24px",borderRadius:20,fontWeight:700,fontSize:13,fontFamily:f,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>System Check <I.Arrow/></button></div></div><div style={{padding:"14px 26px",background:dk?"rgba(255,255,255,.02)":purple+"04",borderTop:`1px solid ${bd}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{...mPill(purple)}}>360&deg;</span><span style={{flex:1,fontSize:13,fontWeight:600,color:tx,fontFamily:f}}>Perspective Index</span><span style={{fontSize:11,color:ts,fontFamily:f}}>1/4</span></div></div></div>
        <div style={{gridColumn:"span 2",...mCard,borderRadius:28,padding:"24px 26px"}}><h3 style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:14}}>Quick Links</h3>{quickLinks.map((q,i)=>(<div key={i} onClick={q.action} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:16,cursor:"pointer",marginBottom:6,transition:"all .15s",background:q.color+"06"}} onMouseEnter={e=>e.currentTarget.style.background=q.color+"12"} onMouseLeave={e=>e.currentTarget.style.background=q.color+"06"}><div style={{width:40,height:40,borderRadius:20,background:q.color+"15",display:"flex",alignItems:"center",justifyContent:"center",color:q.color}}><q.icon/></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{q.label}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{q.desc}</div></div></div>))}</div>
        <div style={{gridColumn:"span 2",...mCard,borderRadius:28,padding:"24px 26px"}}><h3 style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:14}}>Upcoming Events</h3>{upcomingEvents.map(ev=>(<div key={ev.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:`1px solid ${bd}`}}><div style={{width:48,textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:tm,fontFamily:f,textTransform:"uppercase"}}>{ev.date.split(" ")[0]}</div><div style={{fontSize:24,fontWeight:700,color:tx,fontFamily:f}}>{ev.date.split(" ")[1]}</div></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{ev.title}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{ev.time}</div></div><span style={{fontSize:11,fontWeight:700,color:ev.daysAway<=7?red:ts,fontFamily:f}}>{ev.daysAway}d</span></div>))}</div>
        <div style={{gridColumn:"span 2",...mCard,borderRadius:28,padding:"24px 26px"}}><h3 style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:14}}>Reports Ready</h3>{reports.map(r=>(<div key={r.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:16,marginBottom:8,background:r.color+"06"}}><div style={{width:40,height:40,borderRadius:20,background:r.color+"15",display:"flex",alignItems:"center",justifyContent:"center",color:r.color}}><r.icon/></div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:tx,fontFamily:f}}>{r.assessment}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{r.type} &middot; {r.date}</div></div><Btn small style={{padding:"5px 10px"}}><I.Dl/> PDF</Btn></div>))}</div>
        <div style={{gridColumn:"span 4",...mCard,borderRadius:28,padding:"22px 26px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}><div><h3 style={{fontSize:12,fontWeight:700,color:tm,fontFamily:f,letterSpacing:.8,textTransform:"uppercase",marginBottom:14}}>Development Plan</h3><div style={{display:"flex",gap:24,flexWrap:"wrap"}}>{[{s:"Executive Presence",p:45,c:navy},{s:"Coaching Others",p:30,c:teal},{s:"Strategic Thinking",p:20,c:purple}].map((sk,i)=>{const r=17,ci=2*Math.PI*r;return <div key={i} style={{display:"flex",alignItems:"center",gap:12}}><svg width="44" height="44" style={{transform:"rotate(-90deg)"}}><circle cx="22" cy="22" r={r} fill="none" stroke={dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"} strokeWidth="3.5"/><circle cx="22" cy="22" r={r} fill="none" stroke={sk.c} strokeWidth="3.5" strokeDasharray={ci} strokeDashoffset={ci*(1-sk.p/100)} strokeLinecap="round"/></svg><div><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{sk.s}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{sk.p}%</div></div></div>})}</div></div><button onClick={()=>setPg("idp")} style={{background:navy,color:"#fff",border:"none",padding:"10px 24px",borderRadius:20,fontWeight:700,fontSize:13,fontFamily:f,cursor:"pointer"}}>View Plan &rarr;</button></div></div>
      </div>
    </main>;
  };

  //  ORGANIC / BIOMORPHIC DASHBOARD 
  const OrganicDashboard = () => {
    const warm = "#B07D4B";
    const oCard = {background:card,border:`1px solid ${dk?"rgba(255,255,255,.06)":"rgba(176,125,75,.1)"}`,borderRadius:24,padding:"24px 26px"};
    return <main id="main" style={{maxWidth:900,margin:"0 auto",padding:"0 0 60px"}}>
      <DesignPicker/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        <div style={{gridColumn:"span 3",...oCard,padding:"40px 36px",borderRadius:32}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:24,background:teal+"10",marginBottom:16}}><div style={{width:6,height:6,borderRadius:3,background:teal}}/><span style={{fontSize:11,fontWeight:600,color:teal,fontFamily:f}}>Welcome back</span></div>
          <h1 style={{fontSize:40,fontWeight:700,color:dk?"#fff":warm,fontFamily:f,letterSpacing:-1,lineHeight:1.12,marginBottom:10}}>Good afternoon, Kshitij.</h1>
          <p style={{fontSize:16,color:ts,fontFamily:f,lineHeight:1.7}}>You have <span style={{color:teal,fontWeight:600}}>2 active programs</span> and <span style={{color:green,fontWeight:600}}>2 reports ready</span>.</p>
          {showTour&&!tour&&<div style={{display:"flex",alignItems:"center",gap:12,marginTop:20,padding:"14px 18px",borderRadius:20,background:warm+"08",border:`1px solid ${warm}15`}}><div style={{width:36,height:36,borderRadius:18,background:teal+"12",display:"flex",alignItems:"center",justifyContent:"center",color:teal}}><I.Help/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:tx,fontFamily:f}}>Take a quick tour</div></div><Btn secondary small onClick={()=>setTour(1)}>Start</Btn><button onClick={()=>setShowTour(false)} style={{background:"none",border:"none",cursor:"pointer",color:tm,padding:4}}><I.X/></button></div>}
        </div>
        <div style={{gridColumn:"span 1",...oCard,borderRadius:32,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
          <div style={{fontSize:48,fontWeight:700,color:red,fontFamily:f,lineHeight:1}}>12</div>
          <div style={{fontSize:11,fontWeight:700,color:tm,fontFamily:f,marginTop:6,textTransform:"uppercase",letterSpacing:1}}>Days Left</div>
        </div>
        {[{l:"Active",v:"2",c:teal},{l:"Pending",v:"5",c:warm},{l:"Complete",v:"3",c:green},{l:"Reports",v:"2",c:purple}].map((s,i)=>(<div key={i} style={{...oCard,textAlign:"center",borderRadius:20,background:dk?card:s.c+"06"}}><div style={{fontSize:30,fontWeight:700,color:s.c,fontFamily:f,lineHeight:1}}>{s.v}</div><div style={{fontSize:12,fontWeight:500,color:ts,fontFamily:f,marginTop:6}}>{s.l}</div></div>))}
        <div style={{gridColumn:"span 2",...oCard,borderRadius:28,overflow:"hidden",padding:0}}><div style={{padding:"24px 26px"}}><span style={{fontSize:10,fontWeight:700,color:"#fff",background:warm,padding:"4px 14px",borderRadius:16,fontFamily:f}}>Priority</span><h3 style={{fontSize:20,fontWeight:700,color:tx,fontFamily:f,margin:"12px 0 10px",cursor:"pointer"}} onClick={()=>setPg("program")}>Leadership Potential Assessment 2026</h3><div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}><DueDate date="Mar 5" urgent/><span style={{fontSize:12,fontWeight:600,color:ts,fontFamily:f}}>~4 hours</span></div><div style={{display:"flex",gap:3,marginBottom:14}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{flex:1,height:5,borderRadius:4,background:i<=2?warm:(dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)")}}/>))}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:ts,fontFamily:f}}>2/6</span><Btn primary small onClick={()=>setSysStep(1)}>System Check <I.Arrow/></Btn></div></div><div style={{padding:"14px 26px",background:dk?"rgba(255,255,255,.02)":warm+"04",borderTop:`1px solid ${dk?"rgba(255,255,255,.04)":warm+"10"}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:10,fontWeight:700,color:purple,fontFamily:f,background:purple+"10",padding:"3px 12px",borderRadius:12}}>360&deg;</span><span style={{flex:1,fontSize:13,fontWeight:600,color:tx,fontFamily:f}}>Perspective Index</span><span style={{fontSize:11,color:ts,fontFamily:f}}>1/4</span></div></div></div>
        <div style={{gridColumn:"span 2",...oCard,borderRadius:28,padding:"24px 26px"}}><h3 style={{fontSize:11,fontWeight:700,color:warm,fontFamily:f,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Quick Links</h3>{quickLinks.map((q,i)=>(<div key={i} onClick={q.action} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:20,cursor:"pointer",marginBottom:8,background:q.color+"06",border:`1px solid ${q.color}08`,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}><div style={{width:40,height:40,borderRadius:20,background:q.color+"12",display:"flex",alignItems:"center",justifyContent:"center",color:q.color}}><q.icon/></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{q.label}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{q.desc}</div></div></div>))}</div>
        <div style={{gridColumn:"span 2",...oCard,borderRadius:28,padding:"24px 26px"}}><h3 style={{fontSize:11,fontWeight:700,color:warm,fontFamily:f,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Upcoming Events</h3>{upcomingEvents.map(ev=>(<div key={ev.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:`1px solid ${dk?"rgba(255,255,255,.04)":warm+"10"}`}}><div style={{width:48,textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:tm,fontFamily:f,textTransform:"uppercase"}}>{ev.date.split(" ")[0]}</div><div style={{fontSize:24,fontWeight:700,color:tx,fontFamily:f}}>{ev.date.split(" ")[1]}</div></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{ev.title}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{ev.time}</div></div><span style={{fontSize:11,fontWeight:700,color:ev.daysAway<=7?red:ts,fontFamily:f}}>{ev.daysAway}d</span></div>))}</div>
        <div style={{gridColumn:"span 2",...oCard,borderRadius:28,padding:"24px 26px"}}><h3 style={{fontSize:11,fontWeight:700,color:warm,fontFamily:f,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Reports Ready</h3>{reports.map(r=>(<div key={r.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:20,marginBottom:8,background:r.color+"06"}}><div style={{width:40,height:40,borderRadius:20,background:r.color+"12",display:"flex",alignItems:"center",justifyContent:"center",color:r.color}}><r.icon/></div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:tx,fontFamily:f}}>{r.assessment}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{r.type} &middot; {r.date}</div></div><Btn small style={{padding:"5px 10px"}}><I.Dl/> PDF</Btn></div>))}</div>
        <div style={{gridColumn:"span 4",...oCard,borderRadius:28,padding:"22px 26px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}><div><h3 style={{fontSize:11,fontWeight:700,color:warm,fontFamily:f,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Development Plan</h3><div style={{display:"flex",gap:24,flexWrap:"wrap"}}>{[{s:"Executive Presence",p:45,c:warm},{s:"Coaching Others",p:30,c:teal},{s:"Strategic Thinking",p:20,c:purple}].map((sk,i)=>{const r=17,ci=2*Math.PI*r;return <div key={i} style={{display:"flex",alignItems:"center",gap:12}}><svg width="44" height="44" style={{transform:"rotate(-90deg)"}}><circle cx="22" cy="22" r={r} fill="none" stroke={dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"} strokeWidth="3.5"/><circle cx="22" cy="22" r={r} fill="none" stroke={sk.c} strokeWidth="3.5" strokeDasharray={ci} strokeDashoffset={ci*(1-sk.p/100)} strokeLinecap="round"/></svg><div><div style={{fontSize:14,fontWeight:600,color:tx,fontFamily:f}}>{sk.s}</div><div style={{fontSize:12,color:ts,fontFamily:f}}>{sk.p}%</div></div></div>})}</div></div><Btn small onClick={()=>setPg("idp")}>View Plan &rarr;</Btn></div></div>
      </div>
    </main>;
  };

  //  Dashboard Router 
  const Dashboard = () => {
    if(designMode==="scrolly") return <ScrollyDashboard/>;
    if(designMode==="editorial") return <EditorialDashboard/>;
    if(designMode==="neu") return <NeuDashboard/>;
    if(designMode==="clay") return <ClayDashboard/>;
    if(designMode==="aurora") return <AuroraDashboard/>;
    if(designMode==="darkprem") return <DarkPremDashboard/>;
    if(designMode==="brutal") return <BrutalDashboard/>;
    if(designMode==="notion") return <NotionDashboard/>;
    if(designMode==="material") return <MaterialDashboard/>;
    if(designMode==="organic") return <OrganicDashboard/>;
    return <GridDashboard/>;
  };

  //  Live Chat Widget 
  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatMsgs(p => [...p, {from:"user",text:chatMsg,time:"Just now"}]);
    setChatMsg("");
    setTimeout(() => {
      setChatMsgs(p => [...p, {from:"bot",text:"Thanks for reaching out! A support agent will be with you shortly.",time:"Just now"}]);
    }, 1200);
  };

  const ChatWidget = () => (
    <>
      {chatOpen && (
        <div role="dialog" aria-label="Live chat support" style={{position:"fixed",bottom:90,right:24,width:340,maxHeight:480,background:dk?"#1a2638":card,borderRadius:20,boxShadow:`0 16px 60px ${dk?"rgba(0,0,0,.4)":"rgba(0,44,119,.15)"}`,border:`1px solid ${bd}`,display:"flex",flexDirection:"column",zIndex:9998,overflow:"hidden",animation:"tfade .25s ease both"}}>
          <div style={{padding:"16px 20px",background:`linear-gradient(135deg,${navy},${teal})`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <div style={{width:36,height:36,borderRadius:12,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:"#fff",fontFamily:f}}>Lighthouse Support</div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:3,background:"#4ade80"}}/>
              <span style={{fontSize:11,color:"rgba(255,255,255,.8)",fontFamily:f}}>Online</span></div>
            </div>
            <button onClick={()=>setChatOpen(false)} aria-label="Close chat" style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff"}}><I.X/></button>
          </div>
          <div style={{flex:1,padding:"16px",overflowY:"auto",display:"flex",flexDirection:"column",gap:10,minHeight:200,maxHeight:300,background:dk?"#0f1724":bg}}>
            {chatMsgs.map((m,i) => (
              <div key={i} style={{display:"flex",justifyContent:m.from==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:m.from==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
                  background:m.from==="user"?`linear-gradient(135deg,${navy},${teal})`:(dk?"rgba(255,255,255,.06)":card),
                  border:m.from==="bot"?`1px solid ${bd}`:"none",
                  color:m.from==="user"?"#fff":tx,fontSize:13,fontFamily:f,lineHeight:1.5}}>
                  {m.text}
                  <div style={{fontSize:10,marginTop:4,opacity:.6,textAlign:"right"}}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:"12px 16px",borderTop:`1px solid ${bd}`,display:"flex",gap:8,flexShrink:0,background:dk?"#1a2638":card}}>
            <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&sendChat()}
              placeholder="Type a message..."
              aria-label="Chat message input"
              style={{flex:1,padding:"10px 14px",borderRadius:12,border:`1px solid ${bd}`,background:dk?"rgba(255,255,255,.04)":"rgba(0,44,119,.03)",color:tx,fontSize:13,fontFamily:f,outline:"none"}}/>
            <button onClick={sendChat} aria-label="Send message" style={{width:38,height:38,borderRadius:12,border:"none",background:navy,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 2px 8px ${navy}20`}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
      <button onClick={()=>setChatOpen(!chatOpen)} aria-label={chatOpen?"Close live chat":"Open live chat"}
        style={{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:16,border:"none",
          background:`linear-gradient(135deg,${navy},${teal})`,color:"#fff",cursor:"pointer",
          boxShadow:`0 6px 24px ${navy}30`,display:"flex",alignItems:"center",justifyContent:"center",zIndex:9997,transition:"transform .2s"}}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
        {chatOpen?<I.X/>:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
      </button>
    </>
  );

  const renderMain = () => {
    if (pg==="dev") return <DevView/>;
    if (pg==="sched") return <ScheduleView/>;
    if (sysStep > 0) return <SysCheckView/>;
    if (selCenter) return <AssessmentCenter/>;
    if (selProgram) return <ProgramDetail/>;
    return <Dashboard/>;
  };

  return (
    <div style={{fontFamily:f,background:isGlass?(dk?`radial-gradient(ellipse at 20% 0%,rgba(0,44,119,.3) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(123,97,255,.18) 0%,transparent 45%),radial-gradient(ellipse at 50% 100%,rgba(0,180,160,.12) 0%,transparent 50%),${bg}`:`radial-gradient(ellipse at 20% 0%,rgba(0,44,119,.06) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(123,97,255,.04) 0%,transparent 45%),radial-gradient(ellipse at 50% 100%,rgba(0,180,160,.03) 0%,transparent 50%),${bg}`):bg,minHeight:"100vh",display:"flex",color:tx}} lang={selLang.toLowerCase()}>
      <style>{css}</style>
      <a href="#main" className="skip-link">Skip to main content</a>
      <TourOverlay/>
      <ChatWidget/>
      {mob&&<div onClick={()=>setMob(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.25)",zIndex:999}} aria-hidden="true"/>}
      <Sidebar/>
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Top bar */}
        <header style={{height:52,display:"flex",alignItems:"center",padding:"0 22px",gap:10,flexShrink:0,
          borderBottom:isBrutal?`2px solid ${dk?"#fff":"#000"}`:isNeu?"none":`1px solid ${bd}`,
          ...(isGlass||isAurora?{background:dk?"rgba(10,13,26,.6)":"rgba(255,255,255,.5)",...glassBlur}:{}),
          ...(isNeu?{...neuSh,margin:"8px 8px 0",borderRadius:14}:{}),
          ...(isBrutal?{background:"transparent"}:{}),
          ...(isDarkPrem?{borderBottomColor:dk?"rgba(201,168,76,.12)":"rgba(0,0,0,.06)"}:{}),
        }}>
          <button className="t-m" onClick={()=>{setMob(true);setSbOpen(true)}} aria-label="Open menu" style={{cursor:"pointer",color:ts,display:"none",background:"none",border:"none",padding:4}}><I.Menu/></button>
          <div style={{flex:1}}/>
          <button onClick={()=>setTour(1)} aria-label="Start guided tour" style={{padding:8,minWidth:36,minHeight:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:isDarkPrem?(dk?"#C9A84C":"#8B7230"):tm,borderRadius:isBrutal?0:isMaterial?20:6,background:"none",border:isBrutal?`1px solid ${dk?"#fff":"#000"}`:"none"}}><I.Help/></button>
          <div style={{position:"relative"}}>
            <button onClick={e=>{e.stopPropagation();setNotif(!notif)}} aria-label="Notifications" aria-expanded={notif}
              style={{padding:8,minWidth:36,minHeight:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:isDarkPrem?"#C9A84C":ts,position:"relative",borderRadius:isBrutal?0:isMaterial?20:6,background:"none",border:isBrutal?`1px solid ${dk?"#fff":"#000"}`:"none"}}>
              <I.Bell/><div style={{position:"absolute",top:0,right:0,width:6,height:6,borderRadius:isBrutal?0:3,background:isDarkPrem?"#C9A84C":teal}} aria-hidden="true"/></button>
            {notif&&<div className="td" role="menu" onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"calc(100% + 6px)",right:0,width:300,background:card,
              border:isBrutal?`2px solid ${dk?"#fff":"#000"}`:`1px solid ${bd}`,
              borderRadius:isBrutal?0:isMaterial?20:isNeu?16:isNotion?8:isClay?18:isOrganic?18:14,
              boxShadow:isBrutal?"none":isNeu?(dk?"6px 6px 14px rgba(0,0,0,.35),-6px -6px 14px rgba(255,255,255,.04)":"6px 6px 14px rgba(163,177,198,.5),-6px -6px 14px rgba(255,255,255,.8)"):`0 12px 40px ${dk?"rgba(0,0,0,.3)":"rgba(0,0,0,.06)"}`,
              ...(isGlass||isAurora?glassBlur:{}),overflow:"hidden",zIndex:100}}>
              <div style={{padding:"12px 16px",borderBottom:isBrutal?`2px solid ${dk?"#fff":"#000"}`:`1px solid ${bd}`,fontSize:13,fontWeight:700,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f,color:isDarkPrem?(dk?"#C9A84C":"#8B7230"):dk?"#fff":navy,...(isBrutal?{textTransform:"uppercase",letterSpacing:1}:{})}}>Notifications</div>
              {[{t:"Assessment closes in 2 days",d:red},{t:"Feedback request from Alex",d:teal}].map((n,i)=>(<div key={i} role="menuitem" tabIndex={0} style={{padding:"10px 16px",borderBottom:isBrutal?`2px solid ${dk?"#fff":"#000"}`:`1px solid ${bd}`,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:14,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f}} onMouseEnter={e=>e.currentTarget.style.background=bg2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{width:6,height:6,borderRadius:isBrutal?0:3,background:n.d}} aria-hidden="true"/>{n.t}</div>))}
            </div>}
          </div>
          <div style={{position:"relative"}}>
            <button onClick={e=>{e.stopPropagation();setProf(!prof)}} aria-label="Profile menu" aria-expanded={prof}
              style={{width:32,height:32,
                borderRadius:isBrutal?0:isMaterial?16:isNeu?12:isOrganic?16:10,
                background:isBrutal?(dk?"#fff":"#000"):isDarkPrem?`linear-gradient(135deg,#1a1a1a,#C9A84C)`:isOrganic?`linear-gradient(135deg,#B07D4B,${teal})`:`linear-gradient(135deg,${navy},${teal})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                color:isBrutal?(dk?"#000":"#fff"):"#fff",fontWeight:800,fontSize:11,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f,cursor:"pointer",border:"none",
                boxShadow:isNeu?(dk?"4px 4px 8px rgba(0,0,0,.3),-4px -4px 8px rgba(255,255,255,.03)":"4px 4px 8px rgba(163,177,198,.4),-4px -4px 8px rgba(255,255,255,.7)"):"none"}}>KL</button>
            {prof&&<div className="td" role="menu" onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"calc(100% + 6px)",right:0,width:200,background:card,
              border:isBrutal?`2px solid ${dk?"#fff":"#000"}`:`1px solid ${bd}`,
              borderRadius:isBrutal?0:isMaterial?20:isNeu?16:isNotion?8:isClay?18:isOrganic?18:14,
              boxShadow:isBrutal?"none":isNeu?(dk?"6px 6px 14px rgba(0,0,0,.35),-6px -6px 14px rgba(255,255,255,.04)":"6px 6px 14px rgba(163,177,198,.5),-6px -6px 14px rgba(255,255,255,.8)"):`0 12px 40px ${dk?"rgba(0,0,0,.3)":"rgba(0,0,0,.06)"}`,
              ...(isGlass||isAurora?glassBlur:{}),overflow:"hidden",zIndex:100}}>
              <div style={{padding:"12px 16px",borderBottom:isBrutal?`2px solid ${dk?"#fff":"#000"}`:`1px solid ${bd}`}}><div style={{fontSize:14,fontWeight:700,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f,color:isDarkPrem?(dk?"#C9A84C":"#8B7230"):dk?"#fff":navy,...(isBrutal?{textTransform:"uppercase",letterSpacing:1}:{})}}>Kshitij Lau</div><div style={{fontSize:12,color:ts,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f}}>Product Management</div></div>
              {["Profile","Settings"].map(l=>(<div key={l} role="menuitem" tabIndex={0} style={{padding:"9px 16px",cursor:"pointer",fontSize:13,color:ts,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f,...(isBrutal?{textTransform:"uppercase",letterSpacing:.5}:{})}} onMouseEnter={e=>e.currentTarget.style.background=bg2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{l}</div>))}
              <div style={{borderTop:isBrutal?`2px solid ${dk?"#fff":"#000"}`:`1px solid ${bd}`}}><div role="menuitem" tabIndex={0} style={{padding:"9px 16px",cursor:"pointer",fontSize:13,color:red,fontFamily:isBrutal?"'DM Mono','Courier New',monospace":f,display:"flex",alignItems:"center",gap:5,...(isBrutal?{textTransform:"uppercase",letterSpacing:.5}:{})}}><I.Out/> Sign out</div></div>
            </div>}
          </div>
        </header>
        <div ref={mainRef} style={{flex:1,padding:"0 24px",overflow:"auto"}}>{renderMain()}</div>
      </div>
    </div>
  );
}
