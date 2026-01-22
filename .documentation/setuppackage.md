# Documentation Framework Setup

<!--
This file explains how to set up the project documentation framework.
UPDATE TRIGGERS:
- Framework version updates
- Process improvements
-->

## Overview

This documentation framework provides 13 standardized files for comprehensive project documentation. It integrates with Claude Code for automated documentation maintenance.

## Quick Setup

Run in Claude Code:

```
/docs init
```

This automatically:
1. Creates `.documentation/` folder
2. Copies all 13 templates
3. Creates/updates `.claude/CLAUDE.md` with documentation references

---

## Manual Setup

### 1. Create documentation folder

```bash
mkdir -p .documentation
```

### 2. Copy templates

Copy all templates from `~/.claude/skills/project-docs/templates/` to your project's `.documentation/` folder:

```bash
cp ~/.claude/skills/project-docs/templates/*.md .documentation/
```

### 3. Create CLAUDE.md

Create `.claude/CLAUDE.md` with:

```markdown
# Claude Code Instructions

## Documentation

All project documentation is in `.documentation/`

### Session Start
1. Read `.documentation/state.md` for current focus
2. Check `.documentation/relevantskills.md` for active skills

### Before Commits
1. Update `.documentation/changelog.md`
2. Update `.documentation/state.md` if tasks complete

### Before Deploy
1. Run vibe-coding-guardian
2. Update `.documentation/codereview.md`
3. Verify `.documentation/deploy.md` checklist
```

### 4. Customize templates

Update each file with project-specific information. Priority order:

1. **state.md** - Current project focus
2. **briefing.md** - Architecture and tech stack
3. **environments.md** - Environment setup
4. **onboarding.md** - Developer quickstart

---

## Folder Structure

After setup, your project should have:

```
project/
├── .claude/
│   └── CLAUDE.md              # Claude Code instructions
├── .documentation/
│   ├── state.md               # Project memory
│   ├── changelog.md           # Release notes
│   ├── briefing.md            # Architecture
│   ├── knowledgebase.md       # Code docs
│   ├── relevantskills.md      # Active skills
│   ├── tools.md               # Connected tools
│   ├── codereview.md          # Security review
│   ├── deploy.md              # Deployment guide
│   ├── testing.md             # Test strategy
│   ├── environments.md        # Env configuration
│   ├── onboarding.md          # Developer guide
│   ├── troubleshooting.md     # Common issues
│   └── setuppackage.md        # This file
└── ... (project files)
```

---

## Documentation Files Overview

### Core Files (8)

| File | Purpose |
|------|---------|
| state.md | Project memory, current focus, decisions |
| changelog.md | Release notes with timestamps |
| briefing.md | Architecture, tech stack, patterns |
| knowledgebase.md | Code documentation |
| relevantskills.md | Claude Code skills to apply |
| tools.md | Connected MCP servers, APIs |
| codereview.md | Security and architecture review |
| deploy.md | Deployment procedures |

### Extended Files (4)

| File | Purpose |
|------|---------|
| testing.md | Test strategy and commands |
| environments.md | Environment configuration |
| onboarding.md | New developer quickstart |
| troubleshooting.md | Common issues and solutions |

---

## Docs Audit

Run `/docs audit` to check documentation completeness:

```
Documentation Audit Report
==========================

Core Files (8):
[X] state.md - Last updated: 2026-01-19
[X] changelog.md - Last updated: 2026-01-19
[ ] briefing.md - MISSING
...

Completeness: 75%

Recommendations:
- Create briefing.md
- Update environments.md
```

---

## Best Practices

### Keep Documentation Current

- Update state.md at session start/end
- Update changelog.md after every commit
- Review briefing.md when architecture changes

### Use Update Triggers

Each file has comments listing when to update. Claude Code uses these triggers to suggest updates.

### Integrate with Workflow

- Add docs review to PR checklist
- Include docs update in Definition of Done
- Schedule monthly docs audit

---

## Git Configuration

Add to `.gitignore` if you want to keep some docs local:

```gitignore
# Keep sensitive docs local (optional)
.documentation/credentials.md
```

Recommended to commit all documentation for team sharing.

---

## Troubleshooting

### Skill not triggering

1. Ensure skill is loaded: `/skills`
2. Restart Claude Code
3. Use explicit command: `/docs init`

### Templates not found

1. Verify skill location: `ls ~/.claude/skills/project-docs/templates/`
2. Reinstall skill if missing
