# Component Library & Design System

This folder contains all reusable UI components, design tokens, and styling guidelines for the RapidTech Pro application.

## Folder Structure

```
components/
├── typography/        # Text & heading components
├── form/             # Input, Button, and form components
├── ui/               # Layout and container components
├── layout/           # Page layout components
└── index.ts          # Central export file
```

---

## Quick Import Guide

```typescript
// Import components from the central index
import { 
  Heading, Paragraph, Label, Text,
  Button, Input,
  Card, Container, Flex, Grid, Alert,
  colors, typography, spacing
} from '@/components';
```

---

## Typography Components

### Heading
Creates semantic heading elements (h1-h6) with consistent styling.

```typescript
import { Heading } from '@/components';

<Heading level={1}>Main Title</Heading>
<Heading level={2} color="#FF0000">Colored Heading</Heading>
<Heading level={3} weight="semibold">Semi-bold Heading</Heading>
```

**Props:**
- `level` (1-6): Heading level (default: 1)
- `color`: Text color (default: gray-900)
- `weight`: 'bold' | 'semibold' | 'medium' | 'normal'
- `className`: Additional CSS classes

---

### Paragraph
Standard paragraph text with customizable size and weight.

```typescript
import { Paragraph } from '@/components';

<Paragraph>Regular paragraph text</Paragraph>
<Paragraph size="lg" weight="semibold">Large semi-bold text</Paragraph>
<Paragraph color={colors.gray[600]}>Gray text</Paragraph>
```

**Props:**
- `size`: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
- `weight`: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
- `color`: Text color

---

### Label
Form label component with optional required indicator.

```typescript
import { Label } from '@/components';

<Label htmlFor="email">Email Address</Label>
<Label htmlFor="password" required>Password</Label>
```

**Props:**
- `htmlFor`: Connect to input id
- `required`: Shows red asterisk
- `color`: Text color

---

### Text
Flexible text component with customizable styling.

```typescript
import { Text } from '@/components';

<Text>Inline text</Text>
<Text as="div" size="lg" weight="bold">Block text</Text>
<Text as="span" color={colors.primary}>Colored text</Text>
```

**Props:**
- `as`: 'span' | 'div' | 'p'
- `size`: 'xs' | 'sm' | 'base' | 'lg'
- `weight`: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
- `color`: Text color

---

## Form Components

### Button
Primary call-to-action button with multiple variants and sizes.

```typescript
import { Button } from '@/components';

<Button>Default Button</Button>
<Button variant="primary" size="lg">Large Primary</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="danger">Delete Action</Button>
<Button variant="ghost">Subtle Button</Button>
<Button fullWidth>Full Width Button</Button>
<Button isLoading={loading}>Loading...</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: Shows loading state and disables button
- `fullWidth`: Spans 100% of container
- All standard button HTML attributes

---

### Input
Text input with label, error handling, and size variants.

```typescript
import { Input } from '@/components';

<Input
  label="Email Address"
  placeholder="you@example.com"
  type="email"
  required
/>

<Input
  label="Password"
  type="password"
  error="Password is required"
/>

<Input
  label="Name"
  size="lg"
  placeholder="John Doe"
/>
```

**Props:**
- `label`: Display label above input
- `error`: Shows error message below input (turns border red)
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `required`: Adds red asterisk to label
- All standard input HTML attributes

---

## UI Components

### Card
Container with shadow and optional border styling.

```typescript
import { Card } from '@/components';

<Card>
  <Heading level={3}>Card Title</Heading>
  <Paragraph>Card content goes here</Paragraph>
</Card>

<Card variant="outlined" padding={spacing[8]}>
  <Text>Outlined card with custom padding</Text>
</Card>
```

**Props:**
- `variant`: 'default' | 'outlined' (default: 'default')
- `padding`: Custom padding (default: spacing[6])

---

### Container
Responsive max-width container for page content.

```typescript
import { Container } from '@/components';

<Container maxWidth="lg">
  <Heading>Page Content</Heading>
</Container>
```

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

---

### Flex
Flexible container for horizontal or vertical layouts.

```typescript
import { Flex } from '@/components';

<Flex gap={spacing[4]} justify="between" align="center">
  <Text>Left</Text>
  <Button>Right</Button>
</Flex>

<Flex direction="column" gap={spacing[2]}>
  <Input label="First Name" />
  <Input label="Last Name" />
</Flex>
```

**Props:**
- `direction`: 'row' | 'column' (default: 'row')
- `justify`: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
- `align`: 'start' | 'center' | 'end' | 'stretch'
- `gap`: Spacing between items
- `wrap`: Allow items to wrap

---

### Grid
CSS Grid layout for multi-column layouts.

```typescript
import { Grid } from '@/components';

<Grid cols={3} gap={spacing[6]}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

**Props:**
- `cols`: 1 | 2 | 3 | 4 | 6
- `gap`: Spacing between items

---

### Alert
Status alert box for messages and notifications.

```typescript
import { Alert } from '@/components';

<Alert type="success">Operation completed successfully!</Alert>
<Alert type="error">An error occurred. Please try again.</Alert>
<Alert type="warning">This action cannot be undone.</Alert>
<Alert type="info">Here's some helpful information.</Alert>
```

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info' (default: 'info')

---

## Design Tokens

Located in `lib/design/tokens.ts`, these are the canonical values for styling:

### Colors
```typescript
import { colors } from '@/components';

colors.primary        // #7C3AED (Purple)
colors.secondary      // #EC4899 (Pink)
colors.success        // #10B981 (Green)
colors.error          // #EF4444 (Red)
colors.warning        // #F59E0B (Orange)
colors.info           // #3B82F6 (Blue)
colors.gray           // Object with 50-900 gray scale
colors.white
colors.black
```

### Typography
```typescript
typography.fontFamily.base  // System fonts
typography.fontFamily.mono  // Monospace fonts
typography.fontSize         // xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl
typography.fontWeight       // light, normal, medium, semibold, bold, extrabold
typography.lineHeight       // tight, snug, normal, relaxed, loose
```

### Spacing
```typescript
spacing[1]    // 4px
spacing[2]    // 8px
spacing[4]    // 16px
spacing[6]    // 24px
spacing[8]    // 32px
// ... and more
```

### Other
```typescript
borderRadius   // none, sm, base, md, lg, xl, 2xl, 3xl, full
shadows        // none, sm, base, md, lg, xl
transitions    // base, color, bgColor, transform, opacity
```

---

## Example: Login Form

```typescript
import {
  Heading, Paragraph, Label, Input, Button, Card, Flex,
  colors, spacing
} from '@/components';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <Card>
      <Heading level={2}>Admin Login</Heading>
      <Paragraph>Enter your credentials below</Paragraph>

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error ? 'Invalid credentials' : ''}
        placeholder="admin@company.com"
        required
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
      />

      <Flex gap={spacing[4]} justify="end" style={{ marginTop: spacing[6] }}>
        <Button variant="ghost">Cancel</Button>
        <Button
          variant="primary"
          isLoading={loading}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Flex>
    </Card>
  );
}
```

---

## Guidelines

1. **Always use color tokens** - Don't hardcode colors, use the `colors` object
2. **Use spacing consistently** - Apply spacing using the `spacing` object
3. **Compose components** - Build complex UIs by combining simpler components
4. **Keep it responsive** - Use Flex and Grid for layouts that work on all screen sizes
5. **Maintain contrast** - Ensure text is readable on all backgrounds

---

## Contributing

When adding new components:
1. Place them in the appropriate folder
2. Export from the central `components/index.ts`
3. Add documentation here
4. Use design tokens for all values
5. Test on mobile and desktop
