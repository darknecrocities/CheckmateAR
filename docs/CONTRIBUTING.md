# Contributing to CheckmateAR

Thank you for your interest in contributing to CheckmateAR! We welcome contributions to our computer vision algorithms, AR visualizations, chess engine integration, and offline coach.

---

## Code of Conduct & Standards

CheckmateAR enforces strict engineering standards to ensure high-performance, maintainable software:

1. **500-Line Physical Ceiling**: No source file may exceed 500 physical lines. Modules approaching 350 lines should be decomposed into cohesive domain slices (target sweet spot: 150–250 lines).
2. **Cognitive Hygiene**: Maximum 40 physical lines per function, maximum 3 levels of nesting with early return guard clauses, and cyclomatic complexity $\le 10$.
3. **Anti-AI-Slop**:
   - Zero decorative badges (`shields.io`).
   - Zero fake mock databases or synthetic mock arrays pretending to be persistence.
   - Zero neon purple gradients or glowing card-soup layouts.
   - Zero raw emojis in interactive controls; use semantic Lucide SVG icons.
4. **Offline First**: All core capabilities must operate 100% locally on-device.

---

## Development Workflow

### 1. Fork & Clone
```bash
git clone https://github.com/darknecrocities/CheckmateAR.git
cd CheckmateAR
npm install
```

### 2. Branching Discipline
Use semantic branch prefixes:
- `feat/feature-name`
- `fix/bug-description`
- `refactor/subsystem-name`
- `test/test-suite-name`

### 3. Verification Gates
Before opening a pull request, all quality gates must pass:
```bash
# Run unit and integration tests
npm test

# Verify TypeScript typecheck
npx tsc --noEmit
```

### 4. Commit Standards
Follow the Conventional Commits specification:
```
<type>(<scope>): <short summary in imperative mood>

[optional body explaining WHY, WHAT, and VERIFICATION]
```

Example types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`.
