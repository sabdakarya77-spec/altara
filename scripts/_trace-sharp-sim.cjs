// Simulates the Alpine/musl layout of sharp 0.35.5 and runs Next.js' real
// file tracer (@vercel/nft) to see which files would be captured.
const path = require("node:path");
const fs = require("node:fs");
const { nodeFileTrace } = require("next/dist/compiled/@vercel/nft");

// ---- Minimal ELF parser: DT_NEEDED / RPATH / RUNPATH -------------------
const readElf = (file) => {
  const buf = fs.readFileSync(file);
  if (buf[0] !== 0x7f || buf[1] !== 0x45 || buf[2] !== 0x4c || buf[3] !== 0x46) {
    throw new Error("not an ELF file: " + file);
  }
  const is64 = buf[4] === 2;
  const u16 = (o) => buf.readUInt16LE(o);
  const u32 = (o) => buf.readUInt32LE(o);
  const u64 = (o) => Number(buf.readBigUInt64LE(o));

  const e_phoff = is64 ? u64(0x20) : u32(0x1c);
  const e_phentsize = u16(is64 ? 0x36 : 0x2a);
  const e_phnum = u16(is64 ? 0x38 : 0x2c);

  const PT_LOAD = 1;
  const PT_DYNAMIC = 2;
  const PT_INTERP = 3;

  const loads = [];
  let dyn = null;
  let interp = null;

  for (let i = 0; i < e_phnum; i++) {
    const o = e_phoff + i * e_phentsize;
    const type = u32(o);
    const pOffset = is64 ? u64(o + 0x08) : u32(o + 0x04);
    const pVaddr = is64 ? u64(o + 0x10) : u32(o + 0x08);
    const pFilesz = is64 ? u64(o + 0x20) : u32(o + 0x10);
    const pMemsz = is64 ? u64(o + 0x28) : u32(o + 0x14);
    if (type === PT_LOAD) {
      loads.push({ offset: pOffset, vaddr: pVaddr, filesz: pFilesz, memsz: pMemsz });
    } else if (type === PT_DYNAMIC) {
      dyn = { offset: pOffset, filesz: pFilesz };
    } else if (type === PT_INTERP) {
      interp = buf.subarray(pOffset, pOffset + pFilesz).toString("utf8").replace(/\0+$/, "");
    }
  }

  // Map a virtual address to a file offset using the PT_LOAD segments.
  const vaddrToOffset = (vaddr) => {
    for (const s of loads) {
      if (vaddr >= s.vaddr && vaddr < s.vaddr + s.filesz) {
        return s.offset + (vaddr - s.vaddr);
      }
    }
    return -1;
  };

  if (!dyn) return { interp, needed: [], rpath: [] };

  // Walk the dynamic table collecting tag -> value.
  const dyns = new Map();
  const entrySize = is64 ? 16 : 8;
  for (let o = dyn.offset; o + entrySize <= dyn.offset + dyn.filesz; o += entrySize) {
    const tag = is64 ? buf.readBigInt64LE(o) : BigInt(buf.readInt32LE(o));
    const val = is64 ? u64(o + 8) : u32(o + 4);
    if (tag === 0n) break;
    dyns.set(Number(tag), val);
  }

  const DT_STRTAB = 5;
  const DT_STRSZ = 10;
  const DT_NEEDED = 1;
  const DT_RPATH = 15;
  const DT_RUNPATH = 29;

  const strtabVaddr = dyns.get(DT_STRTAB);
  const strtabSize = dyns.get(DT_STRSZ) ?? 0;
  if (strtabVaddr === undefined) return { interp, needed: [], rpath: [] };

  const strtabOff = vaddrToOffset(strtabVaddr);
  if (strtabOff < 0) return { interp, needed: [], rpath: [] };
  const strtab = buf.subarray(strtabOff, strtabOff + strtabSize);

  const cstr = (idx) => {
    const end = strtab.indexOf(0, idx);
    return strtab.subarray(idx, end === -1 ? strtab.length : end).toString("utf8");
  };

  const needed = [];
  const rpath = [];
  for (const [tag, val] of dyns) {
    if (tag === DT_NEEDED) needed.push(cstr(val));
    if (tag === DT_RPATH || tag === DT_RUNPATH) rpath.push(cstr(val));
  }

  return { interp, needed, rpath };
};

const base = process.argv[2];
const simRoot = process.argv[3];

// Build a fake node_modules mirroring what pnpm would install on Alpine musl.
const simNm = path.join(simRoot, "node_modules");
const imgDir = path.join(simNm, "@img");
fs.mkdirSync(imgDir, { recursive: true });

const copy = (src, dest) => {
  fs.cpSync(src, dest, { recursive: true });
};

// sharp itself (already installed locally, hoisted layout)
copy(path.join(base, "node_modules", "sharp"), path.join(simNm, "sharp"));
copy(path.join(base, "node_modules", "@img", "colour"), path.join(imgDir, "colour"));

// musl platform packages
const muslSrc = process.env.MUSL_SRC;
copy(path.join(muslSrc, "sharp-linuxmusl-x64"), path.join(imgDir, "sharp-linuxmusl-x64"));
copy(path.join(muslSrc, "sharp-libvips-linuxmusl-x64"), path.join(imgDir, "sharp-libvips-linuxmusl-x64"));

// deps of sharp
for (const d of ["detect-libc", "semver"]) {
  copy(path.join(base, "node_modules", d), path.join(simNm, d));
}

// entry: a file that requires sharp the same way the app does
const entry = path.join(simRoot, "entry.js");
fs.writeFileSync(entry, 'const sharp = require("sharp");\nmodule.exports = sharp;\n');

(async () => {
  const { fileList, warnings } = await nodeFileTrace([entry], {
    base: simRoot,
    processCwd: simRoot,
  });
  if (warnings && Object.keys(warnings).length) {
    console.log("WARNINGS:", JSON.stringify(warnings, null, 1).slice(0, 3000));
  }
  const list =
    fileList instanceof Set || fileList instanceof Map
      ? Array.from(fileList.keys())
      : Array.isArray(fileList)
        ? fileList
        : Object.keys(fileList);
  const rel = list
    .map((f) => (path.isAbsolute(f) ? path.relative(simRoot, f) : f))
    .filter((f) => f.startsWith("node_modules"))
    .sort();
  console.log(rel.join("\n"));
  console.log("---");
  console.log("sharp native present:", rel.some((f) => f.includes("sharp-linuxmusl-x64") && f.endsWith(".node")));
  console.log(
    "libvips .so present:",
    rel.some(
      (f) =>
        f.includes("sharp-libvips-linuxmusl-x64") &&
        (f.endsWith(".so") || f.includes(".so.")),
    ),
  );

  // ---- ELF analysis of the musl binaries ----
  const sharpNode = path.join(
    simNm,
    "@img",
    "sharp-linuxmusl-x64",
    "lib",
    "sharp-linuxmusl-x64-0.35.5.node",
  );
  const libvipsSo = path.join(
    simNm,
    "@img",
    "sharp-libvips-linuxmusl-x64",
    "lib",
    "libvips-cpp.so.8.18.7",
  );
  for (const f of [sharpNode, libvipsSo]) {
    if (!fs.existsSync(f)) {
      console.log("ELF missing:", f);
      continue;
    }
    const info = readElf(f);
    console.log("---", path.basename(f));
    console.log("  interp :", info.interp);
    console.log("  needed :", info.needed.join(", ") || "(none)");
    console.log("  rpath  :", info.rpath.join(" | ") || "(none)");
  }
})();
