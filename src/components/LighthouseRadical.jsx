import { useState, useEffect, useRef, useCallback } from "react";

// LIGHTHOUSE — RADICAL DESIGN EXPLORATION
// Inspired by Make.com: No sidebar, icon dock, hero typography, stats cards
// Dashboard + Program pages only — incremental exploration

const App = () => {
  const [dk, setDk] = useState(false);
  const [pg, setPg] = useState("dash"); // dash | program | dev | assess
  const [selProgram, setSelProgram] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [hovDock, setHovDock] = useState(null);
  const [notif, setNotif] = useState(false);
  const [dockHidden, setDockHidden] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#002C77");
  const [accentColor, setAccentColor] = useState("#008575");
  const [showTheme, setShowTheme] = useState(false);
  // Assessment flow state
  const [assessStep, setAssessStep] = useState("journey"); // journey|syscheck|ready|question|complete
  const [sysChecks, setSysChecks] = useState({internet:null,device:null,camera:null,mic:null}); // null=pending, "checking", "pass", "fail"
  const [sysCheckIdx, setSysCheckIdx] = useState(-1); // -1=not started, 0-3=checking
  const [curQuestion, setCurQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [answers, setAnswers] = useState({}); // {0:true,1:true,...} recorded
  const [assessTimer, setAssessTimer] = useState(35*60); // 35 min total
  const [assessTimerActive, setAssessTimerActive] = useState(false);
  const [prepCountdown, setPrepCountdown] = useState(0);
  // IDP state
  const [idpStep, setIdpStep] = useState(0); // 0=intro,1=skillgap,2=chat,3=summary,4=loading,5=plan
  const [chatStep, setChatStep] = useState(0);
  const [chatAnswers, setChatAnswers] = useState({});
  const [planSkills, setPlanSkills] = useState(null);
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [expandedTip, setExpandedTip] = useState({});
  const [loadPct, setLoadPct] = useState(0);
  // Plan management
  const [planStatus, setPlanStatus] = useState("draft"); // draft|under-review|approved
  const [planEditing, setPlanEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [planExpandAll, setPlanExpandAll] = useState(false);
  const [tipProgress, setTipProgress] = useState({});
  const [planModal, setPlanModal] = useState(null); // null|"submit"|"library"
  const [planModalSkill, setPlanModalSkill] = useState(null);
  const [idpSettingsOpen, setIdpSettingsOpen] = useState(false);
  const [planComments, setPlanComments] = useState({
    "skill-0":[{from:"manager",name:"Sarah Chen",text:"Great focus area. I'd prioritize the cross-functional initiative — there's an opportunity with the Q3 product launch.",ts:"Feb 18"},{from:"user",name:"Kshitij",text:"That makes sense. I'll align this with the product launch timeline.",ts:"Feb 19"}],
    "t1":[{from:"manager",name:"Sarah Chen",text:"Suggest partnering with Ops team on the data migration project.",ts:"Feb 18"},{from:"user",name:"Kshitij",text:"Good call — I've already been talking to Priya about this.",ts:"Feb 19"}],
    "skill-1":[{from:"manager",name:"Sarah Chen",text:"This is your biggest growth lever. Let's discuss delegation candidates.",ts:"Feb 18"}],
    "t7":[{from:"manager",name:"Sarah Chen",text:"I've been doing a decision journal for 2 years — happy to share my template.",ts:"Feb 20"},{from:"user",name:"Kshitij",text:"Yes please! That would save me setup time.",ts:"Feb 21"}],
  });
  const [commentDraft, setCommentDraft] = useState({});
  const mainRef = useRef(null);

  useEffect(() => {
    const h = () => { setNotif(false); setShowTheme(false); };
    window.addEventListener("click", h); return () => window.removeEventListener("click", h);
  }, []);

  // ═══════ ASSESSMENT TIMER EFFECTS ═══════
  useEffect(() => {
    if (!assessTimerActive || assessTimer <= 0) return;
    const t = setInterval(() => setAssessTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [assessTimerActive, assessTimer]);

  useEffect(() => {
    if (!isRecording) return;
    const t = setInterval(() => setRecordTime(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [isRecording]);

  useEffect(() => {
    if (prepCountdown <= 0) return;
    const t = setTimeout(() => setPrepCountdown(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [prepCountdown]);

  const videoQuestions = [
    {id:0,title:"Introduction",prompt:"Please introduce yourself — your name, current role, and what excites you about leadership.",prepTime:30,maxRecord:120,
      context:"This warm-up question helps assessors understand your background and communication style. There are no wrong answers.",
      tips:["Keep it concise — 60-90 seconds is ideal","Mention your role and one key achievement","Show enthusiasm for leadership"],
      keyPoints:["Name & current position","What drives you as a leader","Brief career context"],
      competency:"Communication",difficulty:"Warm-up"},
    {id:1,title:"Critical Situation",prompt:"Describe a time you had to make a difficult decision with incomplete information. What was the outcome?",prepTime:30,maxRecord:180,
      context:"We're assessing your ability to operate under uncertainty, weigh trade-offs, and take ownership of outcomes.",
      tips:["Use the STAR method (Situation, Task, Action, Result)","Be specific about what information was missing","Explain your reasoning process, not just the outcome"],
      keyPoints:["The situation and constraints","Your decision-making process","The outcome and what you learned"],
      competency:"Decision Making",difficulty:"Medium"},
    {id:2,title:"Team Conflict",prompt:"Tell us about a situation where you had to resolve a disagreement between team members. How did you approach it?",prepTime:30,maxRecord:180,
      context:"This evaluates your interpersonal skills, empathy, and ability to navigate difficult team dynamics.",
      tips:["Show you listened to both sides","Describe the resolution framework you used","Highlight the team outcome, not just your role"],
      keyPoints:["Nature of the conflict","Your mediation approach","Resolution and team impact"],
      competency:"Team Development",difficulty:"Medium"},
    {id:3,title:"Strategic Thinking",prompt:"Walk us through how you would evaluate a new market opportunity for a product you manage.",prepTime:30,maxRecord:180,
      context:"We want to see structured, analytical thinking — how you break down ambiguity into a clear evaluation framework.",
      tips:["Start with your framework (market size, competition, fit)","Discuss data sources you'd consult","Balance quantitative and qualitative analysis"],
      keyPoints:["Evaluation framework","Key metrics and data sources","Go/no-go decision criteria"],
      competency:"Strategic Thinking",difficulty:"Hard"},
    {id:4,title:"Self-Reflection",prompt:"What is one leadership skill you are actively working to improve, and what steps are you taking?",prepTime:30,maxRecord:120,
      context:"Self-awareness and growth mindset are key leadership indicators. Be honest and specific about your development journey.",
      tips:["Be genuine — don't disguise a strength as a weakness","Describe concrete actions, not just intentions","Connect it to your broader career goals"],
      keyPoints:["The skill you're developing","Specific actions you're taking","Expected impact on your leadership"],
      competency:"Self-Awareness",difficulty:"Medium"},
  ];

  const fmtTime = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  const startSysCheck = () => {
    setSysCheckIdx(0);
    const checks = ["internet","device","camera","mic"];
    checks.forEach((c,i) => {
      setTimeout(() => { setSysChecks(p => ({...p,[c]:"checking"})); setSysCheckIdx(i); }, i * 2000);
      setTimeout(() => { setSysChecks(p => ({...p,[c]:"pass"})); }, i * 2000 + 1500);
    });
    setTimeout(() => setSysCheckIdx(4), 8000); // all done
  };

  const startAssessment = () => {
    setAssessStep("question");
    setCurQuestion(0);
    setAnswers({});
    setAssessTimer(35*60);
    setAssessTimerActive(true);
    setPrepCountdown(videoQuestions[0].prepTime);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordTime(0);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setAnswers(p => ({...p, [curQuestion]: true}));
  };

  const nextQuestion = () => {
    if (curQuestion < videoQuestions.length - 1) {
      const next = curQuestion + 1;
      setCurQuestion(next);
      setIsRecording(false);
      setRecordTime(0);
      setPrepCountdown(videoQuestions[next].prepTime);
    } else {
      setAssessStep("complete");
      setAssessTimerActive(false);
    }
  };

  const openAssessment = () => {
    setPg("assess");
    setAssessStep("journey");
    setSysChecks({internet:null,device:null,camera:null,mic:null});
    setSysCheckIdx(-1);
    setCurQuestion(0);
    setIsRecording(false);
    setRecordTime(0);
    setAnswers({});
    setPrepCountdown(0);
  };
  // ═══════ COLORS (dynamic) ═══════
  const navy = primaryColor, teal = accentColor, purple = "#7B61FF", orange = "#F59E0B", red = "#EF4444", green = "#10B981";
  const colorPresets = [
    {label:"Lighthouse",n:"#002C77",t:"#008575"},{label:"Ocean",n:"#0F4C81",t:"#00B4D8"},
    {label:"Midnight",n:"#1B1464",t:"#6C63FF"},{label:"Forest",n:"#1B4332",t:"#52B788"},
    {label:"Crimson",n:"#8B0000",t:"#D4A017"},{label:"Slate",n:"#334155",t:"#F59E0B"},
    {label:"Plum",n:"#581C87",t:"#E879F9"},{label:"Espresso",n:"#3E2723",t:"#A1887F"},
    {label:"Teal",n:"#004D40",t:"#00BFA5"},{label:"Rose",n:"#880E4F",t:"#F06292"},
    {label:"Charcoal",n:"#212121",t:"#FF6D00"},{label:"Nordic",n:"#1A237E",t:"#80DEEA"},
  ];
  const bg = dk ? "#0c1220" : "#fafbfc";
  const cardBg = dk ? "#141e30" : "#FFFFFF";
  const cardBg2 = dk ? "#111a2b" : "#F4F5F7";
  const tx = dk ? "#F1F5F9" : "#1E293B";
  const ts = dk ? "#94A3B8" : "#64748B";
  const tm = dk ? "#475569" : "#94A3B8";
  const bd = dk ? "rgba(255,255,255,.07)" : `${navy}0D`;
  const accentBg = dk ? teal+"18" : teal+"08";
  const navyBg = dk ? `${navy}22` : `${navy}0D`;
  const tealBg = dk ? `${teal}24` : `${teal}14`;
  const r = 16, sr = 10;

  // ═══════ FONTS ═══════
  const fh = "'Outfit', sans-serif";
  const fb = "'DM Sans', sans-serif";

  // ═══════ DATA ═══════
  const programs = [
    {
      id:"leadership", name:"Leadership Assessment 2026", status:"progress", pct:35, due:"Mar 15, 2026", daysLeft:18,
      accent:teal, desc:"Comprehensive leadership evaluation combining simulations, psychometrics, and multi-rater feedback.",
      centers:[
        {id:"c1",name:"Business Simulation",color:teal,status:"locked",exercises:3,duration:"2.5 hrs",location:"Online Proctored",
          grad:`linear-gradient(135deg,${accentColor}30,${primaryColor}40)`,emoji:"📊"},
        {id:"c2",name:"Leadership Advisory Council",color:purple,status:"progress",exercises:4,duration:"3 hrs",location:"Dubai Office",
          grad:`linear-gradient(135deg,#7B61FF30,${primaryColor}40)`,emoji:"👥"},
        {id:"c3",name:"Calibration Discussion",color:orange,status:"locked",exercises:2,duration:"1.5 hrs",location:"Online",
          grad:`linear-gradient(135deg,#F59E0B30,${primaryColor}40)`,emoji:"⚖️"},
      ],
      seqExercises:[
        {id:"e1",name:"Hogan Personality Inventory",type:"Psychometric",status:"done",duration:"25 min",
          grad:`linear-gradient(135deg,#7B61FF20,${accentColor}30)`,emoji:"🧠"},
        {id:"e2",name:"Watson-Glaser Critical Thinking",type:"Cognitive",status:"progress",duration:"35 min",
          grad:`linear-gradient(135deg,${accentColor}25,${primaryColor}35)`,emoji:"💡"},
        {id:"e3",name:"Situational Judgment Test",type:"SJT",status:"locked",duration:"30 min",
          grad:`linear-gradient(135deg,#F59E0B20,#7B61FF25)`,emoji:"🎯"},
      ],
      openExercises:[
        {id:"e4",name:"Self-Assessment Questionnaire",type:"Survey",status:"done",duration:"15 min",
          grad:`linear-gradient(135deg,#10B98120,${accentColor}25)`,emoji:"📋"},
        {id:"e5",name:"Work Style Preferences",type:"Psychometric",status:"locked",duration:"20 min",
          grad:`linear-gradient(135deg,${primaryColor}20,#7B61FF25)`,emoji:"⚙️"},
      ],
      reports:[
        {id:"r1",name:"Personality Profile",status:"ready",color:teal},
        {id:"r2",name:"Cognitive Assessment",status:"processing",color:purple},
        {id:"r3",name:"Simulation Debrief",status:"locked",color:orange},
      ],
      stats:{assigned:12,inProgress:3,completed:4,reports:1}
    },
    {
      id:"360", name:"360° Perspective Feedback", status:"progress", pct:20, due:"Apr 1, 2026", daysLeft:35,
      accent:purple, desc:"Multi-rater feedback from peers, managers, and direct reports.",
      centers:[], seqExercises:[], openExercises:[
        {id:"e6",name:"Self-Rating Form",type:"360°",status:"done",duration:"20 min",
          grad:`linear-gradient(135deg,#7B61FF20,${accentColor}25)`,emoji:"📝"},
        {id:"e7",name:"Nominate Raters",type:"Admin",status:"progress",duration:"10 min",
          grad:`linear-gradient(135deg,${accentColor}20,#7B61FF25)`,emoji:"👤"},
      ],
      reports:[{id:"r4",name:"360° Feedback Summary",status:"locked",color:purple}],
      stats:{assigned:5,inProgress:1,completed:1,reports:0}
    }
  ];

  const curProg = programs.find(p=>p.id===selProgram);
  const openProgram = (id) => { setSelProgram(id); setPg("program"); setActiveTab("overview"); };

  const weekData = [
    {day:"Mon",mins:45,target:60},{day:"Tue",mins:30,target:60},{day:"Wed",mins:75,target:60},
    {day:"Thu",mins:20,target:60},{day:"Fri",mins:60,target:60},{day:"Sat",mins:0,target:0},{day:"Sun",mins:15,target:0}
  ];

  // ═══════ IDP DATA ═══════
  const competencies = [
    {label:"Strategic Thinking",score:85,color:navy,type:"behavioral"},
    {label:"Influence & Communication",score:72,color:teal,type:"behavioral"},
    {label:"Team Development",score:68,color:purple,type:"behavioral"},
    {label:"Resilience",score:91,color:green,type:"behavioral"},
    {label:"Decision Making",score:76,color:navy,type:"behavioral"},
    {label:"Data & Analytics",score:64,color:teal,type:"technical"},
    {label:"Product & Platform Fluency",score:70,color:purple,type:"technical"},
  ];

  const chatQs = [
    {q:"What do you enjoy most about your current role?",opts:["Strategic planning","Leading my team","Solving complex problems","Cross-functional work","Building relationships"]},
    {q:"What aspects do you find most challenging?",opts:["Organizational politics","Conflicting priorities","Difficult conversations","Data-heavy reporting","Keeping up with change"]},
    {q:"Are you looking to grow or transition?",opts:["Deepen current expertise","Senior leadership role","Different function","Broader cross-functional scope","Help me decide"]},
    {q:"What's your ideal timeline?",opts:["3 months sprint","6 months steady","12 months comprehensive","Flexible pace"]},
  ];

  const generatePlan = () => [
    {name:"Influence & Communication",type:"behavioral",desc:"Strengthen persuasion and stakeholder alignment across organizational levels.",
      tips:[
        {id:"t1",pct:"70",title:"Lead a Cross-Functional Initiative",desc:"Volunteer to lead a project spanning 2+ departments, building coalitions without direct authority.",cat:"experience",timeline:"Mar–Jun 2026",
          insight:"Aligns with your preference for cross-functional work. The Q3 product launch is a prime opportunity.",success:"Successfully lead initiative with measurable cross-team alignment metrics.",provider:"Internal",duration:"3 months"},
        {id:"t2",pct:"20",title:"Executive Mentoring Program",desc:"Shadow a senior leader's key meetings and debrief on influence strategies.",cat:"social",timeline:"Mar–Aug 2026",
          insight:"Social learning accelerates influence skills. Your manager can connect you with VP-level sponsors.",success:"Complete 6 shadow sessions with documented influence insights.",provider:"Internal L&D",duration:"6 months"},
        {id:"t3",pct:"10",title:"Stakeholder Influence Masterclass",desc:"Build structured persuasion techniques. Coursera, 4 hrs.",cat:"course",timeline:"Apr 2026",
          insight:"Structured frameworks complement your analytical approach to stakeholder management.",success:"Course completion + apply 2 techniques in real meetings.",provider:"Coursera",duration:"4 hrs"},
    ]},
    {name:"Team Development",type:"behavioral",desc:"Build coaching, delegating, and team growth capability.",
      tips:[
        {id:"t4",pct:"70",title:"Delegate a High-Visibility Deliverable",desc:"Fully delegate a key deliverable to a direct report. Coach but don't take back.",cat:"experience",timeline:"Mar–May 2026",
          insight:"Deliberate delegation builds the team while freeing your capacity for strategic work.",success:"Deliverable completed by delegate with minimal intervention.",provider:"Self-directed",duration:"3 months"},
        {id:"t5",pct:"20",title:"Coaching Skills for Leaders",desc:"Internal L&D coaching program — active listening, powerful questions, development conversations.",cat:"course",timeline:"Apr–Jul 2026",
          insight:"Your chat preferences indicated a desire to grow coaching skills. This program is highly rated internally.",success:"Complete program + conduct 3 documented coaching conversations.",provider:"Internal L&D",duration:"12 hrs"},
        {id:"t6",pct:"10",title:"Radical Candor — Kim Scott",desc:"Framework for caring personally while challenging directly.",cat:"reading",timeline:"Apr–May 2026",
          insight:"Practical framework that pairs well with your direct communication style.",success:"Finish book + implement care/challenge matrix with team.",provider:"Book",duration:"6 hrs"},
    ]},
    {name:"Decision Making",type:"behavioral",desc:"Improve speed and quality of decisions under ambiguity.",
      tips:[
        {id:"t7",pct:"70",title:"Decision Journal Practice",desc:"Document key decisions weekly: context, options, reasoning, outcomes. Review monthly.",cat:"experience",timeline:"Mar–Aug 2026",
          insight:"Reflective practice closes the feedback loop on decision quality over time.",success:"20+ decisions documented with monthly retrospectives.",provider:"Self-directed",duration:"Ongoing"},
        {id:"t8",pct:"20",title:"Peer Decision Review Circle",desc:"Form a group of 3–4 peers to present real decisions monthly.",cat:"social",timeline:"Apr–Aug 2026",
          insight:"Peer diverse perspectives reduce blind spots in decision-making.",success:"Participate in 5+ review sessions with actionable takeaways.",provider:"Peer group",duration:"5 months"},
        {id:"t9",pct:"10",title:"Data-Driven Decision Making",desc:"HBS Online — quantitative + qualitative judgment frameworks. 6 hrs.",cat:"course",timeline:"May–Jun 2026",
          insight:"Matches your analytical strengths and preference for structured online learning.",success:"Course completion + apply framework to 2 real decisions.",provider:"HBS Online",duration:"6 hrs"},
    ]},
    {name:"Data & Analytics",type:"technical",desc:"Build proficiency in data visualization, dashboards, and analytics-driven product decisions.",
      tips:[
        {id:"t10",pct:"70",title:"Build a Live Product Dashboard",desc:"Design and ship a real-time dashboard tracking key product metrics (adoption, engagement, NPS).",cat:"experience",timeline:"Mar–Jun 2026",
          insight:"Hands-on dashboard building is the fastest path to analytics fluency for your PM role.",success:"Dashboard live in production with 3+ key metrics tracked.",provider:"Self-directed",duration:"3 months"},
        {id:"t11",pct:"20",title:"Analytics Community of Practice",desc:"Join a cross-team CoP to share techniques and review dashboards with data engineers.",cat:"social",timeline:"Apr–Aug 2026",
          insight:"CoP participation builds relationships with data teams critical for your GTM role.",success:"Attend 6+ sessions and present 1 dashboard review.",provider:"Internal",duration:"5 months"},
        {id:"t12",pct:"10",title:"Google Analytics & Looker Certification",desc:"Structured certification covering data collection, reporting, and dashboards.",cat:"course",timeline:"Apr–May 2026",
          insight:"Certification provides structured foundations for your dashboard building work.",success:"Pass certification exam.",provider:"Google",duration:"20 hrs"},
    ]},
    {name:"Product & Platform Architecture",type:"technical",desc:"Deepen platform architecture and API design understanding to bridge PM-engineering communication.",
      tips:[
        {id:"t13",pct:"70",title:"Co-Design a Technical Spec",desc:"Partner with a senior engineer to co-author a design doc. Attend architecture reviews.",cat:"experience",timeline:"Mar–May 2026",
          insight:"Co-designing specs builds the shared language needed for your GTM & AI Solutions PM role.",success:"Co-authored spec approved by architecture review board.",provider:"Internal",duration:"2 months"},
        {id:"t14",pct:"20",title:"Engineering Pair Sessions",desc:"Bi-weekly sessions with engineers — code reviews, deployments, debugging workflows.",cat:"social",timeline:"Apr–Jul 2026",
          insight:"Pairing sessions build technical empathy critical for platform PM effectiveness.",success:"Complete 8 pair sessions across 2+ engineering teams.",provider:"Internal",duration:"4 months"},
        {id:"t15",pct:"10",title:"System Design for Product Managers",desc:"Educative.io — APIs, microservices, databases, scalability patterns. 10 hrs.",cat:"course",timeline:"May–Jun 2026",
          insight:"Fills the architecture knowledge gap identified in your assessment.",success:"Complete course + apply patterns in next technical spec.",provider:"Educative.io",duration:"10 hrs"},
    ]},
  ];

  const startGeneration = () => {
    setIdpStep(4); setLoadPct(0);
    [12,28,45,62,78,90,100].forEach((p,i)=>setTimeout(()=>setLoadPct(p),(i+1)*700));
    setTimeout(()=>{setPlanSkills(generatePlan());setIdpStep(5);},5600);
  };

  const addComment = (key,text) => {
    if(!text||!text.trim())return;
    setPlanComments(p=>({...p,[key]:[...(p[key]||[]),{from:"user",name:"Kshitij",text:text.trim(),ts:"Feb 25"}]}));
    setCommentDraft(p=>({...p,[key]:""}));
  };
  const getCommentCount = (key) => (planComments[key]||[]).length;
  const removeTipFromSkill = (si,tipId) => {
    setPlanSkills(prev=>prev.map((s,i)=>i===si?{...s,tips:s.tips.filter(t=>t.id!==tipId)}:s));
  };
  const addTipToSkill = (si,tip) => {
    setPlanSkills(prev=>prev.map((s,i)=>i===si?{...s,tips:[...s.tips,tip]}:s));
    setPlanModal(null);
  };
  const toggleExpandAll = () => {
    if(planExpandAll){setExpandedSkill(null);setPlanExpandAll(false);}
    else{setExpandedSkill("all");setPlanExpandAll(true);}
  };
  const isSkillExpanded = (si) => expandedSkill==="all"||expandedSkill===si;

  const skillLibrary = {
    "Leadership":[
      {id:"l1",type:"70",title:"Lead a Strategic Initiative",desc:"Own a cross-functional project end-to-end.",category:"experience",timeline:"3 months"},
      {id:"l2",type:"20",title:"Executive Shadowing Program",desc:"Shadow C-suite leaders in key meetings.",category:"social",timeline:"Ongoing"},
      {id:"l3",type:"10",title:"Leadership Essentials Certificate",desc:"Foundational leadership program.",category:"course",timeline:"12 hrs"},
    ],
    "Communication":[
      {id:"l4",type:"70",title:"Present to Executive Committee",desc:"Prepare and deliver a board-level presentation.",category:"experience",timeline:"1 month"},
      {id:"l5",type:"20",title:"Toastmasters Leadership Track",desc:"Weekly practice with structured feedback.",category:"social",timeline:"6 months"},
    ],
    "Technical":[
      {id:"l6",type:"70",title:"Build a Data Pipeline",desc:"Design and ship an end-to-end analytics pipeline.",category:"experience",timeline:"2 months"},
      {id:"l7",type:"10",title:"AWS Solutions Architect",desc:"Cloud architecture certification.",category:"course",timeline:"40 hrs"},
    ],
  };

  // ═══════ ICONS ═══════
  const I = {
    Home:(p)=><svg {...p} width={p?.s||18} height={p?.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    Chart:(p)=><svg {...p} width={p?.s||18} height={p?.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    Users:(p)=><svg {...p} width={p?.s||18} height={p?.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    Cal:(p)=><svg {...p} width={p?.s||18} height={p?.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Bell:(p)=><svg {...p} width={p?.s||18} height={p?.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    Settings:(p)=><svg {...p} width={p?.s||18} height={p?.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    Arrow:(p)=><svg {...p} width={p?.s||16} height={p?.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    Check:(p)=><svg {...p} width={p?.s||16} height={p?.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
    Lock:(p)=><svg {...p} width={p?.s||14} height={p?.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    Play:(p)=><svg {...p} width={p?.s||18} height={p?.s||18} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    Book:(p)=><svg {...p} width={p?.s||18} height={p?.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    Ext:(p)=><svg {...p} width={p?.s||12} height={p?.s||12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
    Back:(p)=><svg {...p} width={p?.s||16} height={p?.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    Globe:(p)=><svg {...p} width={p?.s||16} height={p?.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    Target:(p)=><svg {...p} width={p?.s||18} height={p?.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    Clock:(p)=><svg {...p} width={p?.s||16} height={p?.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    File:(p)=><svg {...p} width={p?.s||16} height={p?.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    FileText:(p)=><svg {...p} width={p?.s||16} height={p?.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    Sun:(p)=><svg {...p} width={p?.s||16} height={p?.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    Moon:(p)=><svg {...p} width={p?.s||16} height={p?.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
    Rocket:(p)=><svg {...p} width={p?.s||16} height={p?.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
    Zap:(p)=><svg {...p} width={p?.s||16} height={p?.s||16} viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  };

  // ═══════ RING ═══════
  const Ring = ({pct, size=48, stroke=4, color=teal}) => {
    const rad = (size-stroke)/2, circ = 2*Math.PI*rad;
    return (
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={rad} fill="none" stroke={bd} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={rad} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ-(pct/100)*circ} strokeLinecap="round" style={{transition:"stroke-dashoffset .6s"}}/>
      </svg>
    );
  };

  // ═══════ COUNTDOWN ═══════
  const useCountdown = (dueDate) => {
    const [cd, setCd] = useState({d:0,h:0,m:0,s:0});
    useEffect(() => {
      const deadline = new Date(dueDate+" 23:59:59");
      const tick = () => { const diff=Math.max(0,deadline-new Date()); setCd({d:Math.floor(diff/864e5),h:Math.floor(diff%864e5/36e5),m:Math.floor(diff%36e5/6e4),s:Math.floor(diff%6e4/1e3)}); };
      tick(); const iv=setInterval(tick,1000); return ()=>clearInterval(iv);
    }, [dueDate]);
    return cd;
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:${bg};color:${tx};font-family:${fb}}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${dk?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"};border-radius:3px}
    .fi{animation:fi .4s ease}@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    .ch{transition:all .2s ease}.ch:hover{transform:translateY(-2px);box-shadow:0 12px 40px ${dk?"rgba(0,0,0,.3)":"rgba(0,0,0,.08)"} !important}
    @media(max-width:768px){.hm{display:none !important}.dk{width:0 !important;overflow:hidden}}
  `;

  const dockItems = [
    {id:"home",icon:I.Home,label:"Home",action:()=>{setPg("dash");setSelProgram(null);}},
    {id:"cal",icon:I.Cal,label:"Schedule"},{id:"chart",icon:I.Chart,label:"Insights"},
    {id:"book",icon:I.Book,label:"Development",action:()=>{setPg("dev");setSelProgram(null);}},{id:"globe",icon:I.Globe,label:"Resources"},
  ];

  // ═══════ DASHBOARD ═══════
  const Dashboard = () => {
    const tA = programs.reduce((a,p)=>a+p.stats.assigned,0);
    const tC = programs.reduce((a,p)=>a+p.stats.completed,0);
    const tR = programs.reduce((a,p)=>a+p.stats.reports,0);
    const allReports = programs.flatMap(p=>p.reports);

    return (
      <div className="fi" style={{padding:"40px 48px 60px",maxWidth:1280,margin:"0 auto"}}>
        {/* HERO */}
        <div style={{marginBottom:40}}>
          <h1 style={{fontSize:52,fontWeight:800,fontFamily:fh,color:tx,lineHeight:1.1,letterSpacing:-2,marginBottom:12}}>
            Good afternoon,<br/>Kshitij.
          </h1>
          <p style={{fontSize:18,color:ts,fontFamily:fb,maxWidth:500,lineHeight:1.6}}>Track your leadership assessment journey, view results, and build your development plan.</p>
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:6,marginBottom:32,flexWrap:"wrap"}}>
          {["Overview","Programs","Schedule","Reports"].map(t=>(
            <button key={t} style={{padding:"10px 22px",borderRadius:r,fontSize:14,fontWeight:t==="Overview"?700:500,fontFamily:fb,cursor:"pointer",border:"none",background:t==="Overview"?navy:"transparent",color:t==="Overview"?"#fff":ts,transition:"all .15s"}}
              onMouseEnter={e=>{if(t!=="Overview")e.currentTarget.style.background=cardBg2;}} onMouseLeave={e=>{if(t!=="Overview")e.currentTarget.style.background="transparent";}}>{t}</button>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:32,alignItems:"start"}}>
          <div>
            {/* STATS */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:28}}>
              {/* Assessments */}
              <div className="ch" style={{background:cardBg,borderRadius:r,padding:"22px 24px",border:`1px solid ${bd}`,boxShadow:`0 1px 3px ${dk?"rgba(0,0,0,.2)":"rgba(0,0,0,.04)"}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:32,height:32,borderRadius:8,background:accentBg,display:"flex",alignItems:"center",justifyContent:"center",color:teal}}><I.File/></div>
                    <span style={{fontSize:13,fontWeight:600,color:ts,fontFamily:fb}}>Assessments</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:11,fontWeight:700,color:teal,fontFamily:fb}}>{Math.round(tC/tA*100)}%</span>
                    <Ring pct={Math.round(tC/tA*100)} size={28} stroke={3}/>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                  <span style={{fontSize:40,fontWeight:800,color:tx,fontFamily:fh,lineHeight:1}}>{tC}</span>
                  <span style={{fontSize:16,color:tm,fontFamily:fb}}>/ {tA}</span>
                </div>
                <div style={{display:"flex",gap:4,marginTop:12}}>
                  {Array.from({length:tA}).map((_,i)=><div key={i} style={{flex:1,height:6,borderRadius:3,background:i<tC?teal:teal+"18"}}/>)}
                </div>
              </div>

              {/* Reports */}
              <div className="ch" style={{background:tealBg,borderRadius:r,padding:"22px 24px",border:`1px solid ${dk?teal+"25":teal+"30"}`,boxShadow:`0 1px 3px ${dk?"rgba(0,0,0,.2)":"rgba(0,0,0,.04)"}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                  <div style={{width:32,height:32,borderRadius:8,background:teal+"25",display:"flex",alignItems:"center",justifyContent:"center",color:dk?teal:teal}}><I.Chart/></div>
                  <span style={{fontSize:13,fontWeight:600,color:dk?teal:teal,fontFamily:fb}}>Reports Ready</span>
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                  <span style={{fontSize:40,fontWeight:800,color:dk?"#fff":navy,fontFamily:fh,lineHeight:1}}>{tR}</span>
                  <span style={{fontSize:16,color:dk?teal+"80":teal,fontFamily:fb}}>/ {allReports.length}</span>
                </div>
                <div style={{display:"flex",gap:4,marginTop:12}}>
                  {allReports.map((rp,i)=><div key={i} style={{flex:1,height:6,borderRadius:3,background:rp.status==="ready"?teal:teal+"25"}}/>)}
                </div>
              </div>

              {/* Deadline */}
              <div className="ch" style={{background:cardBg,borderRadius:r,padding:"22px 24px",border:`1px solid ${bd}`,boxShadow:`0 1px 3px ${dk?"rgba(0,0,0,.2)":"rgba(0,0,0,.04)"}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                  <div style={{width:32,height:32,borderRadius:8,background:red+"10",display:"flex",alignItems:"center",justifyContent:"center",color:red}}><I.Clock/></div>
                  <span style={{fontSize:13,fontWeight:600,color:ts,fontFamily:fb}}>Next Deadline</span>
                </div>
                <div style={{fontSize:28,fontWeight:800,color:tx,fontFamily:fh,lineHeight:1,marginBottom:4}}>{programs[0].daysLeft} days</div>
                <div style={{fontSize:13,color:ts,fontFamily:fb}}>{programs[0].name}</div>
                <div style={{fontSize:11,color:red,fontWeight:600,fontFamily:fb,marginTop:8}}>Due {programs[0].due}</div>
              </div>
            </div>

            {/* CHART */}
            <div style={{background:cardBg,borderRadius:r,padding:"24px 28px",border:`1px solid ${bd}`,marginBottom:28,boxShadow:`0 1px 3px ${dk?"rgba(0,0,0,.2)":"rgba(0,0,0,.04)"}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <I.Chart style={{color:ts}}/>
                  <h3 style={{fontSize:18,fontWeight:700,color:tx,fontFamily:fh}}>Weekly Activity</h3>
                </div>
                <div style={{display:"flex",gap:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:5,background:navy}}/><span style={{fontSize:12,color:ts,fontFamily:fb}}>Time Spent</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:5,background:teal}}/><span style={{fontSize:12,color:ts,fontFamily:fb}}>Target</span></div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"flex-end",gap:12,height:160}}>
                {weekData.map((d,i)=>{
                  const mx=80,h1=(d.mins/mx)*140,h2=(d.target/mx)*140;
                  return (
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                      <div style={{display:"flex",gap:3,alignItems:"flex-end",height:140}}>
                        <div style={{width:16,height:Math.max(4,h1),borderRadius:8,background:dk?"#fff":navy,transition:"height .4s",position:"relative"}}>
                          {d.mins>0&&<div style={{position:"absolute",top:-2,left:"50%",transform:"translate(-50%,-100%)",width:6,height:6,borderRadius:3,background:dk?"#fff":navy}}/>}
                        </div>
                        <div style={{width:16,height:Math.max(4,h2),borderRadius:8,background:teal,transition:"height .4s",position:"relative"}}>
                          {d.target>0&&<div style={{position:"absolute",top:-2,left:"50%",transform:"translate(-50%,-100%)",width:6,height:6,borderRadius:3,background:teal}}/>}
                        </div>
                      </div>
                      <span style={{fontSize:11,color:i===4?teal:tm,fontWeight:i===4?700:400,fontFamily:fb}}>{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PROGRAMS */}
            <h3 style={{fontSize:18,fontWeight:700,color:tx,fontFamily:fh,marginBottom:16}}>Your Programs</h3>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {programs.map(prog=>(
                <div key={prog.id} className="ch" onClick={()=>openProgram(prog.id)}
                  style={{background:cardBg,borderRadius:r,padding:"24px 28px",border:`1px solid ${bd}`,cursor:"pointer",boxShadow:`0 1px 3px ${dk?"rgba(0,0,0,.2)":"rgba(0,0,0,.04)"}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
                    <div style={{width:48,height:48,borderRadius:12,background:prog.accent+"12",display:"flex",alignItems:"center",justifyContent:"center",color:prog.accent,flexShrink:0}}>
                      {prog.id==="leadership"?<I.Chart s={22}/>:<I.Users s={22}/>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <h4 style={{fontSize:17,fontWeight:700,color:tx,fontFamily:fh}}>{prog.name}</h4>
                        <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:6,background:orange+"12",color:orange,fontFamily:fb}}>In Progress</span>
                      </div>
                      <p style={{fontSize:14,color:ts,fontFamily:fb,lineHeight:1.5,marginBottom:14}}>{prog.desc}</p>
                      <div style={{display:"flex",alignItems:"center",gap:16}}>
                        <div style={{flex:1,height:6,borderRadius:3,background:prog.accent+"12",overflow:"hidden"}}><div style={{width:prog.pct+"%",height:"100%",borderRadius:3,background:prog.accent}}/></div>
                        <span style={{fontSize:13,fontWeight:700,color:prog.accent,fontFamily:fb}}>{prog.pct}%</span>
                        <span style={{fontSize:12,color:ts,fontFamily:fb}}>{prog.daysLeft}d left</span>
                        <I.Arrow style={{color:tm}}/>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:navy,borderRadius:r,padding:"28px 24px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"relative",zIndex:1}}>
                <h3 style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:fh,lineHeight:1.2,marginBottom:8}}>Ready for Your Next Assessment?</h3>
                <p style={{fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:fb,lineHeight:1.5,marginBottom:16}}>Continue where you left off and complete your leadership profile.</p>
                <button onClick={()=>openProgram("leadership")} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 20px",borderRadius:sr,background:teal,color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:fb}}>Continue <I.Arrow style={{color:"#fff"}} s={14}/></button>
              </div>
              <div style={{position:"absolute",top:-20,right:-20,width:120,height:120,borderRadius:60,background:teal+"15"}}/>
              <div style={{position:"absolute",bottom:-30,right:40,width:80,height:80,borderRadius:40,background:purple+"10"}}/>
            </div>
            {[{icon:I.Book,label:"Learning Hub",desc:"Explore courses and resources",color:teal},{icon:I.Users,label:"Coaching",desc:"Book a session with your coach",color:purple},{icon:I.Globe,label:"Help Center",desc:"FAQs and support articles",color:orange},{icon:I.Chart,label:"Benchmarks",desc:"See how you compare to peers",color:navy}].map((lk,i)=>(
              <div key={i} className="ch" style={{background:cardBg,borderRadius:r,padding:"16px 20px",border:`1px solid ${bd}`,cursor:"pointer",display:"flex",alignItems:"center",gap:14,boxShadow:`0 1px 3px ${dk?"rgba(0,0,0,.2)":"rgba(0,0,0,.04)"}`}}>
                <div style={{width:40,height:40,borderRadius:10,background:lk.color+"08",display:"flex",alignItems:"center",justifyContent:"center",color:lk.color,flexShrink:0}}><lk.icon s={18}/></div>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:fb}}>{lk.label}</div><div style={{fontSize:12,color:ts,fontFamily:fb}}>{lk.desc}</div></div>
                <I.Ext style={{color:tm}}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ═══════ PROGRAM PAGE ═══════
  const ProgramPage = () => {
    const p = curProg;
    if (!p) return null;
    const cd = useCountdown(p.due);
    const allTasks = [...p.centers,...p.seqExercises,...p.openExercises];
    const done = allTasks.filter(t=>t.status==="done").length;
    const inProg = allTasks.filter(t=>t.status==="progress").length;

    return (
      <div className="fi" style={{padding:"40px 48px 60px",maxWidth:1280,margin:"0 auto"}}>
        <button onClick={()=>{setPg("dash");setSelProgram(null);}} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:ts,fontSize:13,fontFamily:fb,fontWeight:500,marginBottom:16,padding:0}}><I.Back s={14}/> Back to Dashboard</button>

        {/* HERO BANNER */}
        <div style={{background:navy,borderRadius:r+4,padding:"32px 36px",position:"relative",overflow:"hidden",marginBottom:32}}>
          <div style={{position:"relative",zIndex:1}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span style={{fontSize:11,fontWeight:700,color:teal,background:teal+"20",padding:"3px 10px",borderRadius:6,fontFamily:fb,letterSpacing:.3,textTransform:"uppercase"}}>In Progress</span>
                  <span style={{fontSize:12,color:"rgba(255,255,255,.5)",fontFamily:fb}}>Due {p.due}</span>
                </div>
                <h1 style={{fontSize:36,fontWeight:800,fontFamily:fh,color:"#fff",letterSpacing:-1,lineHeight:1.1,marginBottom:10}}>{p.name}</h1>
                <p style={{fontSize:15,color:"rgba(255,255,255,.55)",fontFamily:fb,lineHeight:1.5,maxWidth:500}}>{p.desc}</p>
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                {[{v:cd.d,l:"Days"},{v:cd.h,l:"Hrs"},{v:cd.m,l:"Min"},{v:cd.s,l:"Sec"}].map((u,i)=>(
                  <div key={i} style={{width:54,textAlign:"center",padding:"10px 0",background:"rgba(255,255,255,.06)",borderRadius:sr,border:"1px solid rgba(255,255,255,.08)"}}>
                    <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:fh,lineHeight:1}}>{String(u.v).padStart(2,"0")}</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,.4)",fontFamily:fb,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",marginTop:3}}>{u.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:24,marginTop:24}}>
              {[{label:"Assigned",value:allTasks.length,color:"#fff"},{label:"In Progress",value:inProg,color:orange},{label:"Completed",value:done,color:green},{label:"Reports",value:p.reports.filter(x=>x.status==="ready").length,color:teal}].map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:24,fontWeight:800,color:m.color,fontFamily:fh,lineHeight:1}}>{m.value}</span>
                  <span style={{fontSize:11,color:"rgba(255,255,255,.4)",fontFamily:fb,fontWeight:600}}>{m.label}</span>
                </div>
              ))}
              <div style={{flex:1}}/>
              <div style={{display:"flex",alignItems:"center",gap:10,width:200}}>
                <div style={{flex:1,height:6,borderRadius:3,background:"rgba(255,255,255,.1)",overflow:"hidden"}}><div style={{width:p.pct+"%",height:"100%",borderRadius:3,background:teal}}/></div>
                <span style={{fontSize:14,fontWeight:700,color:teal,fontFamily:fb}}>{p.pct}%</span>
              </div>
            </div>
          </div>
          <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:90,background:teal+"08"}}/>
          <div style={{position:"absolute",bottom:-50,right:80,width:120,height:120,borderRadius:60,background:purple+"06"}}/>
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:6,marginBottom:28}}>
          {[{id:"overview",label:"Overview"},{id:"schedule",label:"Schedule"},{id:"insights",label:"Reports"},{id:"development",label:"Development"}].map(t=>(
            <button key={t.id} onClick={()=>{if(t.id==="development"){setPg("dev");}else setActiveTab(t.id);}} style={{padding:"10px 22px",borderRadius:r,fontSize:14,fontWeight:activeTab===t.id?700:500,fontFamily:fb,cursor:"pointer",border:"none",background:activeTab===t.id?navy:"transparent",color:activeTab===t.id?"#fff":ts,transition:"all .15s"}}
              onMouseEnter={e=>{if(activeTab!==t.id)e.currentTarget.style.background=cardBg2;}} onMouseLeave={e=>{if(activeTab!==t.id)e.currentTarget.style.background="transparent";}}>{t.label}</button>
          ))}
        </div>

        {activeTab==="overview" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:32,alignItems:"start"}}>
            <div>
              {/* CENTERS */}
              {p.centers.length>0&&<div style={{marginBottom:28}}>
                <h3 style={{fontSize:16,fontWeight:700,color:tx,fontFamily:fh,marginBottom:14}}>Assessment Centers</h3>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {p.centers.map(c=>(
                    <div key={c.id} className="ch" style={{background:cardBg,borderRadius:r,border:`1px solid ${bd}`,cursor:"pointer",overflow:"hidden",boxShadow:`0 1px 3px ${dk?"rgba(0,0,0,.2)":"rgba(0,0,0,.04)"}`}}>
                      {/* Gradient banner */}
                      <div style={{height:80,background:c.grad,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontSize:36,opacity:.5}}>{c.emoji}</span>
                        {/* Decorative circles */}
                        <div style={{position:"absolute",top:-20,right:-10,width:70,height:70,borderRadius:35,background:c.color+"10"}}/>
                        <div style={{position:"absolute",bottom:-15,left:20,width:50,height:50,borderRadius:25,background:c.color+"08"}}/>
                        <span style={{position:"absolute",top:10,right:10,fontSize:10,fontWeight:700,fontFamily:fb,padding:"3px 10px",borderRadius:6,background:c.status==="locked"?"rgba(0,0,0,.35)":c.status==="progress"?orange:green,color:"#fff",backdropFilter:"blur(4px)",textTransform:"capitalize"}}>{c.status==="locked"?"Locked":c.status==="progress"?"Active":"Done"}</span>
                      </div>
                      <div style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:14}}>
                        <div style={{width:40,height:40,borderRadius:12,background:c.color+"10",display:"flex",alignItems:"center",justifyContent:"center",color:c.color,flexShrink:0}}>{c.status==="locked"?<I.Lock s={16}/>:<I.Target s={16}/>}</div>
                        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:tx,fontFamily:fb}}>{c.name}</div><div style={{fontSize:12,color:ts,fontFamily:fb,marginTop:2}}>{c.exercises} exercises · {c.duration} · {c.location}</div></div>
                        <I.Arrow style={{color:tm}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>}

              {/* SEQ EXERCISES */}
              {p.seqExercises.length>0&&<div style={{marginBottom:28}}>
                <h3 style={{fontSize:16,fontWeight:700,color:tx,fontFamily:fh,marginBottom:14}}>Sequential Exercises</h3>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {p.seqExercises.map((ex,i)=>{
                    const isLast = i===p.seqExercises.length-1;
                    return (
                      <div key={ex.id} style={{display:"flex",gap:14,alignItems:"stretch"}}>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:32}}>
                          <div style={{width:32,height:32,borderRadius:16,background:ex.status==="done"?green:ex.status==="progress"?orange:tm+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:ex.status==="done"?"#fff":ex.status==="progress"?"#fff":tm}}>
                            {ex.status==="done"?<I.Check s={14}/>:<span style={{fontSize:12,fontWeight:700,fontFamily:fb}}>{i+1}</span>}
                          </div>
                          {!isLast&&<div style={{flex:1,width:2,background:ex.status==="done"?green:tm+"15",marginTop:4,borderRadius:1}}/>}
                        </div>
                        <div className="ch" style={{flex:1,background:cardBg,borderRadius:r,border:`1px solid ${bd}`,marginBottom:4,cursor:"pointer",overflow:"hidden",boxShadow:`0 1px 3px ${dk?"rgba(0,0,0,.2)":"rgba(0,0,0,.04)"}`}}
                          onClick={()=>{if(ex.id==="e2")openAssessment();}}>
                          {/* Gradient banner */}
                          <div style={{height:64,background:ex.grad,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <span style={{fontSize:28,opacity:.45}}>{ex.emoji}</span>
                            <div style={{position:"absolute",top:-12,right:10,width:40,height:40,borderRadius:20,background:"rgba(255,255,255,.06)"}}/>
                            <div style={{position:"absolute",bottom:-8,left:16,width:30,height:30,borderRadius:15,background:"rgba(255,255,255,.04)"}}/>
                            {ex.status==="done"&&<div style={{position:"absolute",top:8,right:8,background:green,borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:700,color:"#fff",fontFamily:fb}}>✓ Done</div>}
                            {ex.status==="locked"&&<div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.3)",borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:700,color:"#fff",fontFamily:fb}}>🔒 Locked</div>}
                          </div>
                          <div style={{padding:"12px 20px"}}>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                              <div><div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:fb}}>{ex.name}</div><div style={{fontSize:12,color:ts,fontFamily:fb,marginTop:2}}>{ex.type} · {ex.duration}</div></div>
                              {ex.status==="progress"&&<button style={{padding:"6px 16px",borderRadius:sr,background:teal,color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:fb,display:"flex",alignItems:"center",gap:4}}>Resume <I.Arrow s={12}/></button>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>}

              {/* OPEN EXERCISES */}
              {p.openExercises.length>0&&<div style={{marginBottom:28}}>
                <h3 style={{fontSize:16,fontWeight:700,color:tx,fontFamily:fh,marginBottom:14}}>Open Exercises</h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {p.openExercises.map(ex=>(
                    <div key={ex.id} className="ch" style={{background:cardBg,borderRadius:r,border:`1px solid ${bd}`,cursor:"pointer",overflow:"hidden",boxShadow:`0 1px 3px ${dk?"rgba(0,0,0,.2)":"rgba(0,0,0,.04)"}`}}>
                      {/* Gradient banner */}
                      <div style={{height:72,background:ex.grad,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontSize:28,opacity:.45}}>{ex.emoji}</span>
                        <div style={{position:"absolute",top:-10,right:8,width:36,height:36,borderRadius:18,background:"rgba(255,255,255,.06)"}}/>
                        <div style={{position:"absolute",bottom:-6,left:12,width:28,height:28,borderRadius:14,background:"rgba(255,255,255,.04)"}}/>
                        <span style={{position:"absolute",top:8,right:8,fontSize:9,fontWeight:700,fontFamily:fb,padding:"2px 8px",borderRadius:5,background:ex.status==="done"?green:ex.status==="locked"?"rgba(0,0,0,.3)":orange,color:"#fff"}}>{ex.status==="done"?"Done":ex.status==="locked"?"Locked":"Active"}</span>
                      </div>
                      <div style={{padding:"12px 16px"}}>
                        <div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:fb}}>{ex.name}</div>
                        <div style={{fontSize:12,color:ts,fontFamily:fb,marginTop:3}}>{ex.type} · {ex.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>}
            </div>

            {/* RIGHT */}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:cardBg,borderRadius:r,padding:"20px 24px",border:`1px solid ${bd}`,boxShadow:`0 1px 3px ${dk?"rgba(0,0,0,.2)":"rgba(0,0,0,.04)"}`}}>
                <h4 style={{fontSize:14,fontWeight:700,color:tx,fontFamily:fh,marginBottom:14}}>Reports</h4>
                {p.reports.map(rep=>(
                  <div key={rep.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${bd}`}}>
                    <div style={{width:8,height:8,borderRadius:4,background:rep.status==="ready"?green:rep.status==="processing"?orange:tm}}/>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:tx,fontFamily:fb}}>{rep.name}</div><div style={{fontSize:11,color:ts,fontFamily:fb,textTransform:"capitalize"}}>{rep.status}</div></div>
                    {rep.status==="ready"&&<button style={{fontSize:11,fontWeight:600,color:teal,background:"none",border:`1px solid ${teal}30`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontFamily:fb}}>View</button>}
                  </div>
                ))}
              </div>
              <div style={{background:cardBg,borderRadius:r,padding:"20px 24px",border:`1px solid ${bd}`,boxShadow:`0 1px 3px ${dk?"rgba(0,0,0,.2)":"rgba(0,0,0,.04)"}`}}>
                <h4 style={{fontSize:14,fontWeight:700,color:tx,fontFamily:fh,marginBottom:14}}>Program Details</h4>
                {[{l:"Assessment Type",v:"Leadership"},{l:"Total Exercises",v:allTasks.length+" tasks"},{l:"Est. Duration",v:"~8 hours"},{l:"Proctoring",v:"Partial"}].map((d,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<3?`1px solid ${bd}`:"none"}}><span style={{fontSize:12,color:ts,fontFamily:fb}}>{d.l}</span><span style={{fontSize:12,fontWeight:600,color:tx,fontFamily:fb}}>{d.v}</span></div>
                ))}
              </div>
              <div style={{background:tealBg,borderRadius:r,padding:"20px 24px",border:`1px solid ${dk?teal+"25":teal+"30"}`}}>
                <h4 style={{fontSize:14,fontWeight:700,color:dk?"#fff":navy,fontFamily:fh,marginBottom:12}}>Quick Actions</h4>
                {[{label:"Book Assessment Slot",icon:I.Cal},{label:"View Instructions",icon:I.Book},{label:"Contact Support",icon:I.Globe}].map((a,i)=>(
                  <button key={i} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 12px",borderRadius:sr,background:dk?"rgba(255,255,255,.06)":"rgba(255,255,255,.7)",border:"none",cursor:"pointer",marginBottom:6,fontFamily:fb,fontSize:13,fontWeight:600,color:dk?"#fff":navy,textAlign:"left"}}
                    onMouseEnter={e=>e.currentTarget.style.background=dk?"rgba(255,255,255,.1)":"rgba(255,255,255,.9)"} onMouseLeave={e=>e.currentTarget.style.background=dk?"rgba(255,255,255,.06)":"rgba(255,255,255,.7)"}>
                    <a.icon s={14} style={{color:dk?teal:teal}}/> {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab!=="overview"&&(
          <div style={{background:cardBg,borderRadius:r,padding:"60px 40px",border:`1px solid ${bd}`,textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:16}}>🚧</div>
            <h3 style={{fontSize:20,fontWeight:700,color:tx,fontFamily:fh,marginBottom:8}}>{activeTab.charAt(0).toUpperCase()+activeTab.slice(1)} — Coming Soon</h3>
            <p style={{fontSize:14,color:ts,fontFamily:fb}}>This section will be built incrementally as the design evolves.</p>
          </div>
        )}
      </div>
    );
  };

  // ═══════ DEVELOPMENT PAGE (RADICAL — FULL FEATURED) ═══════
  const DevPage = () => {
    const totalTips = planSkills ? planSkills.reduce((a,s)=>a+s.tips.length,0) : 0;
    const totalComments = Object.values(planComments).reduce((a,c)=>a+c.length,0);
    const catIcon = {experience:"🔨",social:"🤝",course:"📚",reading:"📖"};
    const pctColor = {"70":teal,"20":purple,"10":orange};
    const pctLabel = {"70":"Experience · 70%","20":"Social · 20%","10":"Formal · 10%"};
    const pctBg = {"70":teal+"10","20":purple+"10","10":orange+"10"};
    const statusColors = {draft:{c:orange,bg:orange+"12",bd:orange+"25",label:"Draft"},"under-review":{c:teal,bg:teal+"12",bd:teal+"25",label:"Under Review"},approved:{c:green,bg:green+"12",bd:green+"25",label:"Approved"}};
    const sc = statusColors[planStatus];

    // ── Comment Thread Component ──
    const CommentThread = ({threadKey}) => {
      const comments = planComments[threadKey]||[];
      const draft = commentDraft[threadKey]||"";
      if(!showComments) return null;
      return (
        <div style={{marginTop:10,padding:12,borderRadius:sr,background:dk?"rgba(255,255,255,.02)":`${navy}03`,border:`1px solid ${dk?"rgba(255,255,255,.04)":`${navy}06`}`}}>
          {comments.length>0&&<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
            {comments.map((c,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <div style={{width:24,height:24,borderRadius:12,background:c.from==="manager"?orange+"15":navyBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:9,fontWeight:800,fontFamily:fb,color:c.from==="manager"?orange:navy}}>{c.from==="manager"?"SC":"KL"}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                    <span style={{fontSize:11,fontWeight:700,color:tx,fontFamily:fb}}>{c.name}</span>
                    {c.from==="manager"&&<span style={{fontSize:9,fontWeight:700,color:orange,background:orange+"10",padding:"1px 6px",borderRadius:4,fontFamily:fb}}>Manager</span>}
                    <span style={{fontSize:10,color:tm,fontFamily:fb,marginLeft:"auto"}}>{c.ts}</span>
                  </div>
                  <p style={{fontSize:12,color:ts,fontFamily:fb,lineHeight:1.5,margin:0}}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>}
          <div style={{display:"flex",gap:6}}>
            <input value={draft} onChange={e=>setCommentDraft(p=>({...p,[threadKey]:e.target.value}))} placeholder="Add a reply..." onKeyDown={e=>{if(e.key==="Enter")addComment(threadKey,draft);}}
              style={{flex:1,padding:"7px 10px",borderRadius:sr,border:`1px solid ${bd}`,background:dk?"rgba(255,255,255,.04)":"#fff",color:tx,fontSize:12,fontFamily:fb,outline:"none"}}/>
            <button onClick={()=>addComment(threadKey,draft)} disabled={!draft.trim()} style={{padding:"6px 14px",borderRadius:sr,background:draft.trim()?navy:navy+"20",color:draft.trim()?"#fff":navy+"40",border:"none",cursor:draft.trim()?"pointer":"default",fontSize:11,fontWeight:700,fontFamily:fb}}>Reply</button>
          </div>
        </div>
      );
    };

    // ── Settings Gear ──
    const SettingsGear = () => (
      <div style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
        <button onClick={()=>setIdpSettingsOpen(!idpSettingsOpen)} style={{width:34,height:34,borderRadius:sr,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:idpSettingsOpen?teal:ts,background:idpSettingsOpen?teal+"10":"none",border:`1px solid ${idpSettingsOpen?teal+"40":bd}`,transition:"all .15s"}}>
          <I.Settings s={14}/>
        </button>
        {idpSettingsOpen&&<div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:cardBg,border:`1px solid ${bd}`,borderRadius:r,padding:12,width:200,zIndex:100,boxShadow:`0 8px 24px ${dk?"rgba(0,0,0,.4)":"rgba(0,0,0,.1)"}`}}>
          <div style={{fontSize:10,fontWeight:800,color:tm,fontFamily:fb,letterSpacing:1,marginBottom:8}}>SETTINGS</div>
          <button onClick={()=>setDk(!dk)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:sr,border:"none",background:dk?"rgba(255,255,255,.06)":"transparent",cursor:"pointer",color:tx,fontSize:12,fontWeight:600,fontFamily:fb,textAlign:"left"}}>
            {dk?"☀️ Light Mode":"🌙 Dark Mode"}
          </button>
          <button style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:sr,border:"none",background:"transparent",cursor:"pointer",color:tx,fontSize:12,fontWeight:600,fontFamily:fb,textAlign:"left"}}>🌐 Language: English</button>
          <div style={{borderTop:`1px solid ${bd}`,margin:"6px 0",paddingTop:6}}>
            <div style={{fontSize:10,fontWeight:800,color:tm,fontFamily:fb,letterSpacing:1,marginBottom:6}}>COLOR THEME</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {[{n:"Lighthouse",p:"#002C77",a:"#008575"},{n:"Ocean",p:"#0077B6",a:"#00B4D8"},{n:"Forest",p:"#2D6A4F",a:"#52B788"},{n:"Plum",p:"#6A0572",a:"#AB83A1"},{n:"Crimson",p:"#9B2226",a:"#CA6702"},{n:"Slate",p:"#475569",a:"#0EA5E9"}].map(t=>(
                <button key={t.n} onClick={()=>{setPrimaryColor(t.p);setAccentColor(t.a);}} title={t.n} style={{width:22,height:22,borderRadius:11,background:`linear-gradient(135deg,${t.p} 50%,${t.a} 50%)`,border:primaryColor===t.p?`2px solid ${teal}`:`2px solid transparent`,cursor:"pointer",flexShrink:0}}/>
              ))}
            </div>
          </div>
        </div>}
      </div>
    );

    // ── STEP 0: CINEMATIC INTRO ──
    if (idpStep===0) return (
      <div style={{minHeight:"100%",display:"flex",flexDirection:"column"}}>
        <div style={{position:"relative",padding:"80px 60px 60px",background:`linear-gradient(160deg,${navy},${dk?"#0a1628":"#001845"})`,overflow:"hidden"}}>
          <div style={{position:"absolute",top:-120,right:-80,width:400,height:400,borderRadius:"50%",background:teal+"08",filter:"blur(60px)"}}/>
          <div style={{position:"absolute",bottom:-60,left:40,width:200,height:200,borderRadius:"50%",background:purple+"08",filter:"blur(40px)"}}/>
          <div style={{position:"relative",zIndex:1,maxWidth:640}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",borderRadius:20,padding:"4px 14px 4px 6px",marginBottom:28}}>
              <div style={{width:18,height:18,borderRadius:9,background:teal,display:"flex",alignItems:"center",justifyContent:"center"}}><I.Target style={{color:"#fff"}} s={10}/></div>
              <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.5)",fontFamily:fb,letterSpacing:.5}}>AI-POWERED</span>
            </div>
            <h1 style={{fontSize:56,fontWeight:900,fontFamily:fh,color:"#fff",letterSpacing:-2.5,lineHeight:1.02,marginBottom:16}}>Build your<br/><span style={{color:teal}}>growth plan.</span></h1>
            <p style={{fontSize:17,color:"rgba(255,255,255,.45)",fontFamily:fb,lineHeight:1.7,maxWidth:440}}>5 quick steps. Powered by your assessment data, shaped by your ambitions, built on the 70-20-10 model.</p>
          </div>
        </div>
        <div style={{padding:"40px 60px 60px",flex:1}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:0,position:"relative",maxWidth:900}}>
            <div style={{position:"absolute",top:28,left:28,right:28,height:2,background:dk?"rgba(255,255,255,.06)":navy+"0A",zIndex:0}}/>
            {[{n:"01",t:"Skill Gaps",d:"Assessment scores",ic:I.Chart},{n:"02",t:"Your Goals",d:"4 questions",ic:I.Target},{n:"03",t:"Summary",d:"Review before gen",ic:I.FileText},{n:"04",t:"AI Analysis",d:"Plan generated",ic:I.Settings},{n:"05",t:"Your Plan",d:"Review & own it",ic:I.Book}].map((s,i)=>(
              <div key={i} style={{position:"relative",zIndex:1,textAlign:"center"}}>
                <div style={{width:56,height:56,borderRadius:16,background:i===0?teal:cardBg,border:`1px solid ${i===0?teal:bd}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:i===0?`0 8px 24px ${teal}30`:"none"}}>
                  <s.ic s={20} style={{color:i===0?"#fff":ts}}/>
                </div>
                <div style={{fontSize:10,fontWeight:800,color:i===0?teal:tm,fontFamily:fb,letterSpacing:1,marginBottom:4}}>{s.n}</div>
                <div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:fh,marginBottom:2}}>{s.t}</div>
                <div style={{fontSize:11,color:ts,fontFamily:fb}}>{s.d}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:48}}>
            <button onClick={()=>setIdpStep(1)} style={{padding:"16px 40px",borderRadius:r,background:teal,color:"#fff",border:"none",cursor:"pointer",fontSize:16,fontWeight:700,fontFamily:fb,display:"inline-flex",alignItems:"center",gap:10,boxShadow:`0 6px 24px ${teal}30`}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              Start Building <I.Arrow style={{color:"#fff"}} s={16}/>
            </button>
          </div>
        </div>
      </div>
    );

    // ── STEP 1: SKILL GAP — VISUAL RADAR ──
    if (idpStep===1) return (
      <div style={{padding:"48px 60px",maxWidth:960,margin:"0 auto"}}>
        <button onClick={()=>setIdpStep(0)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:ts,fontSize:13,fontFamily:fb,fontWeight:500,marginBottom:24,padding:0}}><I.Back s={14}/> Back</button>
        <div style={{marginBottom:36}}>
          <div style={{fontSize:10,fontWeight:800,color:teal,fontFamily:fb,letterSpacing:1.5,marginBottom:8}}>STEP 01</div>
          <h2 style={{fontSize:36,fontWeight:900,fontFamily:fh,color:tx,letterSpacing:-1.2,lineHeight:1.05}}>Your Skill Landscape</h2>
          <p style={{fontSize:14,color:ts,fontFamily:fb,marginTop:8}}>Assessment results from Leadership Assessment 2026</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:32}}>
          {["behavioral","technical"].map(type=>(
            <div key={type} style={{background:cardBg,borderRadius:r,padding:"24px 28px",border:`1px solid ${bd}`}}>
              <div style={{fontSize:10,fontWeight:800,color:type==="technical"?teal:purple,fontFamily:fb,letterSpacing:1.5,textTransform:"uppercase",marginBottom:18}}>{type} Skills</div>
              {competencies.filter(c=>c.type===type).map((c,i)=>(
                <div key={i} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:13,fontWeight:600,color:tx,fontFamily:fb}}>{c.label}</span>
                    <span style={{fontSize:16,fontWeight:900,color:c.score<70?red:c.score<80?orange:green,fontFamily:fh}}>{c.score}</span>
                  </div>
                  <div style={{height:8,borderRadius:4,background:dk?"rgba(255,255,255,.06)":navy+"08",overflow:"hidden"}}>
                    <div style={{height:"100%",width:c.score+"%",borderRadius:4,background:`linear-gradient(90deg,${c.color},${c.color}cc)`,transition:"width .8s"}}/>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{background:`linear-gradient(135deg,${navy}08,${teal}08)`,border:`1px solid ${teal}15`,borderRadius:r,padding:"16px 20px",display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
          <div style={{width:36,height:36,borderRadius:10,background:teal+"12",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I.Target style={{color:teal}} s={16}/></div>
          <div><div style={{fontSize:13,fontWeight:700,color:tx,fontFamily:fb}}>AI detected {competencies.filter(c=>c.score<75).length} priority areas</div><div style={{fontSize:11,color:ts,fontFamily:fb}}>Skills below 75 will be prioritized</div></div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button onClick={()=>{setIdpStep(2);setChatStep(0);}} style={{padding:"14px 32px",borderRadius:r,background:teal,color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:fb,display:"flex",alignItems:"center",gap:8}}>Continue <I.Arrow style={{color:"#fff"}} s={14}/></button>
        </div>
      </div>
    );

    // ── STEP 2: CHAT — FLOATING CARD SEQUENCE ──
    if (idpStep===2) return (
      <div style={{padding:"48px 60px",maxWidth:640,margin:"0 auto"}}>
        <button onClick={()=>setIdpStep(1)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:ts,fontSize:13,fontFamily:fb,fontWeight:500,marginBottom:24,padding:0}}><I.Back s={14}/> Back</button>
        <div style={{marginBottom:32}}>
          <div style={{fontSize:10,fontWeight:800,color:purple,fontFamily:fb,letterSpacing:1.5,marginBottom:8}}>STEP 02</div>
          <h2 style={{fontSize:32,fontWeight:900,fontFamily:fh,color:tx,letterSpacing:-1}}>Tell us about your ambitions.</h2>
        </div>
        <div style={{display:"flex",gap:4,marginBottom:36}}>
          {chatQs.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=chatStep?teal:`${navy}10`,transition:"background .3s"}}/>)}
        </div>
        {chatStep < chatQs.length && (
          <div key={chatStep}>
            <div style={{background:cardBg,borderRadius:r+4,padding:"36px 32px",border:`1px solid ${bd}`,boxShadow:`0 12px 40px ${dk?"rgba(0,0,0,.3)":"rgba(0,44,119,.06)"}`,marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:800,color:teal,fontFamily:fb,letterSpacing:1,marginBottom:14}}>QUESTION {chatStep+1} OF {chatQs.length}</div>
              <h3 style={{fontSize:22,fontWeight:800,color:tx,fontFamily:fh,lineHeight:1.2,marginBottom:24,letterSpacing:-.3}}>{chatQs[chatStep].q}</h3>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {chatQs[chatStep].opts.map((opt,i)=>{
                  const sel = chatAnswers[chatStep]===opt;
                  return <button key={i} onClick={()=>setChatAnswers(p=>({...p,[chatStep]:opt}))}
                    style={{padding:"15px 20px",borderRadius:sr+2,border:`2px solid ${sel?teal:dk?"rgba(255,255,255,.06)":navy+"0A"}`,background:sel?(dk?teal+"15":teal+"08"):"transparent",color:sel?teal:tx,fontSize:15,fontWeight:sel?700:500,fontFamily:fb,cursor:"pointer",textAlign:"left",transition:"all .15s",position:"relative",overflow:"hidden"}}
                    onMouseEnter={e=>{if(!sel)e.currentTarget.style.borderColor=teal+"40";}} onMouseLeave={e=>{if(!sel)e.currentTarget.style.borderColor=sel?teal:dk?"rgba(255,255,255,.06)":navy+"0A";}}>
                    {sel && <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:teal,borderRadius:"0 2px 2px 0"}}/>}
                    {opt}
                  </button>;
                })}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              {chatStep>0?<button onClick={()=>setChatStep(chatStep-1)} style={{padding:"10px 20px",borderRadius:sr,border:`1px solid ${bd}`,background:"transparent",color:ts,fontSize:13,fontWeight:600,fontFamily:fb,cursor:"pointer"}}>Back</button>:<div/>}
              <button onClick={()=>{if(chatStep<chatQs.length-1)setChatStep(chatStep+1);else setIdpStep(3);}} disabled={!chatAnswers[chatStep]}
                style={{padding:"12px 28px",borderRadius:sr,background:chatAnswers[chatStep]?teal:tm,color:"#fff",border:"none",fontSize:14,fontWeight:700,fontFamily:fb,cursor:chatAnswers[chatStep]?"pointer":"default",opacity:chatAnswers[chatStep]?1:.4}}>
                {chatStep===chatQs.length-1?"Review Summary →":"Next →"}
              </button>
            </div>
          </div>
        )}
      </div>
    );

    // ── STEP 3: SUMMARY — REVIEW BEFORE GENERATION ──
    if (idpStep===3) {
      const strengths = competencies.filter(c=>c.score>=80);
      const devAreas = competencies.filter(c=>c.score<80);
      return (
        <div style={{padding:"48px 60px",maxWidth:800,margin:"0 auto"}}>
          <button onClick={()=>{setIdpStep(2);setChatStep(chatQs.length-1);}} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:ts,fontSize:13,fontFamily:fb,fontWeight:500,marginBottom:24,padding:0}}><I.Back s={14}/> Back</button>
          <div style={{marginBottom:32}}>
            <div style={{fontSize:10,fontWeight:800,color:orange,fontFamily:fb,letterSpacing:1.5,marginBottom:8}}>STEP 03</div>
            <h2 style={{fontSize:32,fontWeight:900,fontFamily:fh,color:tx,letterSpacing:-1}}>Ready to generate?</h2>
            <p style={{fontSize:14,color:ts,fontFamily:fb,marginTop:8}}>Review your inputs before we create your plan using the 70-20-10 model.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
            {/* Strengths */}
            <div style={{background:cardBg,borderRadius:r,padding:"24px",border:`1px solid ${bd}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <div style={{width:28,height:28,borderRadius:8,background:green+"12",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Check style={{color:green}} s={14}/></div>
                <span style={{fontSize:14,fontWeight:700,color:tx,fontFamily:fb}}>Strengths ({strengths.length})</span>
              </div>
              {strengths.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<strengths.length-1?`1px solid ${bd}`:"none"}}>
                  <span style={{fontSize:13,color:ts,fontFamily:fb}}>{c.label}</span>
                  <span style={{fontSize:13,fontWeight:800,color:green,fontFamily:fh}}>{c.score}</span>
                </div>
              ))}
            </div>
            {/* Dev Areas */}
            <div style={{background:cardBg,borderRadius:r,padding:"24px",border:`1px solid ${bd}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <div style={{width:28,height:28,borderRadius:8,background:orange+"12",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Target style={{color:orange}} s={14}/></div>
                <span style={{fontSize:14,fontWeight:700,color:tx,fontFamily:fb}}>Development Areas ({devAreas.length})</span>
              </div>
              {devAreas.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<devAreas.length-1?`1px solid ${bd}`:"none"}}>
                  <span style={{fontSize:13,color:ts,fontFamily:fb}}>{c.label}</span>
                  <span style={{fontSize:13,fontWeight:800,color:c.score<70?red:orange,fontFamily:fh}}>{c.score}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Your answers */}
          <div style={{background:cardBg,borderRadius:r,padding:"24px",border:`1px solid ${bd}`,marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:28,height:28,borderRadius:8,background:purple+"12",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Users style={{color:purple}} s={14}/></div>
              <span style={{fontSize:14,fontWeight:700,color:tx,fontFamily:fb}}>Your Preferences</span>
            </div>
            {chatQs.map((q,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:i<chatQs.length-1?`1px solid ${bd}`:"none"}}>
                <span style={{fontSize:11,fontWeight:700,color:tm,fontFamily:fb,minWidth:100,flexShrink:0}}>{["Enjoys","Challenges","Direction","Timeline"][i]}</span>
                <span style={{fontSize:12,color:tx,fontFamily:fb,fontWeight:600}}>{chatAnswers[i]||"—"}</span>
              </div>
            ))}
          </div>
          <div style={{background:teal+"08",border:`1px solid ${teal}15`,borderRadius:r,padding:"16px 20px",marginBottom:28}}>
            <p style={{fontSize:13,color:ts,fontFamily:fb,lineHeight:1.5,margin:0}}>We'll use the <strong style={{color:tx}}>70-20-10 learning model</strong> to create a balanced plan with on-the-job experiences (70%), social learning (20%), and formal training (10%).</p>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            <button onClick={()=>{setIdpStep(2);setChatStep(0);}} style={{padding:"12px 24px",borderRadius:sr,border:`1px solid ${bd}`,background:"transparent",color:ts,fontSize:14,fontWeight:600,fontFamily:fb,cursor:"pointer"}}>Edit Answers</button>
            <button onClick={startGeneration} style={{padding:"14px 36px",borderRadius:r,background:teal,color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:fb,display:"flex",alignItems:"center",gap:8,boxShadow:`0 6px 24px ${teal}30`}}>
              Generate My Plan <I.Arrow style={{color:"#fff"}} s={14}/>
            </button>
          </div>
        </div>
      );
    }

    // ── STEP 4: LOADING — ORBITAL ──
    if (idpStep===4) return (
      <div style={{minHeight:"100%",display:"flex",alignItems:"center",justifyContent:"center",padding:60}}>
        <div style={{textAlign:"center",maxWidth:420}}>
          <div style={{position:"relative",width:120,height:120,margin:"0 auto 36px"}}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes spin2{to{transform:rotate(-360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",border:`2px solid ${teal}15`,animation:"spin 3s linear infinite"}}/>
            <div style={{position:"absolute",inset:12,borderRadius:"50%",border:`2px dashed ${purple}20`,animation:"spin2 4s linear infinite"}}/>
            <div style={{position:"absolute",inset:24,borderRadius:"50%",border:`2px solid ${navy}20`,animation:"spin 2s linear infinite"}}/>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:36,height:36,borderRadius:10,background:teal,display:"flex",alignItems:"center",justifyContent:"center",animation:"pulse 1.5s ease infinite"}}><I.Target style={{color:"#fff"}} s={16}/></div>
          </div>
          <h2 style={{fontSize:30,fontWeight:900,fontFamily:fh,color:tx,letterSpacing:-1,marginBottom:8}}>Crafting your plan</h2>
          <p style={{fontSize:14,color:ts,fontFamily:fb,marginBottom:28}}>Analyzing {competencies.length} competencies, your goals, and best-fit development activities…</p>
          <div style={{height:4,borderRadius:2,background:dk?"rgba(255,255,255,.06)":navy+"08",overflow:"hidden",maxWidth:300,margin:"0 auto"}}>
            <div style={{height:"100%",width:loadPct+"%",borderRadius:2,background:`linear-gradient(90deg,${teal},${purple})`,transition:"width .5s"}}/>
          </div>
          <span style={{fontSize:13,fontWeight:800,color:teal,fontFamily:fb,marginTop:12,display:"block"}}>{loadPct}%</span>
        </div>
      </div>
    );

    // ── STEP 5: FULL PLAN ──
    if (idpStep===5 && planSkills) return (
      <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
        {/* ── Top toolbar ── */}
        <div style={{display:"flex",alignItems:"center",padding:"0 24px",height:50,gap:8,flexShrink:0,borderBottom:`1px solid ${bd}`,background:dk?navy+"30":navy+"05"}}>
          <button onClick={()=>{setIdpStep(0);setPlanSkills(null);setChatAnswers({});setChatStep(0);setPlanStatus("draft");setPlanEditing(false);setShowComments(false);setShowReference(false);}} style={{width:32,height:32,borderRadius:sr,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:ts,background:"none",border:`1px solid ${bd}`}}><I.Back s={14}/></button>
          <span style={{fontSize:14,fontWeight:700,color:tx,fontFamily:fh}}>Individual Development Plan</span>
          <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:5,fontFamily:fb,color:sc.c,background:sc.bg,border:`1px solid ${sc.bd}`,textTransform:"uppercase",letterSpacing:.3}}>{sc.label}</span>
          <div style={{flex:1}}/>
          {planStatus==="draft"&&<>
            <button onClick={()=>setPlanEditing(!planEditing)} style={{padding:"5px 12px",borderRadius:sr,border:`1px solid ${planEditing?teal+"40":bd}`,background:planEditing?teal+"10":"transparent",color:planEditing?teal:ts,fontSize:11,fontWeight:700,fontFamily:fb,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              {planEditing?<><I.Check s={12}/> Done</>:<><I.Settings s={12}/> Edit</>}
            </button>
            <button onClick={()=>setPlanModal("submit")} style={{padding:"5px 12px",borderRadius:sr,background:green,color:"#fff",border:"none",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:fb,display:"flex",alignItems:"center",gap:4}}><I.Arrow s={12}/> Submit</button>
          </>}
          {planStatus==="under-review"&&<span style={{fontSize:12,color:tm,fontFamily:fb}}>Awaiting manager approval</span>}
          {planStatus==="approved"&&<span style={{fontSize:12,color:green,fontWeight:700,fontFamily:fb}}>✓ Approved</span>}
          <SettingsGear/>
        </div>

        {/* Scrollable content */}
        <div style={{flex:1,overflow:"auto"}}>

          {/* ── Hero banner ── */}
          <div style={{background:`linear-gradient(160deg,${navy},${dk?"#0a1628":"#001a45"})`,padding:"28px 32px 24px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-80,right:-40,width:220,height:220,borderRadius:"50%",background:teal+"06",filter:"blur(30px)"}}/>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
                <div style={{width:48,height:48,borderRadius:14,background:teal,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:18,fontFamily:fb,flexShrink:0}}>KL</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:fh}}>Kshitij Lau</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.4)",fontFamily:fb}}>Senior Product Manager · Mercer</div>
                </div>
              </div>
              {/* Goal card */}
              <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:sr,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{width:28,height:28,borderRadius:8,background:teal+"15",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Rocket style={{color:teal}} s={13}/></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",fontFamily:fb,letterSpacing:.5}}>CAREER GOAL</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:fb}}>Senior Product Manager</span>
                    <span style={{color:teal}}>→</span>
                    <span style={{fontSize:13,fontWeight:700,color:teal,fontFamily:fb}}>GTM & AI Solutions PM</span>
                    <span style={{fontSize:10,color:"rgba(255,255,255,.3)",fontFamily:fb,background:"rgba(255,255,255,.05)",padding:"2px 8px",borderRadius:4}}>6 months</span>
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                {[{v:planSkills.length,l:"SKILLS",sub:`${planSkills.filter(s=>s.type==="behavioral").length}B · ${planSkills.filter(s=>s.type==="technical").length}T`,c:navy},
                  {v:totalTips,l:"ACTIONS",c:teal},{v:"0%",l:"COMPLETE",c:green},{v:"6 mo",l:"TIMELINE",c:purple},{v:totalComments,l:"COMMENTS",c:orange}
                ].map((m,i)=>(
                  <div key={i} style={{padding:"10px 8px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:sr,textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:900,color:"#fff",fontFamily:fh,lineHeight:1}}>{m.v}</div>
                    <div style={{fontSize:8,fontWeight:800,color:"rgba(255,255,255,.3)",fontFamily:fb,letterSpacing:1,marginTop:3}}>{m.l}</div>
                    {m.sub&&<div style={{fontSize:9,color:"rgba(255,255,255,.2)",fontFamily:fb,marginTop:1}}>{m.sub}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sticky toolbar ── */}
          <div style={{position:"sticky",top:0,zIndex:10,background:bg,borderBottom:`1px solid ${bd}`,padding:"8px 32px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <button onClick={toggleExpandAll} style={{display:"flex",alignItems:"center",gap:4,padding:"6px 12px",borderRadius:sr,border:`1px solid ${bd}`,background:planExpandAll?navyBg:"transparent",cursor:"pointer",color:planExpandAll?navy:ts,fontSize:11,fontWeight:700,fontFamily:fb}}>
                {planExpandAll?"▾ Collapse All":"▸ Expand All"}
              </button>
              <button onClick={()=>setShowComments(!showComments)} style={{display:"flex",alignItems:"center",gap:4,padding:"6px 12px",borderRadius:sr,border:`1px solid ${bd}`,background:showComments?orange+"10":"transparent",cursor:"pointer",color:showComments?orange:ts,fontSize:11,fontWeight:700,fontFamily:fb}}>
                💬 {showComments?"Hide":"Show"} Comments{totalComments>0?` (${totalComments})`:""}
              </button>
              <button onClick={()=>setShowReference(!showReference)} style={{display:"flex",alignItems:"center",gap:4,padding:"6px 12px",borderRadius:sr,border:`1px solid ${bd}`,background:showReference?navyBg:"transparent",cursor:"pointer",color:showReference?navy:ts,fontSize:11,fontWeight:700,fontFamily:fb}}>
                <I.Chart s={12}/> Assessment Basis {showReference?"▾":"▸"}
              </button>
              <div style={{flex:1}}/>
              {[{p:"70",l:"Experience",c:teal},{p:"20",l:"Social",c:purple},{p:"10",l:"Formal",c:orange}].map(x=>(
                <div key={x.p} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:7,height:7,borderRadius:4,background:x.c}}/><span style={{fontSize:10,fontWeight:700,color:ts,fontFamily:fb}}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Reference Panel ── */}
          {showReference&&(
            <div style={{borderBottom:`1px solid ${bd}`,background:dk?navy+"14":navy+"03",padding:"16px 32px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div style={{background:cardBg,border:`1px solid ${bd}`,borderRadius:r,padding:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <div style={{width:24,height:24,borderRadius:7,background:navyBg,display:"flex",alignItems:"center",justifyContent:"center"}}><I.Chart style={{color:navy}} s={12}/></div>
                    <span style={{fontSize:12,fontWeight:700,color:tx,fontFamily:fb}}>Skill Gap Report</span>
                  </div>
                  {["behavioral","technical"].map(type=>(
                    <div key={type}>
                      <div style={{fontSize:9,fontWeight:800,color:type==="technical"?teal:purple,fontFamily:fb,letterSpacing:1,margin:"8px 0 6px",textTransform:"uppercase"}}>{type}</div>
                      {competencies.filter(c=>c.type===type).map((c,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                          <div style={{width:80,fontSize:10,fontWeight:600,color:ts,fontFamily:fb,textAlign:"right",flexShrink:0}}>{c.label}</div>
                          <div style={{flex:1,height:5,background:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",borderRadius:3,overflow:"hidden"}}><div style={{width:c.score+"%",height:"100%",background:c.color,borderRadius:3}}/></div>
                          <div style={{width:22,fontSize:10,fontWeight:800,color:c.score>=80?green:c.score>=70?orange:red,fontFamily:fb,textAlign:"right"}}>{c.score}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div style={{background:cardBg,border:`1px solid ${bd}`,borderRadius:r,padding:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <div style={{width:24,height:24,borderRadius:7,background:teal+"12",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Target style={{color:teal}} s={12}/></div>
                    <span style={{fontSize:12,fontWeight:700,color:tx,fontFamily:fb}}>Chat Preferences</span>
                  </div>
                  {chatQs.map((q,i)=>(
                    <div key={i} style={{display:"flex",gap:6,marginBottom:6}}>
                      <span style={{fontSize:10,fontWeight:700,color:tm,fontFamily:fb,minWidth:60}}>{["Enjoys","Challenges","Direction","Timeline"][i]}</span>
                      <span style={{fontSize:11,color:ts,fontFamily:fb}}>{chatAnswers[i]||"—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Skill Cards ── */}
          <div style={{padding:"16px 32px 40px"}}>
            {planSkills.map((skill,si)=>{
              const isExp = isSkillExpanded(si);
              const skillCK = `skill-${si}`;
              const skillCC = getCommentCount(skillCK);
              return (
                <div key={si} style={{background:cardBg,border:`1px solid ${isExp?teal+"30":bd}`,borderRadius:r,marginBottom:12,overflow:"hidden",transition:"border-color .2s"}}>
                  {/* Skill header */}
                  <button onClick={()=>{if(planExpandAll)return;setExpandedSkill(isExp?null:si);}} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"16px 20px",cursor:"pointer",background:"none",border:"none",textAlign:"left"}}>
                    <div style={{width:42,height:42,borderRadius:12,background:isExp?teal:skill.type==="technical"?teal+"0A":navyBg,display:"flex",alignItems:"center",justifyContent:"center",color:isExp?"#fff":skill.type==="technical"?teal:navy,flexShrink:0,transition:"all .2s",boxShadow:isExp?`0 4px 12px ${teal}30`:"none"}}>
                      {skill.type==="technical"?<I.Settings s={18}/>:<I.Target s={18}/>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:16,fontWeight:800,color:tx,fontFamily:fh,letterSpacing:-.2}}>{skill.name}</span>
                        <span style={{fontSize:8,fontWeight:800,color:skill.type==="technical"?teal:purple,background:skill.type==="technical"?teal+"10":purple+"10",padding:"2px 8px",borderRadius:4,fontFamily:fb,textTransform:"uppercase",letterSpacing:.8}}>{skill.type}</span>
                        {showComments&&skillCC>0&&<span style={{fontSize:9,fontWeight:700,color:orange,fontFamily:fb,display:"flex",alignItems:"center",gap:2}}>💬 {skillCC}</span>}
                      </div>
                      <span style={{fontSize:12,color:ts,fontFamily:fb}}>{skill.tips.length} actions · {skill.tips.map(t=>t.cat).filter((v,i,a)=>a.indexOf(v)===i).join(", ")}</span>
                    </div>
                    {planEditing&&planStatus==="draft"&&(
                      <button onClick={e=>{e.stopPropagation();setPlanModalSkill(si);setPlanModal("library");}} style={{padding:"4px 10px",borderRadius:sr,border:`1px dashed ${teal}40`,background:"transparent",color:teal,fontSize:10,fontWeight:700,fontFamily:fb,cursor:"pointer",flexShrink:0}}>+ Add</button>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isExp?teal:tm} strokeWidth="2.5" style={{transform:isExp?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>

                  {/* Expanded content */}
                  {isExp && (
                    <div style={{padding:"0 20px 20px",borderTop:`1px solid ${bd}`}}>
                      <p style={{fontSize:13,color:ts,fontFamily:fb,lineHeight:1.6,padding:"12px 0 8px",marginLeft:56}}>{skill.desc}</p>
                      <CommentThread threadKey={skillCK}/>

                      {/* Tips */}
                      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12,marginLeft:56}}>
                        {skill.tips.map((tip,ti)=>{
                          const isTipExp = expandedTip[si]===tip.id;
                          const pc = pctColor[tip.pct]||teal;
                          const tipCC = getCommentCount(tip.id);
                          const prog = tipProgress[tip.id]||{};
                          const pctDone = prog.pct||0;
                          return (
                            <div key={tip.id} style={{background:dk?"rgba(255,255,255,.02)":bg,border:`1px solid ${isTipExp?pc+"30":bd}`,borderRadius:r,overflow:"hidden",transition:"border-color .2s",position:"relative"}}>
                              {/* Accent top */}
                              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:pc}}/>
                              <button onClick={()=>setExpandedTip(p=>({...p,[si]:isTipExp?null:tip.id}))} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer",background:"none",border:"none",textAlign:"left"}}>
                                <div style={{width:30,height:30,borderRadius:8,background:pc+"12",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{catIcon[tip.cat]||"📌"}</div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:14,fontWeight:700,color:tx,fontFamily:fb}}>{tip.title}</div>
                                  {!isTipExp&&<div style={{fontSize:11,color:tm,fontFamily:fb,marginTop:2}}>{pctLabel[tip.pct]} · {tip.timeline}{tip.provider?` · ${tip.provider}`:""}</div>}
                                </div>
                                {showComments&&tipCC>0&&!isTipExp&&<span style={{fontSize:9,color:orange,fontWeight:700,fontFamily:fb,flexShrink:0}}>💬 {tipCC}</span>}
                                {planEditing&&planStatus==="draft"&&<button onClick={e=>{e.stopPropagation();removeTipFromSkill(si,tip.id);}} style={{width:22,height:22,borderRadius:sr,border:`1px solid ${red}30`,background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:red,flexShrink:0,fontSize:10}} title="Remove">✕</button>}
                                <span style={{fontSize:9,fontWeight:800,color:pc,background:pc+"10",padding:"3px 8px",borderRadius:5,fontFamily:fb,flexShrink:0}}>{tip.pct}%</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tm} strokeWidth="2" style={{transform:isTipExp?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
                              </button>

                              {isTipExp&&(
                                <div style={{padding:"0 16px 16px",borderTop:`1px solid ${bd}`}}>
                                  <div style={{display:"flex",gap:6,flexWrap:"wrap",padding:"10px 0 8px"}}>
                                    <span style={{fontSize:10,fontWeight:700,color:pc,background:pc+"12",padding:"2px 8px",borderRadius:4,fontFamily:fb}}>{pctLabel[tip.pct]}</span>
                                    <span style={{fontSize:10,fontWeight:600,color:ts,background:dk?"rgba(255,255,255,.04)":navy+"06",padding:"2px 8px",borderRadius:4,fontFamily:fb}}>{tip.cat}</span>
                                    <span style={{fontSize:10,color:tm,fontFamily:fb,padding:"2px 4px"}}>{tip.timeline}</span>
                                    {tip.provider&&<span style={{fontSize:10,color:tm,fontFamily:fb,padding:"2px 4px"}}>· {tip.provider}</span>}
                                    {tip.duration&&<span style={{fontSize:10,color:tm,fontFamily:fb,padding:"2px 4px"}}>· {tip.duration}</span>}
                                  </div>
                                  <p style={{fontSize:13,color:ts,fontFamily:fb,lineHeight:1.55,margin:"0 0 10px"}}>{tip.desc}</p>
                                  {/* Insight */}
                                  {tip.insight&&<div style={{background:teal+"08",border:`1px solid ${teal}10`,borderRadius:sr,padding:"8px 12px",marginBottom:10}}>
                                    <div style={{fontSize:10,fontWeight:800,color:teal,fontFamily:fb,marginBottom:2}}>AI INSIGHT</div>
                                    <p style={{fontSize:12,color:ts,fontFamily:fb,lineHeight:1.5,margin:0}}>{tip.insight}</p>
                                  </div>}
                                  {/* Success criteria */}
                                  {tip.success&&<div style={{background:green+"08",border:`1px solid ${green}10`,borderRadius:sr,padding:"8px 12px",marginBottom:10}}>
                                    <div style={{fontSize:10,fontWeight:800,color:green,fontFamily:fb,marginBottom:2}}>SUCCESS CRITERIA</div>
                                    <p style={{fontSize:12,color:ts,fontFamily:fb,lineHeight:1.5,margin:0}}>{tip.success}</p>
                                  </div>}
                                  {/* Completion */}
                                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                                    <span style={{fontSize:11,fontWeight:700,color:tm,fontFamily:fb}}>Progress:</span>
                                    <div style={{display:"flex",gap:3}}>
                                      {[0,25,50,75,100].map(step=>(
                                        <button key={step} onClick={()=>{if(planStatus==="draft")setTipProgress(p=>({...p,[tip.id]:{...(p[tip.id]||{}),pct:step}}));}}
                                          style={{width:step===0?28:28,height:18,borderRadius:4,border:`1px solid ${pctDone>=step&&step>0?green+"50":bd}`,background:pctDone>=step&&step>0?green+"15":"transparent",
                                            color:pctDone>=step&&step>0?green:tm,fontSize:9,fontWeight:700,fontFamily:fb,cursor:planStatus==="draft"?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center"}}>{step}%</button>
                                      ))}
                                    </div>
                                  </div>
                                  <CommentThread threadKey={tip.id}/>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Add tip button (edit mode) */}
                        {planEditing&&planStatus==="draft"&&(
                          <button onClick={()=>{setPlanModalSkill(si);setPlanModal("library");}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px",borderRadius:r,border:`1px dashed ${teal}30`,background:"transparent",color:teal,fontSize:12,fontWeight:700,fontFamily:fb,cursor:"pointer"}}>+ Add Development Action</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MODALS ── */}
        {planModal==="submit"&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setPlanModal(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:cardBg,borderRadius:r+4,padding:"32px",maxWidth:420,width:"90%",border:`1px solid ${bd}`}}>
              <h3 style={{fontSize:20,fontWeight:800,fontFamily:fh,color:tx,marginBottom:8}}>Submit for Review?</h3>
              <p style={{fontSize:13,color:ts,fontFamily:fb,lineHeight:1.6,marginBottom:24}}>Your plan will be sent to your manager (Sarah Chen) for review and approval. You won't be able to edit while it's under review.</p>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button onClick={()=>setPlanModal(null)} style={{padding:"10px 20px",borderRadius:sr,border:`1px solid ${bd}`,background:"transparent",color:ts,fontSize:13,fontWeight:600,fontFamily:fb,cursor:"pointer"}}>Cancel</button>
                <button onClick={()=>{setPlanStatus("under-review");setPlanModal(null);setPlanEditing(false);}} style={{padding:"10px 24px",borderRadius:sr,background:green,color:"#fff",border:"none",fontSize:13,fontWeight:700,fontFamily:fb,cursor:"pointer"}}>Submit Plan</button>
              </div>
            </div>
          </div>
        )}

        {planModal==="library"&&planModalSkill!==null&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setPlanModal(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:cardBg,borderRadius:r+4,padding:"28px",maxWidth:540,width:"90%",maxHeight:"80vh",overflow:"auto",border:`1px solid ${bd}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <h3 style={{fontSize:18,fontWeight:800,fontFamily:fh,color:tx}}>Add Development Action</h3>
                <button onClick={()=>setPlanModal(null)} style={{width:28,height:28,borderRadius:sr,border:`1px solid ${bd}`,background:"transparent",cursor:"pointer",color:ts,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>✕</button>
              </div>
              {Object.entries(skillLibrary).map(([cat,skills])=>(
                <div key={cat} style={{marginBottom:16}}>
                  <div style={{fontSize:10,fontWeight:800,color:tm,fontFamily:fb,letterSpacing:1,marginBottom:8,textTransform:"uppercase"}}>{cat}</div>
                  {skills.map(tip=>(
                    <div key={tip.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:sr,border:`1px solid ${bd}`,marginBottom:6,background:dk?"rgba(255,255,255,.02)":bg}}>
                      <div style={{width:26,height:26,borderRadius:7,background:pctColor[tip.type]+"12",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{catIcon[tip.category]||"📌"}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:tx,fontFamily:fb}}>{tip.title}</div>
                        <div style={{fontSize:11,color:ts,fontFamily:fb}}>{tip.desc}</div>
                      </div>
                      <button onClick={()=>addTipToSkill(planModalSkill,{...tip,id:"l"+Date.now(),pct:tip.type,timeline:tip.timeline,insight:"Added from development library.",success:"To be defined."})} style={{padding:"5px 12px",borderRadius:sr,background:teal,color:"#fff",border:"none",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:fb,flexShrink:0}}>Add</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    return null;
  };

  // ═══════ VIDEO ASSESSMENT PAGE ═══════
  const AssessPage = () => {
    const journeySteps = [
      {id:"journey",label:"Overview",desc:"Assessment briefing"},
      {id:"syscheck",label:"System Check",desc:"Camera, mic & connectivity"},
      {id:"ready",label:"Get Ready",desc:"Final instructions"},
      {id:"question",label:"Assessment",desc:"5 video questions"},
      {id:"complete",label:"Complete",desc:"Submission confirmed"},
    ];
    const stepIdx = journeySteps.findIndex(s=>s.id===assessStep);
    const q = videoQuestions[curQuestion];
    const answeredCount = Object.keys(answers).length;

    // ── Journey sidebar (always visible) ──
    const JourneySidebar = () => (
      <div style={{width:240,background:dk?navy+"30":navy+"04",borderRight:`1px solid ${bd}`,padding:"32px 20px",flexShrink:0,display:"flex",flexDirection:"column"}}>
        <div style={{marginBottom:28}}>
          <div style={{fontSize:10,fontWeight:800,color:teal,fontFamily:fb,letterSpacing:1.5,marginBottom:6}}>ASSESSMENT</div>
          <div style={{fontSize:16,fontWeight:800,color:tx,fontFamily:fh,lineHeight:1.2}}>Watson-Glaser<br/>Critical Thinking</div>
          <div style={{fontSize:11,color:ts,fontFamily:fb,marginTop:6}}>Video-Based · 35 min</div>
        </div>
        <div style={{flex:1}}>
          {journeySteps.map((s,i)=>{
            const isCur = i===stepIdx;
            const isDone = i<stepIdx;
            return (
              <div key={s.id} style={{display:"flex",gap:12,marginBottom:i<journeySteps.length-1?0:0}}>
                {/* Vertical line + dot */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:24}}>
                  <div style={{width:24,height:24,borderRadius:12,background:isDone?green:isCur?teal:dk?"rgba(255,255,255,.06)":navy+"08",border:isCur?`2px solid ${teal}`:isDone?`2px solid ${green}`:`2px solid ${dk?"rgba(255,255,255,.08)":navy+"12"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .3s"}}>
                    {isDone?<I.Check s={11} style={{color:"#fff"}}/>:isCur?<div style={{width:8,height:8,borderRadius:4,background:teal}}/>:
                      <span style={{fontSize:9,fontWeight:800,color:tm,fontFamily:fb}}>{i+1}</span>}
                  </div>
                  {i<journeySteps.length-1&&<div style={{flex:1,width:2,background:isDone?green+"40":dk?"rgba(255,255,255,.06)":navy+"08",minHeight:28}}/>}
                </div>
                <div style={{paddingBottom:16}}>
                  <div style={{fontSize:13,fontWeight:isCur?700:isDone?600:500,color:isCur?teal:isDone?green:ts,fontFamily:fb}}>{s.label}</div>
                  <div style={{fontSize:11,color:tm,fontFamily:fb}}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        {assessTimerActive&&(
          <div style={{background:dk?"rgba(255,255,255,.04)":navy+"06",borderRadius:sr,padding:"12px",marginTop:16}}>
            <div style={{fontSize:9,fontWeight:800,color:tm,fontFamily:fb,letterSpacing:1,marginBottom:4}}>TIME REMAINING</div>
            <div style={{fontSize:24,fontWeight:900,color:assessTimer<300?red:tx,fontFamily:fh,fontVariantNumeric:"tabular-nums"}}>{fmtTime(assessTimer)}</div>
            <div style={{fontSize:10,color:ts,fontFamily:fb,marginTop:2}}>Question {curQuestion+1} of {videoQuestions.length}</div>
          </div>
        )}
      </div>
    );

    // ── STEP: JOURNEY OVERVIEW ──
    if (assessStep==="journey") return (
      <div style={{display:"flex",height:"100%"}}>
        <JourneySidebar/>
        <div style={{flex:1,overflow:"auto",padding:"48px 60px"}}>
          <button onClick={()=>{setPg("program");setActiveTab("overview");}} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:ts,fontSize:13,fontFamily:fb,fontWeight:500,marginBottom:28,padding:0}}><I.Back s={14}/> Back to Program</button>
          <div style={{maxWidth:640}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:purple+"10",borderRadius:20,padding:"4px 14px",marginBottom:20}}>
              <span style={{fontSize:11,fontWeight:700,color:purple,fontFamily:fb,letterSpacing:.3}}>📹 VIDEO ASSESSMENT</span>
            </div>
            <h1 style={{fontSize:40,fontWeight:900,fontFamily:fh,color:tx,letterSpacing:-1.5,lineHeight:1.05,marginBottom:12}}>Watson-Glaser<br/>Critical Thinking</h1>
            <p style={{fontSize:16,color:ts,fontFamily:fb,lineHeight:1.7,marginBottom:36}}>This is a video-based assessment with 5 questions. You'll have preparation time before each question, then record your response on camera.</p>

            {/* What to expect */}
            <div style={{background:cardBg,borderRadius:r,border:`1px solid ${bd}`,padding:"28px",marginBottom:24}}>
              <h3 style={{fontSize:16,fontWeight:700,color:tx,fontFamily:fh,marginBottom:18}}>What to expect</h3>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[{icon:"📹",title:"5 Video Questions",desc:"Record yourself answering each question on camera"},{icon:"⏱",title:"35 Minutes Total",desc:"Preparation time + recording time per question"},
                  {icon:"🔄",title:"One Attempt",desc:"Each question can only be recorded once — no retakes"},{icon:"🔒",title:"Proctored",desc:"Your camera stays on throughout the assessment"}
                ].map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:12,padding:"14px",borderRadius:sr,background:dk?"rgba(255,255,255,.02)":bg,border:`1px solid ${bd}`}}>
                    <span style={{fontSize:24}}>{item.icon}</span>
                    <div><div style={{fontSize:13,fontWeight:700,color:tx,fontFamily:fb}}>{item.title}</div><div style={{fontSize:11,color:ts,fontFamily:fb,marginTop:2,lineHeight:1.4}}>{item.desc}</div></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div style={{background:teal+"06",border:`1px solid ${teal}15`,borderRadius:r,padding:"20px 24px",marginBottom:32}}>
              <h4 style={{fontSize:13,fontWeight:700,color:tx,fontFamily:fb,marginBottom:10}}>Before you begin, ensure:</h4>
              {["Stable internet connection (5+ Mbps recommended)","Webcam and microphone working properly","Quiet, well-lit environment","Browser permissions for camera & mic enabled"].map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{width:6,height:6,borderRadius:3,background:teal,flexShrink:0}}/><span style={{fontSize:12,color:ts,fontFamily:fb}}>{t}</span>
                </div>
              ))}
            </div>

            <button onClick={()=>{setAssessStep("syscheck");startSysCheck();}} style={{padding:"16px 40px",borderRadius:r,background:teal,color:"#fff",border:"none",cursor:"pointer",fontSize:16,fontWeight:700,fontFamily:fb,display:"flex",alignItems:"center",gap:10,boxShadow:`0 6px 24px ${teal}30`}}>
              Start System Check <I.Arrow style={{color:"#fff"}} s={16}/>
            </button>
          </div>
        </div>
      </div>
    );

    // ── STEP: SYSTEM CHECK ──
    if (assessStep==="syscheck") {
      const checks = [
        {key:"internet",label:"Internet Connection",desc:"Testing download speed and latency",icon:"🌐",passMsg:"Connected · 28 Mbps"},
        {key:"device",label:"Device Compatibility",desc:"Checking browser and OS requirements",icon:"💻",passMsg:"Chrome 120 · macOS · Compatible"},
        {key:"camera",label:"Camera Access",desc:"Requesting webcam permissions",icon:"📹",passMsg:"HD Camera detected · 1080p"},
        {key:"mic",label:"Microphone Access",desc:"Requesting audio permissions",icon:"🎙",passMsg:"Built-in mic · Input level OK"},
      ];
      const allPassed = Object.values(sysChecks).every(v=>v==="pass");

      return (
        <div style={{display:"flex",height:"100%"}}>
          <JourneySidebar/>
          <div style={{flex:1,overflow:"auto",padding:"48px 60px"}}>
            <div style={{maxWidth:580}}>
              <div style={{fontSize:10,fontWeight:800,color:teal,fontFamily:fb,letterSpacing:1.5,marginBottom:8}}>SYSTEM CHECK</div>
              <h2 style={{fontSize:32,fontWeight:900,fontFamily:fh,color:tx,letterSpacing:-1,marginBottom:8}}>Checking your setup</h2>
              <p style={{fontSize:14,color:ts,fontFamily:fb,marginBottom:36}}>We need to verify your device is ready for the video assessment.</p>

              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:36}}>
                {checks.map((c,i)=>{
                  const st = sysChecks[c.key];
                  return (
                    <div key={c.key} style={{background:cardBg,borderRadius:r,border:`1px solid ${st==="pass"?green+"30":st==="checking"?teal+"30":bd}`,padding:"20px 24px",display:"flex",alignItems:"center",gap:16,transition:"all .3s"}}>
                      <div style={{width:48,height:48,borderRadius:14,background:st==="pass"?green+"12":st==="checking"?teal+"08":dk?"rgba(255,255,255,.03)":navy+"04",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,transition:"all .3s"}}>
                        {st==="pass"?<I.Check s={22} style={{color:green}}/>:st==="checking"?
                          <div style={{width:22,height:22,borderRadius:11,border:`3px solid ${teal}`,borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>:
                          <span>{c.icon}</span>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:700,color:tx,fontFamily:fb}}>{c.label}</div>
                        <div style={{fontSize:12,color:st==="pass"?green:st==="checking"?teal:ts,fontFamily:fb,marginTop:2}}>
                          {st==="pass"?c.passMsg:st==="checking"?"Checking...":c.desc}
                        </div>
                      </div>
                      <div style={{width:40,textAlign:"right"}}>
                        {st==="pass"&&<span style={{fontSize:11,fontWeight:700,color:green,fontFamily:fb}}>✓</span>}
                        {st===null&&<span style={{fontSize:11,color:tm,fontFamily:fb}}>Pending</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Camera preview mock */}
              {(sysChecks.camera==="checking"||sysChecks.camera==="pass")&&(
                <div style={{background:"#000",borderRadius:r,overflow:"hidden",marginBottom:24,position:"relative",aspectRatio:"16/9",maxWidth:400}}>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#1a1a2e,#16213e)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{width:64,height:64,borderRadius:32,background:"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",border:sysChecks.camera==="pass"?`2px solid ${green}`:"2px solid rgba(255,255,255,.2)"}}>
                        <I.Users s={28} style={{color:"rgba(255,255,255,.4)"}}/>
                      </div>
                      <div style={{fontSize:12,color:sysChecks.camera==="pass"?green:"rgba(255,255,255,.4)",fontFamily:fb,fontWeight:600}}>
                        {sysChecks.camera==="pass"?"Camera Active":"Initializing..."}
                      </div>
                    </div>
                  </div>
                  {sysChecks.camera==="pass"&&<div style={{position:"absolute",top:12,left:12,background:green,borderRadius:10,padding:"3px 10px",fontSize:10,fontWeight:700,color:"#fff",fontFamily:fb,display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:6,height:6,borderRadius:3,background:"#fff"}}/>LIVE
                  </div>}
                </div>
              )}

              {allPassed&&(
                <div style={{background:green+"08",border:`1px solid ${green}20`,borderRadius:r,padding:"16px 20px",display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
                  <I.Check s={20} style={{color:green}}/>
                  <div><div style={{fontSize:14,fontWeight:700,color:green,fontFamily:fb}}>All checks passed</div><div style={{fontSize:12,color:ts,fontFamily:fb}}>Your device is ready for the assessment</div></div>
                </div>
              )}

              <button onClick={()=>setAssessStep("ready")} disabled={!allPassed}
                style={{padding:"14px 32px",borderRadius:r,background:allPassed?teal:tm,color:"#fff",border:"none",cursor:allPassed?"pointer":"default",fontSize:15,fontWeight:700,fontFamily:fb,opacity:allPassed?1:.4,display:"flex",alignItems:"center",gap:8}}>
                Continue <I.Arrow style={{color:"#fff"}} s={14}/>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ── STEP: READY ──
    if (assessStep==="ready") return (
      <div style={{display:"flex",height:"100%"}}>
        <JourneySidebar/>
        <div style={{flex:1,overflow:"auto",display:"flex",alignItems:"center",justifyContent:"center",padding:60}}>
          <div style={{textAlign:"center",maxWidth:520}}>
            <div style={{width:80,height:80,borderRadius:20,background:teal,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 28px",boxShadow:`0 8px 30px ${teal}30`}}>
              <span style={{fontSize:36}}>📹</span>
            </div>
            <h2 style={{fontSize:34,fontWeight:900,fontFamily:fh,color:tx,letterSpacing:-1.2,marginBottom:8}}>You're all set</h2>
            <p style={{fontSize:15,color:ts,fontFamily:fb,lineHeight:1.6,marginBottom:32,maxWidth:420,margin:"0 auto 32px"}}>
              The assessment has <strong style={{color:tx}}>5 video questions</strong>. For each question you'll get <strong style={{color:tx}}>30 seconds</strong> of preparation time, then record your response. The total time limit is <strong style={{color:tx}}>35 minutes</strong>.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:36,maxWidth:420,margin:"0 auto 36px"}}>
              {[{v:"5",l:"Questions"},{v:"30s",l:"Prep Each"},{v:"35m",l:"Total Time"}].map((m,i)=>(
                <div key={i} style={{background:cardBg,borderRadius:r,border:`1px solid ${bd}`,padding:"16px 12px"}}>
                  <div style={{fontSize:26,fontWeight:900,color:tx,fontFamily:fh}}>{m.v}</div>
                  <div style={{fontSize:11,color:ts,fontFamily:fb,marginTop:2}}>{m.l}</div>
                </div>
              ))}
            </div>

            <div style={{background:orange+"08",border:`1px solid ${orange}20`,borderRadius:r,padding:"14px 18px",marginBottom:28,textAlign:"left",maxWidth:420,margin:"0 auto 28px"}}>
              <div style={{fontSize:12,fontWeight:700,color:orange,fontFamily:fb,marginBottom:4}}>⚠ Important</div>
              <div style={{fontSize:12,color:ts,fontFamily:fb,lineHeight:1.5}}>Once you begin, the timer starts and cannot be paused. Each question can only be recorded once — there are no retakes.</div>
            </div>

            <button onClick={startAssessment} style={{padding:"16px 48px",borderRadius:r,background:teal,color:"#fff",border:"none",cursor:"pointer",fontSize:16,fontWeight:700,fontFamily:fb,display:"inline-flex",alignItems:"center",gap:10,boxShadow:`0 6px 24px ${teal}30`}}>
              Begin Assessment <I.Arrow style={{color:"#fff"}} s={16}/>
            </button>
          </div>
        </div>
      </div>
    );

    // ── STEP: VIDEO QUESTIONS — SPLIT VIEW ──
    if (assessStep==="question"&&q) {
      const isAnswered = !!answers[curQuestion];
      const maxSec = q.maxRecord;
      const recPct = Math.min((recordTime/maxSec)*100, 100);
      const isPrepping = prepCountdown > 0 && !isRecording && !isAnswered;
      const diffColor = {["Warm-up"]:green,["Medium"]:orange,["Hard"]:red};

      return (
        <div style={{display:"flex",height:"100%"}}>
          <JourneySidebar/>
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            {/* Top bar */}
            <div style={{display:"flex",alignItems:"center",padding:"10px 28px",borderBottom:`1px solid ${bd}`,background:dk?navy+"20":navy+"03",flexShrink:0,gap:12}}>
              <div style={{display:"flex",gap:3,flex:1}}>
                {videoQuestions.map((_,i)=>(
                  <div key={i} style={{flex:1,height:5,borderRadius:3,background:i<curQuestion?green:i===curQuestion?(isAnswered?green:isRecording?red:teal):dk?"rgba(255,255,255,.06)":navy+"0A",transition:"background .3s"}}/>
                ))}
              </div>
              <span style={{fontSize:11,fontWeight:700,color:ts,fontFamily:fb,flexShrink:0}}>{answeredCount}/{videoQuestions.length}</span>
              <div style={{width:1,height:16,background:bd,flexShrink:0}}/>
              <div style={{fontSize:12,fontWeight:800,color:assessTimer<300?red:tx,fontFamily:fh,fontVariantNumeric:"tabular-nums",flexShrink:0}}>{fmtTime(assessTimer)}</div>
            </div>

            {/* ── SPLIT VIEW ── */}
            <div style={{flex:1,display:"flex",overflow:"hidden"}}>

              {/* ═══ LEFT: Camera & Controls ═══ */}
              <div style={{flex:1,display:"flex",flexDirection:"column",padding:"24px 24px 20px",background:dk?"#0a0e18":"#0d1117",minWidth:0}}>
                {/* Camera viewfinder — large */}
                <div style={{flex:1,borderRadius:r+4,overflow:"hidden",position:"relative",background:"linear-gradient(135deg,#1a1a2e,#16213e)",minHeight:0}}>
                  {/* Silhouette */}
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{width:100,height:100,borderRadius:50,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <I.Users s={44} style={{color:"rgba(255,255,255,.15)"}}/>
                    </div>
                  </div>

                  {/* Corner frame guides */}
                  {[{top:16,left:16},{top:16,right:16},{bottom:16,left:16},{bottom:16,right:16}].map((pos,i)=>(
                    <div key={i} style={{position:"absolute",...pos,width:24,height:24,borderColor:isRecording?"rgba(239,68,68,.5)":"rgba(255,255,255,.12)",borderWidth:2,borderStyle:"solid",
                      borderTopStyle:pos.top!==undefined?"solid":"none",borderBottomStyle:pos.bottom!==undefined?"solid":"none",
                      borderLeftStyle:pos.left!==undefined?"solid":"none",borderRightStyle:pos.right!==undefined?"solid":"none",
                      borderRadius:pos.top!==undefined&&pos.left!==undefined?"6px 0 0 0":pos.top!==undefined&&pos.right!==undefined?"0 6px 0 0":pos.bottom!==undefined&&pos.left!==undefined?"0 0 0 6px":"0 0 6px 0"}}/>
                  ))}

                  {/* REC indicator */}
                  {isRecording&&(
                    <div style={{position:"absolute",top:20,left:20,display:"flex",alignItems:"center",gap:8,background:"rgba(239,68,68,.85)",borderRadius:10,padding:"6px 14px",backdropFilter:"blur(8px)"}}>
                      <div style={{width:10,height:10,borderRadius:5,background:"#fff",animation:"pulse 1s ease infinite"}}/>
                      <span style={{fontSize:12,fontWeight:800,color:"#fff",fontFamily:fb}}>REC</span>
                      <span style={{fontSize:12,fontWeight:700,color:"#fff",fontFamily:fb,fontVariantNumeric:"tabular-nums"}}>{fmtTime(recordTime)}</span>
                      <span style={{fontSize:10,color:"rgba(255,255,255,.5)",fontFamily:fb}}>/ {fmtTime(maxSec)}</span>
                    </div>
                  )}

                  {/* LIVE badge */}
                  <div style={{position:"absolute",top:20,right:20,background:isRecording?"rgba(239,68,68,.7)":green,borderRadius:10,padding:"5px 12px",fontSize:10,fontWeight:800,color:"#fff",fontFamily:fb,display:"flex",alignItems:"center",gap:5,backdropFilter:"blur(8px)"}}>
                    <div style={{width:6,height:6,borderRadius:3,background:"#fff"}}/>LIVE
                  </div>

                  {/* Prep countdown overlay */}
                  {isPrepping&&(
                    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.65)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:5,backdropFilter:"blur(4px)"}}>
                      <div style={{width:100,height:100,borderRadius:50,border:`3px solid ${teal}`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                        <svg width="100" height="100" style={{position:"absolute",transform:"rotate(-90deg)"}}>
                          <circle cx="50" cy="50" r="47" fill="none" stroke={teal} strokeWidth="3" strokeDasharray={295} strokeDashoffset={295*(1-prepCountdown/q.prepTime)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/>
                        </svg>
                        <span style={{fontSize:48,fontWeight:900,color:"#fff",fontFamily:fh,lineHeight:1}}>{prepCountdown}</span>
                      </div>
                      <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,.4)",fontFamily:fb,letterSpacing:1.5,marginTop:16}}>PREPARATION TIME</div>
                      <div style={{fontSize:13,color:"rgba(255,255,255,.35)",fontFamily:fb,marginTop:6}}>Read the question and prepare your answer</div>
                      <button onClick={()=>setPrepCountdown(0)} style={{marginTop:16,padding:"8px 24px",borderRadius:sr,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.6)",fontSize:12,fontWeight:600,fontFamily:fb,cursor:"pointer",backdropFilter:"blur(4px)"}}>Skip Prep & Record Now</button>
                    </div>
                  )}

                  {/* Answered overlay */}
                  {isAnswered&&!isRecording&&(
                    <div style={{position:"absolute",inset:0,background:"rgba(16,185,129,.1)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:5,backdropFilter:"blur(2px)"}}>
                      <div style={{width:64,height:64,borderRadius:32,background:green,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,boxShadow:`0 6px 24px ${green}40`}}><I.Check s={32} style={{color:"#fff"}}/></div>
                      <div style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:fh}}>Response Recorded</div>
                      <div style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:fb,marginTop:4}}>{fmtTime(recordTime)} captured</div>
                    </div>
                  )}

                  {/* Recording progress bar */}
                  {isRecording&&(
                    <div style={{position:"absolute",bottom:0,left:0,right:0,height:4,background:"rgba(255,255,255,.08)"}}>
                      <div style={{height:"100%",width:recPct+"%",background:recPct>80?red:teal,transition:"width 1s linear",borderRadius:"0 2px 2px 0"}}/>
                    </div>
                  )}
                </div>

                {/* Controls bar under camera */}
                <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:16}}>
                  {!isAnswered && !isRecording && !isPrepping && (
                    <button onClick={startRecording} style={{flex:1,padding:"14px",borderRadius:r,background:red,color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:fb,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 4px 20px rgba(239,68,68,.3)`}}>
                      <div style={{width:14,height:14,borderRadius:7,background:"#fff"}}/>Start Recording
                    </button>
                  )}
                  {isRecording && (
                    <button onClick={stopRecording} style={{flex:1,padding:"14px",borderRadius:r,background:red,color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:fb,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                      <div style={{width:14,height:14,borderRadius:3,background:"#fff"}}/>Stop Recording
                    </button>
                  )}
                  {isAnswered && (
                    <button onClick={nextQuestion} style={{flex:1,padding:"14px",borderRadius:r,background:teal,color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:fb,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                      {curQuestion<videoQuestions.length-1?"Next Question":"Finish Assessment"} <I.Arrow s={14} style={{color:"#fff"}}/>
                    </button>
                  )}
                  {isPrepping&&<div style={{flex:1}}/>}
                  {/* Mic level indicator */}
                  <div style={{display:"flex",alignItems:"center",gap:4,padding:"10px 14px",borderRadius:sr,background:dk?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)",border:`1px solid ${dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"}`}}>
                    <span style={{fontSize:14}}>🎙</span>
                    <div style={{display:"flex",gap:2,alignItems:"flex-end",height:16}}>
                      {[6,10,14,12,8,11,7].map((h,i)=>(
                        <div key={i} style={{width:3,height:isRecording?h:4,borderRadius:2,background:isRecording?teal:tm+"40",transition:"height .15s"}}/>
                      ))}
                    </div>
                  </div>
                </div>
                {!isAnswered&&!isPrepping&&<div style={{textAlign:"center",marginTop:6,fontSize:11,color:"rgba(255,255,255,.25)",fontFamily:fb}}>Max recording: {fmtTime(q.maxRecord)}</div>}
              </div>

              {/* ═══ RIGHT: Question Panel ═══ */}
              <div style={{width:360,borderLeft:`1px solid ${bd}`,background:dk?cardBg:bg,display:"flex",flexDirection:"column",overflow:"auto",flexShrink:0}}>
                {/* Question header */}
                <div style={{padding:"24px 24px 0"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <span style={{fontSize:10,fontWeight:800,color:purple,fontFamily:fb,letterSpacing:1.2}}>QUESTION {curQuestion+1}/{videoQuestions.length}</span>
                    <span style={{fontSize:9,fontWeight:700,color:diffColor[q.difficulty]||tm,background:(diffColor[q.difficulty]||tm)+"12",padding:"2px 8px",borderRadius:4,fontFamily:fb}}>{q.difficulty}</span>
                  </div>
                  <h2 style={{fontSize:22,fontWeight:900,fontFamily:fh,color:tx,letterSpacing:-.5,lineHeight:1.15,marginBottom:8}}>{q.title}</h2>
                  <div style={{fontSize:9,fontWeight:700,color:teal,background:teal+"10",padding:"3px 10px",borderRadius:5,fontFamily:fb,display:"inline-block",marginBottom:16}}>COMPETENCY: {q.competency}</div>
                </div>

                {/* Prompt card */}
                <div style={{margin:"0 24px 16px",background:dk?navy+"20":navy+"04",border:`1px solid ${dk?navy+"30":navy+"0A"}`,borderRadius:r,padding:"16px 18px"}}>
                  <div style={{fontSize:9,fontWeight:800,color:navy,fontFamily:fb,letterSpacing:1,marginBottom:6,opacity:.6}}>YOUR QUESTION</div>
                  <p style={{fontSize:14,fontWeight:600,color:tx,fontFamily:fb,lineHeight:1.55,margin:0}}>{q.prompt}</p>
                </div>

                {/* Context */}
                <div style={{margin:"0 24px 16px",padding:"14px 16px",background:dk?"rgba(255,255,255,.02)":teal+"04",border:`1px solid ${teal}10`,borderRadius:sr}}>
                  <div style={{fontSize:9,fontWeight:800,color:teal,fontFamily:fb,letterSpacing:1,marginBottom:6}}>WHAT WE'RE ASSESSING</div>
                  <p style={{fontSize:12,color:ts,fontFamily:fb,lineHeight:1.55,margin:0}}>{q.context}</p>
                </div>

                {/* Key points to cover */}
                <div style={{margin:"0 24px 16px"}}>
                  <div style={{fontSize:9,fontWeight:800,color:tm,fontFamily:fb,letterSpacing:1,marginBottom:10}}>KEY POINTS TO COVER</div>
                  {q.keyPoints.map((pt,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
                      <div style={{width:20,height:20,borderRadius:6,background:isAnswered?green+"12":dk?"rgba(255,255,255,.04)":navy+"06",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                        {isAnswered?<I.Check s={10} style={{color:green}}/>:<span style={{fontSize:10,fontWeight:800,color:tm,fontFamily:fb}}>{i+1}</span>}
                      </div>
                      <span style={{fontSize:12,fontWeight:600,color:tx,fontFamily:fb,lineHeight:1.4}}>{pt}</span>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div style={{margin:"0 24px 16px",background:dk?"rgba(255,255,255,.02)":orange+"04",border:`1px solid ${orange}10`,borderRadius:sr,padding:"14px 16px"}}>
                  <div style={{fontSize:9,fontWeight:800,color:orange,fontFamily:fb,letterSpacing:1,marginBottom:8}}>💡 TIPS</div>
                  {q.tips.map((t,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:i<q.tips.length-1?6:0}}>
                      <span style={{color:orange,fontSize:10,marginTop:2,flexShrink:0}}>→</span>
                      <span style={{fontSize:11,color:ts,fontFamily:fb,lineHeight:1.45}}>{t}</span>
                    </div>
                  ))}
                </div>

                {/* Question navigator */}
                <div style={{margin:"auto 24px 20px",paddingTop:16,borderTop:`1px solid ${bd}`}}>
                  <div style={{fontSize:9,fontWeight:800,color:tm,fontFamily:fb,letterSpacing:1,marginBottom:10}}>ALL QUESTIONS</div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {videoQuestions.map((vq,i)=>{
                      const isDone = !!answers[i];
                      const isCur = i===curQuestion;
                      return (
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:sr,background:isCur?(dk?teal+"12":teal+"06"):"transparent",border:`1px solid ${isCur?teal+"20":"transparent"}`}}>
                          <div style={{width:22,height:22,borderRadius:7,background:isDone?green:isCur?teal:dk?"rgba(255,255,255,.04)":navy+"06",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            {isDone?<I.Check s={10} style={{color:"#fff"}}/>:<span style={{fontSize:9,fontWeight:800,color:isCur?"#fff":tm,fontFamily:fb}}>{i+1}</span>}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:isCur?700:500,color:isCur?teal:isDone?green:tx,fontFamily:fb,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{vq.title}</div>
                          </div>
                          <span style={{fontSize:10,color:tm,fontFamily:fb,flexShrink:0}}>{fmtTime(vq.maxRecord)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── STEP: COMPLETE ──
    if (assessStep==="complete") return (
      <div style={{display:"flex",height:"100%"}}>
        <JourneySidebar/>
        <div style={{flex:1,overflow:"auto",display:"flex",alignItems:"center",justifyContent:"center",padding:60}}>
          <div style={{textAlign:"center",maxWidth:500}}>
            <div style={{position:"relative",width:100,height:100,margin:"0 auto 28px"}}>
              <div style={{width:100,height:100,borderRadius:50,background:green+"15",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:72,height:72,borderRadius:36,background:green,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 8px 30px ${green}30`}}>
                  <I.Check s={36} style={{color:"#fff"}}/>
                </div>
              </div>
            </div>
            <h2 style={{fontSize:36,fontWeight:900,fontFamily:fh,color:tx,letterSpacing:-1.2,marginBottom:8}}>Assessment Complete</h2>
            <p style={{fontSize:15,color:ts,fontFamily:fb,lineHeight:1.6,marginBottom:32}}>Your video responses have been submitted successfully. You'll receive your results once they've been reviewed and scored.</p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:32}}>
              {[{v:"5/5",l:"Questions Answered",c:green},{v:fmtTime(35*60-assessTimer),l:"Time Used",c:teal},{v:"Submitted",l:"Status",c:purple}].map((m,i)=>(
                <div key={i} style={{background:cardBg,borderRadius:r,border:`1px solid ${bd}`,padding:"16px 12px"}}>
                  <div style={{fontSize:22,fontWeight:900,color:m.c,fontFamily:fh}}>{m.v}</div>
                  <div style={{fontSize:11,color:ts,fontFamily:fb,marginTop:2}}>{m.l}</div>
                </div>
              ))}
            </div>

            <div style={{background:teal+"06",border:`1px solid ${teal}15`,borderRadius:r,padding:"16px 20px",marginBottom:28,textAlign:"left"}}>
              <div style={{fontSize:13,fontWeight:700,color:tx,fontFamily:fb,marginBottom:6}}>What happens next?</div>
              {["Your responses are being processed and will be reviewed by assessors","Results typically available within 5–7 business days","You'll receive an email notification when your report is ready","Your report will appear in the Insights tab of your program"].map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:4}}>
                  <span style={{color:teal,fontSize:12,marginTop:1}}>→</span><span style={{fontSize:12,color:ts,fontFamily:fb,lineHeight:1.4}}>{t}</span>
                </div>
              ))}
            </div>

            <button onClick={()=>{setPg("program");setActiveTab("overview");}} style={{padding:"14px 36px",borderRadius:r,background:navy,color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:fb,display:"inline-flex",alignItems:"center",gap:8}}>
              Return to Program <I.Arrow style={{color:"#fff"}} s={14}/>
            </button>
          </div>
        </div>
      </div>
    );

    return null;
  };

  // ═══════ LAYOUT ═══════
  return (
    <div style={{display:"flex",height:"100vh",background:bg,overflow:"hidden"}}>
      <style>{css}</style>

      {/* DOCK */}
      {!dockHidden && pg!=="assess" && <nav className="dk" style={{width:60,background:dk?`${navy}EE`:navy,display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 0",flexShrink:0,transition:"width .2s"}}>
        <div style={{width:36,height:36,borderRadius:10,background:teal,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:28,cursor:"pointer",boxShadow:`0 2px 8px ${teal}50`}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:4,flex:1}}>
          {dockItems.map(item=>{
            const isA = (item.id==="home"&&pg==="dash")||(item.id==="book"&&pg==="dev");
            return (
              <div key={item.id} style={{position:"relative"}} onMouseEnter={()=>setHovDock(item.id)} onMouseLeave={()=>setHovDock(null)}>
                <button onClick={item.action||(()=>{})} style={{width:42,height:42,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"none",background:isA?"rgba(255,255,255,.12)":"transparent",color:isA?"#fff":"rgba(255,255,255,.4)",transition:"all .15s"}}
                  onMouseEnter={e=>{if(!isA)e.currentTarget.style.background="rgba(255,255,255,.06)";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{if(!isA)e.currentTarget.style.background="transparent";e.currentTarget.style.color=isA?"#fff":"rgba(255,255,255,.4)";}}>
                  <item.icon s={20}/>
                </button>
                {hovDock===item.id&&<div style={{position:"absolute",left:"calc(100% + 8px)",top:"50%",transform:"translateY(-50%)",background:navy,color:"#fff",padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,fontFamily:fb,whiteSpace:"nowrap",zIndex:100,boxShadow:"0 4px 12px rgba(0,0,0,.2)"}}>{item.label}</div>}
                {isA&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:3,height:20,borderRadius:"0 2px 2px 0",background:teal}}/>}
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"center"}}>
          {/* Settings / Theme picker */}
          <div style={{position:"relative"}}>
            <button onClick={e=>{e.stopPropagation();setShowTheme(!showTheme);}} style={{width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"none",background:showTheme?"rgba(255,255,255,.15)":"rgba(255,255,255,.06)",color:"rgba(255,255,255,.5)"}}
              onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.5)"}><I.Settings s={16}/></button>
            {showTheme&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",left:"calc(100% + 10px)",bottom:0,width:200,background:cardBg,border:`1px solid ${bd}`,borderRadius:12,boxShadow:`0 12px 40px rgba(0,0,0,.15)`,overflow:"hidden",zIndex:200,padding:12}}>
              <div style={{fontSize:11,fontWeight:700,color:ts,fontFamily:fb,marginBottom:8}}>Color Theme</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                {colorPresets.map((cp,i)=>{
                  const active = primaryColor===cp.n && accentColor===cp.t;
                  return <button key={i} onClick={()=>{setPrimaryColor(cp.n);setAccentColor(cp.t);}} title={cp.label}
                    style={{width:24,height:24,borderRadius:12,cursor:"pointer",border:active?`2px solid ${dk?"#fff":"#333"}`:`1.5px solid ${bd}`,padding:0,background:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{width:18,height:18,borderRadius:9,overflow:"hidden",display:"flex"}}><div style={{width:"50%",height:"100%",background:cp.n}}/><div style={{width:"50%",height:"100%",background:cp.t}}/></div>
                  </button>;
                })}
              </div>
              <button onClick={()=>{setDockHidden(true);setShowTheme(false);}} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${bd}`,background:"none",cursor:"pointer",color:ts,fontSize:12,fontWeight:600,fontFamily:fb,display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
                Hide dock
              </button>
            </div>}
          </div>
          <button onClick={()=>setDk(!dk)} style={{width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"none",background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.5)"}}
            onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.5)"}>{dk?<I.Sun s={16}/>:<I.Moon s={16}/>}</button>
          <div style={{width:36,height:36,borderRadius:10,background:teal,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800,fontFamily:fb,cursor:"pointer"}}>KL</div>
        </div>
      </nav>}

      {/* Floating dock show button */}
      {dockHidden&&pg!=="assess"&&(
        <button onClick={()=>setDockHidden(false)} style={{position:"fixed",left:8,top:"50%",transform:"translateY(-50%)",zIndex:100,width:28,height:56,borderRadius:"0 8px 8px 0",background:dk?`${navy}CC`:navy,border:"none",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`2px 0 12px rgba(0,0,0,.15)`,opacity:.6}}
          onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity=".6"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/></svg>
        </button>
      )}

      {/* MAIN */}
      <main ref={mainRef} style={{flex:1,overflow:pg==="assess"?"hidden":"auto",display:pg==="assess"?"flex":"block",flexDirection:"column"}}>
        {pg!=="assess"&&<div style={{display:"flex",alignItems:"center",padding:"16px 48px",gap:16}}>
          <div style={{flex:1}}/>
          {curProg&&pg==="program"&&(
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:sr,background:dk?navy+"80":navy+"08",border:`1px solid ${bd}`}}>
              <I.Clock style={{color:teal}} s={14}/>
              <span style={{fontSize:12,fontWeight:700,color:tx,fontFamily:fb}}>Due {curProg.due}</span>
              <span style={{fontSize:12,color:ts,fontFamily:fb}}>·</span>
              <span style={{fontSize:12,fontWeight:600,color:teal,fontFamily:fb}}>{curProg.daysLeft}d</span>
            </div>
          )}
          <div style={{position:"relative"}}>
            <button onClick={e=>{e.stopPropagation();setNotif(!notif);}} style={{width:38,height:38,borderRadius:sr,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:`1px solid ${bd}`,background:cardBg,color:ts,position:"relative"}}><I.Bell s={16}/><div style={{position:"absolute",top:6,right:6,width:6,height:6,borderRadius:3,background:red}}/></button>
          </div>
          <button style={{width:38,height:38,borderRadius:sr,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:`1px solid ${bd}`,background:cardBg,color:ts}}><I.Globe s={16}/></button>
        </div>}
        {pg==="dash"?<Dashboard/>:pg==="dev"?<DevPage/>:pg==="assess"?<AssessPage/>:<ProgramPage/>}
      </main>
    </div>
  );
};

export default App;
