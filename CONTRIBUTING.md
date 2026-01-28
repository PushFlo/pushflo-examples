# Contributing to PushFlo Examples

Thank you for your interest in contributing to PushFlo Examples! This document provides guidelines for contributing new examples or improving existing ones.

## Code of Conduct

Be respectful and constructive in all interactions.

## How to Contribute

### Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include example name, Node.js version, and steps to reproduce

### Adding New Examples

1. **Choose the Right Category**
   - `core/` - Fundamental patterns (pub/sub, presence, history)
   - `frameworks/` - Framework-specific templates
   - `use-cases/` - Real-world application examples

2. **Follow the Standard Structure**
   ```
   example-name/
   ├── README.md           # Required
   ├── env.example         # Required
   ├── package.json        # Required
   ├── src/                # Source code
   └── test/
       └── smoke.test.ts   # Required for CI
   ```

3. **README Requirements**

   Every example README must include:
   - **Purpose** - 1-2 lines explaining what it demonstrates
   - **What You'll Learn** - 3-4 bullet points
   - **Prerequisites** - Node version, dependencies
   - **Quick Start** - 4-5 copy-paste commands (60 seconds max)
   - **How It Works** - Architecture explanation
   - **Key Files** - File descriptions
   - **Troubleshooting** - Common issues
   - **Next Steps** - Links to related examples

4. **Code Standards**
   - Use TypeScript where possible
   - Include type definitions
   - Follow existing code style (Prettier defaults)
   - Pin dependency versions in package.json
   - No console.log in production code (use debug flags)

5. **Testing Requirements**
   - Include smoke tests that pass against the mock server
   - Tests must complete in under 60 seconds
   - No external API dependencies in tests

### Example Quality Checklist

Before submitting, ensure your example:

- [ ] Installs cleanly with `npm install`
- [ ] Runs with `npm run dev` or `npm start`
- [ ] Works with the mock server (no real API keys needed for CI)
- [ ] Has all required files (README, env.example, package.json, tests)
- [ ] Uses pinned dependency versions
- [ ] Includes inline comments explaining key concepts
- [ ] Passes ESLint with no warnings

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`feature/nextjs-pages-router`)
3. Make your changes
4. Run tests locally
5. Submit a pull request with:
   - Description of what the example demonstrates
   - Screenshots if applicable
   - Checklist confirmation

### Improving Existing Examples

- Fix bugs and update dependencies
- Improve documentation
- Add edge case handling
- Optimize performance

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/examples.git
cd examples

# Start mock server
cd shared/mock-server
npm install
npm start

# In another terminal, run an example
cd frameworks/nextjs
npm install
npm run dev
```

## Style Guide

### TypeScript

```typescript
// Use explicit types for function parameters
function publishMessage(channel: string, data: MessagePayload): Promise<void>

// Use interfaces for complex objects
interface MessagePayload {
  type: string
  content: Record<string, unknown>
}

// Prefer const over let
const client = new PushFloClient({ publishKey })
```

### Environment Variables

```bash
# Use descriptive names with PUSHFLO_ prefix
PUSHFLO_SECRET_KEY=sec_xxx
PUSHFLO_PUBLISH_KEY=pub_xxx

# Framework-specific prefixes as needed
NEXT_PUBLIC_PUSHFLO_PUBLISH_KEY=pub_xxx
VITE_PUSHFLO_PUBLISH_KEY=pub_xxx
```

### Error Handling

```typescript
// Always handle errors gracefully
try {
  await client.connect()
} catch (error) {
  console.error('Connection failed:', error.message)
  // Provide helpful recovery suggestions
}
```

## Questions?

- Open a GitHub Discussion for general questions
- Check existing issues before creating new ones
- Join our Discord for real-time help

Thank you for contributing!
