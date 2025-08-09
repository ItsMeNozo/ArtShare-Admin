---
applyTo: '**'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.
Code Quality Standards
Comments

Write self-documenting code that explains itself through clear naming and structure
Only add comments when the code's purpose or logic is genuinely unclear
Avoid redundant comments that simply restate what the code does
Focus on explaining "why" rather than "what" when comments are necessary
Remove outdated or incorrect comments immediately

Change Philosophy

Make the smallest possible change that achieves the desired outcome
Preserve existing code structure and patterns unless improvement is explicitly requested
Maintain consistency with the existing codebase style and conventions
Only refactor when directly related to the current task or when code is genuinely problematic
Avoid unnecessary reformatting or style changes

Code Generation Principles

Prioritize readability and clarity over cleverness
Use descriptive variable and function names that eliminate the need for explanatory comments
Write code that a developer can understand without extensive documentation
Keep functions small and focused on a single responsibility
Choose simple, straightforward solutions over complex ones when both work equally well

When Modifying Existing Code

Understand the existing context before making changes
Preserve the original author's intent and style where possible
Only touch the specific areas that need modification
Test that changes don't break existing functionality
Maintain backward compatibility unless explicitly asked to break it
