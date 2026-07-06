const fs = require('fs');
const path = 'src/features/landing/LandingPage.tsx';
let c = fs.readFileSync(path, 'utf8');

// Fix 1: Numbers section - motion.div opened, </div> closed  (line ~529)
// Find the pattern and replace </div> with </motion.div>
const oldNum = `                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">{s.label}</p>\r\n                </div>`;
const newNum = `                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">{s.label}</p>\r\n                </motion.div>`;
if (c.includes(oldNum)) {
  c = c.replace(oldNum, newNum);
  console.log('Fix 1 applied');
} else {
  // try LF
  const oldNumLF = `                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">{s.label}</p>\n                </div>`;
  const newNumLF = `                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">{s.label}</p>\n                </motion.div>`;
  if (c.includes(oldNumLF)) {
    c = c.replace(oldNumLF, newNumLF);
    console.log('Fix 1 applied (LF)');
  } else {
    console.log('Fix 1 NOT found');
  }
}

// Fix 2: Portfolio section - <div> opened, </motion.div> closed (line ~566)
const oldPort = `                </motion.div>\r\n              ))}\r\n            </motion.div>\r\n           </Reveal>`;
const newPort = `                </div>\r\n              ))}\r\n            </motion.div>\r\n           </Reveal>`;
if (c.includes(oldPort)) {
  c = c.replace(oldPort, newPort);
  console.log('Fix 2 applied');
} else {
  const oldPortLF = `                </motion.div>\n              ))}\n            </motion.div>\n           </Reveal>`;
  const newPortLF = `                </div>\n              ))}\n            </motion.div>\n           </Reveal>`;
  if (c.includes(oldPortLF)) {
    c = c.replace(oldPortLF, newPortLF);
    console.log('Fix 2 applied (LF)');
  } else {
    // try without </Reveal>
    const oldPort2 = `                </motion.div>\r\n              ))}\r\n            </motion.div>`;
    const newPort2 = `                </div>\r\n              ))}\r\n            </motion.div>`;
    if (c.includes(oldPort2)) {
      c = c.replace(oldPort2, newPort2);
      console.log('Fix 2 applied (no Reveal)');
    } else {
      console.log('Fix 2 NOT found');
      // Let's just do a raw search
      const idx = c.indexOf('</motion.div>\n              ))}\n            </motion.div>');
      console.log('LF idx:', idx);
      const idx2 = c.indexOf('</motion.div>\r\n              ))}\r\n            </motion.div>');
      console.log('CRLF idx:', idx2);
    }
  }
}

fs.writeFileSync(path, c, 'utf8');
console.log('Done');
