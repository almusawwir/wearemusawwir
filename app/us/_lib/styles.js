export const css = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Instrument+Sans:wght@400;500;600&display=swap');
html,body{margin:0;padding:0;background:#000}
.us{--pink:#FF0065;--fg:#fff;--grey:#9a9a9a;--line:#262626;--card:#0d0d0d;--green:#3DDC84;--amber:#FFC53D;
  --display:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;
  --body:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  font-family:var(--body);background:#000;color:var(--fg);min-height:100vh;font-size:16px;line-height:1.5;
  overflow-x:hidden;overflow-x:clip;min-width:0}
.us *{box-sizing:border-box}
.us a{color:var(--fg)}
.us :focus-visible{outline:3px solid var(--pink);outline-offset:2px}
.us .wrap{max-width:1180px;margin:0 auto;padding:0 20px;width:100%}
.us h1{font-family:var(--display);font-weight:900;font-size:34px;line-height:1;margin:0}
.us h1 span{color:var(--pink)}
.us .bad{color:var(--pink);font-weight:600;font-size:14px;margin:10px 0 0}
.us .ok{color:var(--green);font-weight:600;font-size:14px;margin:10px 0 0}
.us .muted{color:var(--grey);font-size:14px;margin:6px 0 0}
.us .pad{padding:12px}
.us .status{margin:14px 0 0;font-size:13px;color:var(--grey)}

/* Lock screen */
.us .center{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.us .lockbox{width:100%;max-width:360px;display:flex;flex-direction:column;gap:12px;text-align:center}
.us .lockbox h1{font-size:56px}
.us .lockbox p{margin:0;color:var(--grey)}
.us .lockbox input{font:inherit;font-size:18px;padding:14px;text-align:center;letter-spacing:.12em;background:#0b0b0b;color:#fff;border:2px solid #fff;border-radius:0}
.us .lockbox input:focus{outline:none;border-color:var(--pink)}
.us .lockbox button{font:inherit;font-weight:600;font-size:16px;padding:14px;background:var(--pink);color:#fff;border:2px solid var(--pink);cursor:pointer}
.us .lockbox button:disabled{opacity:.6;cursor:default}

/* Loader */
.us .ldr{display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--grey);font-size:14px}
.us .tri{width:46px;height:42px;overflow:visible}
.us .tri path{fill:none;stroke:var(--pink);stroke-width:2.5;stroke-linejoin:round;stroke-dasharray:100;stroke-dashoffset:100;animation:usdraw 2.2s cubic-bezier(.65,0,.35,1) infinite}
@keyframes usdraw{0%{stroke-dashoffset:100;opacity:.35}45%,55%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:-100;opacity:.35}}

/* Header */
.us .top{position:sticky;top:0;z-index:10;background:#000;border-bottom:1px solid var(--line)}
.us .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:12px;padding-bottom:12px}
.us .homelink{background:none;border:0;padding:0;cursor:pointer;color:#fff;text-align:left}
.us .actions{display:flex;gap:8px}
.us .mini{font:inherit;font-size:14px;font-weight:600;padding:8px 14px;background:transparent;color:#fff;border:2px solid #fff;cursor:pointer;text-decoration:none;display:inline-block}
.us .mini.ghost{border-color:#555;color:#ccc}
.us .mini:disabled{opacity:.6;cursor:default}
.us .link{font:inherit;font-size:13.5px;font-weight:600;background:none;border:0;color:var(--pink);cursor:pointer;padding:0;text-decoration:underline;text-align:left}
.us .loadbar{height:3px;overflow:hidden;opacity:0;transition:opacity .2s ease}
.us .loadbar.on{opacity:1}
.us .loadbar i{display:block;width:40%;height:100%;background:var(--pink);animation:usload 1.1s ease-in-out infinite}
@keyframes usload{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}

/* Home tiles */
.us .tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;padding-top:16px;padding-bottom:30px}
.us .tile{min-height:150px;display:flex;flex-direction:column;gap:6px;text-align:left;font:inherit;color:#fff;background:var(--card);
  border:2px solid #fff;padding:16px;cursor:pointer;min-width:0;transition:border-color .15s ease,transform .15s ease}
.us .tile:hover{border-color:var(--pink);transform:translate(-2px,-2px)}
.us .tile.featured{background:var(--pink);border-color:var(--pink)}
.us .tile.featured:hover{border-color:#fff}
.us .tile.everyone{background:#fff;color:#000;border-color:#fff}
.us .tile.everyone .tsub{color:#555}
.us .tile.unassigned{border-style:dashed;border-color:#888}
.us .ttop{display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap}
.us .ttag{font-size:12px;font-weight:600;padding:2px 8px;border:2px solid currentColor;white-space:nowrap}
.us .twhen{font-size:12px;font-weight:600;color:var(--grey)}
.us .twhen.now{color:#000;background:#fff;padding:2px 6px}
.us .twhen.soon{color:#ddd}
.us .tile.featured .twhen{color:#fff}
.us .tile.featured .twhen.now{color:var(--pink);background:#fff}
.us .ttitle{font-family:var(--display);font-weight:900;font-size:28px;line-height:1.05;margin-top:6px;word-break:break-word}
.us .tdate{font-size:13.5px;opacity:.85}
.us .tcount{font-size:14.5px;margin-top:auto}
.us .tcount b{font-family:var(--display);font-weight:900;font-size:30px;line-height:1}
.us .tsub{font-size:12.5px;color:var(--grey)}
.us .tile.featured .tsub{color:#fff}

/* Event header + tabs */
.us .evhead{padding-top:14px}
.us .back{font:inherit;font-size:15px;font-weight:600;background:none;border:0;color:var(--grey);cursor:pointer;padding:6px 0;margin-bottom:6px;display:block}
.us .back:hover{color:#fff}
.us .evtag{display:inline-block;font-size:12px;font-weight:600;padding:2px 8px;border:2px solid var(--pink);color:var(--pink)}
.us .evhead h2{font-family:var(--display);font-weight:900;font-size:clamp(34px,7vw,56px);line-height:1;margin:8px 0 6px;word-break:break-word}
.us .evhead .meta{font-size:14.5px;color:#ccc}
.us .evstats{margin:0;font-size:15px;color:#ccc}
.us .evstats b{color:#fff;font-family:var(--display);font-weight:900;font-size:22px}
.us .evtabs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}
.us .evtab{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;font:inherit;color:#fff;background:var(--card);border:2px solid #444;padding:12px 14px;cursor:pointer;min-width:0}
.us .evtab > span{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--grey);font-weight:600}
.us .evtab b{font-family:var(--display);font-weight:900;font-size:30px;line-height:1.05}
.us .evtab b small{font-size:18px;color:var(--grey)}
.us .evtab b.neg{color:var(--pink)}
.us .evtab > small{font-size:12px;color:var(--grey)}
.us .evtab:hover{border-color:#fff}
.us .evtab.on{border-color:var(--pink);background:#1a0610}
.us .evtab.on > span{color:var(--pink)}

/* Money */
.us .money{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.us .mbox{display:flex;flex-direction:column;gap:2px;text-align:left;font:inherit;color:#fff;background:var(--card);border:2px solid #fff;padding:14px;min-width:0}
.us .mbox span{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--grey);font-weight:600}
.us .mbox b{font-family:var(--display);font-weight:900;font-size:32px;line-height:1.05}
.us .mbox small{font-size:12.5px;color:var(--grey)}
.us .mbox.net{border-color:var(--green)}
.us .mbox.net b{color:var(--green)}
.us .mbox.net.neg{border-color:var(--pink)}
.us .mbox.net.neg b{color:var(--pink)}
.us .paybreak{display:flex;flex-wrap:wrap;gap:8px}
.us .paybreak span{font-size:14px;color:#ccc;border:1px solid #333;padding:6px 10px}
.us .paybreak b{color:#fff}

/* Planning */
.us .plan{display:flex;flex-direction:column;gap:26px;margin-top:22px;padding-bottom:60px}
.us .psec h3,.us .edit h3,.us .sect h3{font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:var(--grey);margin:0 0 8px;font-weight:600}
.us .psec .hint{font-size:13px;color:var(--grey);margin:-2px 0 10px}
.us .psqs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.us .psq{min-height:130px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;text-align:left;font:inherit;color:#fff;background:var(--card);border:2px solid #fff;padding:12px;cursor:pointer;min-width:0}
.us .psq b{font-family:var(--display);font-weight:900;font-size:42px;line-height:1}
.us .psq span{font-size:14px;font-weight:600;line-height:1.3;word-break:break-word}
.us .psq:hover{border-color:var(--pink)}
.us .psq.hl{background:var(--pink);border-color:var(--pink)}
.us .psq.hl:hover{border-color:#fff}

/* Producers: squares */
.us .slots{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;max-width:720px}
.us .slot{position:relative;aspect-ratio:1/1;border:2px solid #fff;display:flex;align-items:center;justify-content:center;min-width:0}
.us .slot.empty{flex-direction:column;gap:4px;border-style:dashed;border-color:#666;color:#bbb;font:inherit;font-weight:600;font-size:14px;background:transparent;cursor:pointer}
.us .slot.empty .plus{font-size:30px;line-height:1;font-weight:400}
.us .slot.empty:hover{border-color:var(--pink);color:#fff}
.us .slot.filled{background:var(--card)}
.us .slotmain{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:none;border:0;color:#fff;font:inherit;font-weight:600;cursor:pointer;padding:10px;min-width:0}
.us .slotname{max-width:100%;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14.5px}
.us .slotx{flex:0 0 auto;width:34px;height:34px;background:#000;border:2px solid #555;color:#ccc;cursor:pointer}
.us .slotx:hover{border-color:var(--pink);color:#fff}
.us .slotx.corner{position:absolute;top:6px;right:6px;width:30px;height:30px;font-size:13px}

/* Registrations */
.us .evtools{display:flex;flex-direction:column;gap:10px;margin-top:20px}
.us .evtools .line{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;justify-content:space-between}
.us .inline-sel{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--grey);text-transform:uppercase;letter-spacing:.1em}
.us .export{font:inherit;font-weight:600;font-size:14.5px;padding:11px 16px;background:var(--pink);color:#fff;border:2px solid var(--pink);cursor:pointer}
.us .exports{display:flex;gap:8px;flex-wrap:wrap}
.us .export.ghost{background:transparent;color:#fff;border-color:#fff}
.us .export:disabled{opacity:.4;cursor:default}
.us .rows{display:flex;flex-direction:column;gap:8px;padding-top:6px;padding-bottom:60px}
.us .row{display:flex;align-items:center;gap:10px;border:2px solid #333;background:var(--card);padding:8px 10px;flex-wrap:wrap}
.us .row.excluded{opacity:.55}
.us .rowmain{flex:1 1 240px;display:flex;align-items:center;gap:12px;background:none;border:0;color:#fff;font:inherit;text-align:left;cursor:pointer;min-width:0;padding:0}
.us .rowtext{display:flex;flex-direction:column;min-width:0}
.us .rowname{font-weight:600;font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.us .prodtag{display:inline-block;margin-left:8px;font-size:11px;font-weight:600;padding:1px 6px;background:var(--pink);color:#fff;vertical-align:2px}
.us .rowacts{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.us .ico{min-width:40px;height:38px;padding:0 8px;display:inline-flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:600;border:2px solid #555;text-decoration:none;color:#fff}
.us .ico:hover{border-color:var(--pink)}
.us .tick{height:38px;padding:0 10px;font:inherit;font-size:13px;font-weight:600;background:transparent;color:#ccc;border:2px solid #555;cursor:pointer;white-space:nowrap}
.us .tick:hover{border-color:#fff;color:#fff}
.us .tick.pay.paid{background:var(--green);border-color:var(--green);color:#000}
.us .tick.pay.later{background:var(--amber);border-color:var(--amber);color:#000}
.us .tick.pay.unpaid{border-color:var(--pink);color:var(--pink)}
.us .tick.pay.out{border-color:#777;color:#bbb}
.us .tick.pay.rejected{border-color:#777;color:#999;text-decoration:line-through}
.us .tick.in.on{background:var(--pink);border-color:var(--pink);color:#fff}

/* Directory */
.us .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding-top:18px}
.us .stat{text-align:left;font:inherit;color:#fff;background:var(--card);border:2px solid var(--line);padding:12px 14px;cursor:pointer}
.us .stat b{display:block;font-family:var(--display);font-weight:900;font-size:34px;line-height:1}
.us .stat span{font-size:13px;color:var(--grey)}
.us .stat.on,.us .stat:hover{border-color:var(--pink)}
.us .tools{display:flex;flex-direction:column;gap:12px;padding-top:16px}
.us .search{font:inherit;font-size:16px;padding:13px 14px;background:#0b0b0b;color:#fff;border:2px solid #fff;width:100%;border-radius:0}
.us .search:focus{outline:none;border-color:var(--pink)}
.us .chips{display:flex;gap:8px;flex-wrap:wrap}
.us .chip{font:inherit;font-size:14px;font-weight:600;padding:7px 12px;background:transparent;color:#fff;border:2px solid #555;cursor:pointer;white-space:nowrap}
.us .chip b{color:var(--grey);font-weight:600;margin-left:6px}
.us .chip.soft{border-style:dashed}
.us .chip.on{background:var(--pink);border-color:var(--pink);border-style:solid}
.us .chip.on b{color:#fff}
.us .selects{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.us .selects label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--grey);text-transform:uppercase;letter-spacing:.1em}
.us select{font:inherit;font-size:15px;text-transform:none;letter-spacing:0;padding:10px 12px;background:#0b0b0b;color:#fff;border:2px solid #555;border-radius:0}
.us select:focus{outline:none;border-color:var(--pink)}
.us .count{font-size:13.5px;color:var(--grey);display:flex;gap:12px;align-items:center}
.us .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;padding-top:14px;padding-bottom:60px}
.us .card{display:flex;gap:12px;align-items:flex-start;text-align:left;font:inherit;color:#fff;background:var(--card);border:2px solid #fff;padding:12px;cursor:pointer;transition:border-color .15s ease,transform .15s ease}
.us .card:hover{border-color:var(--pink);transform:translate(-2px,-2px)}
.us .cbody{display:flex;flex-direction:column;gap:3px;min-width:0}
.us .ctop{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.us .name{font-family:var(--display);font-weight:900;font-size:23px;line-height:1.1;word-break:break-word}
.us .real{font-size:13px;color:#ccc}
.us .meta{font-size:13px;color:var(--grey)}
.us .star{color:var(--pink)}
.us .newtag{font-size:11px;font-weight:600;padding:1px 6px;background:#fff;color:#000}
.us .empty{color:var(--grey);padding:40px 0}
.us .evchips{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.us .evchip{font-size:11.5px;font-weight:600;padding:1px 6px;border:1px solid #555}

.us .av{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;overflow:hidden;
  background:#1d1d1d;border:2px solid #333;color:#fff;font-weight:600;font-family:var(--body)}
.us .av img{width:100%;height:100%;object-fit:cover;display:block}

.us .badge{display:inline-block;font-size:11.5px;font-weight:600;padding:1px 7px;border:2px solid currentColor}
.us .b-OG{background:var(--pink);border-color:var(--pink);color:#fff}
.us .b-Core{color:var(--pink)}
.us .b-Special{color:#fff}
.us .b-New{color:var(--grey)}

/* Modals */
.us .modalwrap{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.78);display:flex;align-items:flex-start;justify-content:center;padding:60px 16px}
.us .modal{width:min(520px,100%);max-height:84vh;display:flex;flex-direction:column;background:#0b0b0b;border:2px solid var(--pink)}
.us .modal.small{width:min(380px,100%)}
.us .modal .mhead{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #222}
.us .modal .mhead h3{margin:0;font-family:var(--display);font-weight:900;font-size:24px;line-height:1.1;word-break:break-word}
.us .mbody{padding:14px;overflow-y:auto;display:flex;flex-direction:column;gap:12px}
.us .msearch{padding:12px 14px}
.us .msearch input,.us .payother input,.us .expadd input{font:inherit;font-size:16px;padding:12px;background:#000;color:#fff;border:2px solid #555;width:100%;border-radius:0;min-width:0}
.us .msearch input:focus,.us .payother input:focus,.us .expadd input:focus{outline:none;border-color:var(--pink)}
.us .plist{overflow-y:auto;padding:4px 10px 10px}
.us .pitem{width:100%;display:flex;gap:10px;align-items:center;padding:8px;background:none;border:0;color:#fff;font:inherit;text-align:left;cursor:pointer}
.us .pitem:hover{background:#161616}
.us .plrow{display:flex;align-items:center;gap:10px;padding:8px 2px;border-bottom:1px solid #1d1d1d}
.us .plrow .ptext{flex:1}
.us .ptext{display:flex;flex-direction:column;min-width:0}
.us .ptext b{font-weight:600}
.us .who{margin:0}
.us .linkbtn{align-self:flex-start}
.us .payopts{display:flex;flex-direction:column;gap:8px}
.us .payopt{font:inherit;font-weight:600;font-size:15px;padding:13px 14px;text-align:left;background:transparent;color:#fff;border:2px solid #555;cursor:pointer;display:flex;flex-direction:column;gap:2px}
.us .payopt small{font-size:12.5px;font-weight:500;opacity:.75}
.us .payopt:hover{border-color:#fff}
.us .payopt.on{outline:3px solid #fff;outline-offset:-6px}
.us .payopt.good{background:var(--green);border-color:var(--green);color:#000}
.us .payopt.later{border-color:var(--amber);color:var(--amber)}
.us .payopt.away{border-color:#888;color:#ddd}
.us .payopt.reject{border-color:var(--pink);color:var(--pink)}
.us .payopt:disabled{opacity:.5;cursor:default}
.us .optgroup{margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--grey);font-weight:600}
.us .payother{display:grid;grid-template-columns:1fr auto;gap:8px}
.us .expadd{display:grid;grid-template-columns:1fr 130px auto;gap:8px;margin-top:10px}
.us .explist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.us .explist li{display:grid;grid-template-columns:auto 1fr auto auto;gap:10px;align-items:center;border:1px solid #333;padding:8px 10px}
.us .expcat{font-size:12px;font-weight:600;padding:1px 6px;border:1px solid #666}
.us .expnote{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ccc;font-size:14px}
.us .leaveh{margin:0;font-family:var(--display);font-weight:900;font-size:30px}
.us .leavebtns{display:flex;gap:10px;margin-top:6px}
.us .leavebtns .save{flex:1}

/* Person drawer */
.us .drawer{position:fixed;inset:0;z-index:30;background:rgba(0,0,0,.72);display:flex;justify-content:flex-end}
.us .panel{position:relative;width:min(560px,100%);height:100%;overflow-y:auto;background:#0b0b0b;border-left:2px solid var(--pink);
  padding:22px 22px calc(40px + env(safe-area-inset-bottom,0px))}
.us .x{position:absolute;top:12px;right:12px;width:44px;height:44px;font-size:18px;background:transparent;color:#fff;border:2px solid #fff;cursor:pointer}
.us .phead{display:flex;gap:16px;align-items:flex-start;padding-right:52px}
.us .pav{display:flex;flex-direction:column;align-items:center;gap:8px}
.us .pavbtns{display:flex;flex-direction:column;gap:6px}
.us .pavbtns .mini{font-size:12.5px;padding:5px 8px}
.us .hidefile{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}
.us .pname{min-width:0}
.us .pname h2{font-family:var(--display);font-weight:900;font-size:38px;line-height:1;margin:8px 0 4px;word-break:break-word}
.us .sub{margin:0;font-size:14px;color:var(--grey)}
.us .facts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0}
.us .fact{border:1px solid var(--line);padding:9px 11px;min-width:0}
.us .fact span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--grey)}
.us .fact b{font-weight:600;word-break:break-word}
.us .edit{border:2px solid var(--pink);padding:16px;display:flex;flex-direction:column;gap:12px;margin-top:20px}
.us .fld{display:flex;flex-direction:column;gap:5px;font-size:13px;color:var(--grey);min-width:0}
.us .fld input,.us .fld textarea{font:inherit;font-size:16px;padding:11px 12px;background:#000;color:#fff;border:2px solid #555;border-radius:0;width:100%}
.us .fld input:focus,.us .fld textarea:focus{outline:none;border-color:var(--pink)}
.us .fld small{font-size:12px;color:var(--grey)}
.us .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.us .stepper{display:flex;align-items:center;border:2px solid #555;width:max-content}
.us .stepper button{width:42px;height:42px;font-size:20px;background:transparent;color:#fff;border:0;cursor:pointer}
.us .stepper b{min-width:44px;text-align:center;font-family:var(--display);font-weight:900;font-size:24px;color:#fff}
.us .check{display:flex;gap:10px;align-items:center;cursor:pointer;font-weight:500}
.us .check input{width:22px;height:22px;accent-color:var(--pink)}
.us .saverow{display:flex;align-items:center;gap:14px}
.us .saverow .ok,.us .saverow .bad{margin:0}
.us .save{font:inherit;font-weight:600;font-size:15px;padding:12px 20px;background:var(--pink);color:#fff;border:2px solid var(--pink);cursor:pointer}
.us .save:disabled{opacity:.45;cursor:default}
.us .sect{margin-top:22px}
.us .sect.first{margin-top:0}
.us .sect p{margin:6px 0 0;word-break:break-word}
.us .sect em{font-style:normal;color:var(--grey)}
.us .hist{list-style:none;margin:8px 0 0;padding:0}
.us .hist li{border-left:3px solid var(--pink);padding:6px 0 6px 12px;margin-bottom:10px}
.us .hist b{display:block}
.us .hist span{font-size:13.5px;color:var(--grey)}
.us .hist q{display:block;margin-top:4px;font-size:14.5px;color:#d6d6d6}

@media (max-width:820px){
  .us .stats{grid-template-columns:repeat(2,1fr)}
  .us .selects{grid-template-columns:1fr 1fr}
  .us .facts{grid-template-columns:repeat(2,1fr)}
  .us .slots,.us .psqs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .us .money{grid-template-columns:1fr 1fr}
  .us .mbox.net{grid-column:1 / -1}
}
@media (max-width:520px){
  .us .wrap{padding:0 14px}
  .us h1{font-size:28px}
  .us .tiles{grid-template-columns:1fr;gap:10px}
  .us .tile{min-height:0;padding:14px}
  .us .ttitle{font-size:26px}
  .us .evtabs{gap:6px}
  .us .evtab{padding:10px}
  .us .evtab b{font-size:22px}
  .us .evtab b small{font-size:14px}
  .us .evtab > span{font-size:10.5px;letter-spacing:.06em}
  .us .evtab > small{font-size:11px;line-height:1.3}
  .us .chips.scroll{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin:0 -14px;padding:0 14px}
  .us .chips.scroll::-webkit-scrollbar{display:none}
  .us .selects{grid-template-columns:1fr}
  .us .row2{grid-template-columns:1fr}
  .us .phead{flex-direction:column}
  .us .pav{flex-direction:row;align-items:center}
  .us .pname h2{font-size:32px}
  .us .rowacts{width:100%}
  .us .tick{flex:1 1 auto}
  .us .exports{width:100%}
  .us .export{flex:1 1 0}
  .us .mbox b{font-size:26px}
  .us .psq{min-height:116px}
  .us .psq b{font-size:34px}
  .us .expadd{grid-template-columns:1fr 1fr}
  .us .expadd .save{grid-column:1 / -1}
  .us .modalwrap{padding:24px 10px}
}
@media (prefers-reduced-motion:reduce){
  .us .tri path,.us .loadbar i{animation:none;stroke-dashoffset:0}
  .us .card,.us .tile{transition:none}
}
/* Wildcard */
.us .tick.pay.free{background:#fff;border-color:#fff;color:#000}
.us .payopt.free{border-color:#fff;color:#fff}

/* Who paid what */
.us .paylist{list-style:none;margin:0;padding:0;border:2px solid #333}
.us .paylist li{border-bottom:1px solid #222}
.us .paylist li:last-child{border-bottom:0}
.us .plbtn,.us .pltotal{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 12px}
.us .plbtn{background:none;border:0;color:#fff;font:inherit;text-align:left;cursor:pointer}
.us .plbtn:hover{background:#141414}
.us .plwho{display:flex;flex-direction:column;min-width:0}
.us .pln{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
.us .pls{font-size:12.5px;color:var(--grey)}
.us .pl-paid .pls{color:var(--green)}
.us .pl-free .pls{color:#fff}
.us .pl-later .pls{color:var(--amber)}
.us .plbtn b,.us .pltotal b{font-family:var(--display);font-weight:900;font-size:21px;text-align:right}
.us .plbtn em{font-style:normal;color:var(--amber);font-family:var(--body);font-weight:600;font-size:14px}
.us .pltotal{background:#111}
.us .pltotal b{color:var(--green);font-size:26px}

/* Snapshot charts */
.us .snap{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.us .snapcard{border:2px solid #333;background:var(--card);padding:16px;display:flex;flex-direction:column;gap:14px;min-width:0}
.us .snapt{margin:0;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:var(--grey);font-weight:600}
.us .donut{width:190px;height:190px;align-self:center;overflow:visible}
.us .dseg{animation:usdonut 1s cubic-bezier(.2,.7,.2,1) both}
@keyframes usdonut{from{stroke-dasharray:0 1000}}
.us .dbig{fill:#fff;font-family:var(--display);font-weight:900;font-size:48px}
.us .dsub{fill:#9a9a9a;font-family:var(--body);font-size:13px;font-weight:600}
.us .legend{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px}
.us .legend li{display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:8px;align-items:center;font-size:13.5px}
.us .legend i{width:12px;height:12px;display:block}
.us .legend b{font-family:var(--display);font-weight:900;font-size:18px}
.us .bars{display:flex;flex-direction:column;gap:11px}
.us .bar{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,2fr) 30px;gap:10px;align-items:center}
.us .bl{font-size:13.5px;line-height:1.25;word-break:break-word}
.us .bt{height:14px;background:#1d1d1d;display:block;overflow:hidden}
.us .bt i{display:block;height:100%;transform-origin:left center;animation:usgrow .8s cubic-bezier(.2,.7,.2,1) both}
@keyframes usgrow{from{transform:scaleX(0)}}
.us .bar b{font-family:var(--display);font-weight:900;font-size:20px;text-align:right}
@media (max-width:520px){
  .us .bar{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 26px}
  .us .donut{width:170px;height:170px}
}
@media (prefers-reduced-motion:reduce){
  .us .dseg,.us .bt i{animation:none}
}
  /* Planning: sub-tabs, producers +, lead picks, filter, clickable name lists */
.us .drawer{z-index:50}
.us .subtabs{display:flex;gap:8px}
.us .subtab{font:inherit;font-size:14px;font-weight:600;padding:7px 16px;background:transparent;color:#bbb;border:2px solid #444;cursor:pointer}
.us .subtab:hover{border-color:#fff;color:#fff}
.us .subtab.on{border-color:var(--pink);color:#fff;background:#1a0610}
.us .phead2{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.us .phead2 h3{margin:0}
.us .addsq{width:28px;height:28px;padding:0;display:inline-flex;align-items:center;justify-content:center;font:inherit;font-size:20px;font-weight:600;line-height:1;background:transparent;color:#fff;border:2px solid #fff;cursor:pointer}
.us .addsq:hover{border-color:var(--pink);color:var(--pink)}
.us .leadbox{width:100%;display:flex;align-items:center;gap:16px;text-align:left;font:inherit;color:#fff;background:var(--pink);border:2px solid var(--pink);padding:14px 16px;cursor:pointer}
.us .leadbox b{font-family:var(--display);font-weight:900;font-size:44px;line-height:1}
.us .leadbox span{font-weight:600;font-size:15px}
.us .leadbox:hover{border-color:#fff}
.us .leadbox:disabled{background:var(--card);border-color:#333;color:var(--grey);cursor:default}
.us .plmain{flex:1;display:flex;align-items:center;gap:10px;background:none;border:0;color:#fff;font:inherit;text-align:left;cursor:pointer;min-width:0;padding:2px 0}
.us .plmain:hover b{color:var(--pink)}
.us .plmain .ptext{min-width:0}
.us .plmain .meta{overflow:hidden;text-overflow:ellipsis}
.us .fbar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}
.us .fcount{font-size:15px;color:#ccc}
.us .fcount b{font-family:var(--display);font-weight:900;font-size:28px;color:#fff}
.us .fbtns{display:flex;gap:8px}
.us .fdims{display:flex;flex-direction:column;gap:16px;margin-top:6px}
.us .fdim h4{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--grey);font-weight:600}
.us .flist{border:2px solid #333;background:var(--card);padding:4px 12px}
.us .flist .plrow:last-child{border-bottom:0}`;