# UI/UX Design Bible

Comprehensive design rules for creating consistent, professional interfaces.
Based on rules-design-bible by saralobo.

---

## FUNDAMENTAL PRINCIPLES

### Before Creating Any Screen
1. Define visual hierarchy — What should user see FIRST? SECOND? THIRD?
2. One primary action per screen — Never compete with 2 CTAs of equal weight
3. White space is clarity, not waste
4. Consistency over creativity — Follow the design system
5. Mobile-first approach

### 4 Pillars of Visual Design

**1. Hierarchy**
- Size: Most important = largest
- Weight: Bold headings, regular body
- Color: Vibrant for actions, neutrals for support
- Position: F-pattern (web) or centered (mobile)
- Spacing: More space = more importance

**2. Contrast**
- Text/background: minimum 4.5:1 ratio (WCAG AA)
- Large text (>18px bold): minimum 3:1
- NEVER light gray on white
- Dark mode: Use #E0E0E0 on #121212 (not pure white on black)

**3. Alignment**
- Everything aligns to something
- 8px grid for EVERYTHING
- Left-align by default
- Center only for titles, modals, empty states

**4. Proximity**
- Related items: 8-12px
- Unrelated items: 24-32px+
- Space between groups ≥ 2× space within groups
- Label + Input: 4-8px gap

---

## UX LAWS

### Fitts's Law
- Primary CTA: ALWAYS largest, minimum 48px height
- Destructive actions: Smaller and farther from main CTA
- FAB: 56×56px, bottom-right (thumb zone)
- NEVER place primary action in top-left corner (mobile)

### Hick's Law
- Main navigation: Maximum 5 items
- Options: If >7 items, group into categories
- Form: Maximum 5-7 visible fields
- Actions per screen: 1 primary + maximum 2 secondary

### Jakob's Law
- Use familiar patterns (bottom nav, back button top-left)
- Don't invent custom gestures without onboarding
- Standard icons: search 🔍, settings ⚙️

### Miller's Law
- Chunk information into 4-5 items max
- Phone: (11) 9 8765-4321
- Card: 1234 5678 9012 3456

### Doherty Threshold
- Response < 400ms feels instant
- Use loading states for 200ms+ operations

---

## LAYOUT & SPACING (8px Grid)

### Spacing Scale
| Token | Value | Use |
|---|---|---|
| space-xxs | 2px | Fine adjustment |
| space-xs | 4px | Label → Input |
| space-sm | 8px | Items in same group |
| space-md | 12px | Chip/badge padding |
| space-base | 16px | Button padding, input gap |
| space-lg | 24px | Card padding, screen margins |
| space-xl | 32px | Between sections |
| space-2xl | 40px | Strong separation |
| space-3xl | 48px | Large content blocks |
| space-4xl | 64px | Hero space |

### Screen Margins
| Screen | Side Margins | Max Content |
|---|---|---|
| Mobile (<428px) | 16-24px | Full width |
| Tablet (428-1024px) | 24-32px | 600px centered |
| Desktop (>1024px) | Auto | 1200px centered |

### Golden Rule
> Space BETWEEN groups ≥ 2× space WITHIN a group

---

## TYPOGRAPHY

### Type Scale
| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| display-xl | 40px | 700 | 48px | Hero, splash |
| display-lg | 32px | 700 | 40px | Large values |
| heading-xl | 28px | 600 | 36px | Screen title |
| heading-lg | 24px | 600 | 32px | Section title |
| heading-md | 20px | 600 | 28px | Card title |
| heading-sm | 18px | 600 | 24px | Smaller subtitle |
| body-lg | 16px | 400 | 24px | Main body, inputs |
| body-md | 14px | 400 | 20px | Secondary text |
| body-sm | 12px | 400 | 16px | Caption, helper |
| body-xs | 10px | 500 | 14px | Badge, overline |

### Rules
- Body text: minimum 16px
- Caption: minimum 12px
- Input text: minimum 16px (prevents iOS auto-zoom)
- Line-height must be multiple of 4
- Line-height formula: 16px × 1.5 = 24px ✅ | 16px × 1.4 = 22.4px ❌

---

## COLORS

### Required Semantic Colors
| Token | Meaning | Light | Dark |
|---|---|---|---|
| accent | Primary action, links | #276EF1 | #5B8DEF |
| positive | Success, confirmation | #0E8345 | #34C759 |
| warning | Alert, attention | #F6BC2F | #FFD60A |
| negative | Error, danger, deletion | #DE1135 | #FF453A |
| neutral | Text, borders, backgrounds | #1A1A1A | #E0E0E0 |

### Neutral Palette (Light Mode)
| Token | Hex | Use |
|---|---|---|
| neutral-900 | #1A1A1A | Primary text (headings) |
| neutral-800 | #333333 | Primary text (body) |
| neutral-600 | #666666 | Secondary text |
| neutral-400 | #999999 | Placeholder, disabled |
| neutral-300 | #CCCCCC | Borders, dividers |
| neutral-200 | #E5E5E5 | Subtle borders |
| neutral-100 | #F0F0F0 | Surface background |
| neutral-50 | #F8F8F8 | Alternative background |
| white | #FFFFFF | Main background |

---

## BUTTONS & CTA

### Hierarchy (MAX 3 levels per screen)
| Level | Style | Per Screen |
|---|---|---|
| Primary | Filled accent | **1 ONLY** |
| Secondary | Outlined | Max 2 |
| Tertiary | Ghost/text | Unlimited |

### Sizes
| Size | Height | H Padding | Font |
|---|---|---|---|
| XSmall | 32px | 12px | 12px |
| Small | 36px | 16px | 14px |
| Medium | 44px | 20px | 14-16px |
| Large | 48-56px | 24px | 16px |

### Touch Targets
- Absolute minimum: 44×44px (iOS) / 48×48dp (Android)
- Spacing between: minimum 8px
- Circular button: width = height, cornerRadius = width/2

### Button States
| State | Visual |
|---|---|
| Default | Normal colors |
| Hover | Slightly darker bg |
| Pressed | Scale 0.97-0.98, darker bg |
| Focused | 2px accent ring |
| Disabled | Opacity 40% |
| Loading | Spinner, maintain size |

---

## FORMS & INPUTS

### Input Anatomy
```
┌──────────────────────────────────┐
│  Label                           │  ← 14px SemiBold
│  ┌────────────────────────────┐  │
│  │ 🔍  Placeholder text       │  │  ← 16px Regular
│  └────────────────────────────┘  │  ← Height: 48-56px
│  Helper text                     │  ← 12px Regular
└──────────────────────────────────┘
```

### Spacing
| Gap | Value |
|---|---|
| Label → Input | 4-8px |
| Input → Helper | 4px |
| Field → Field | 16-20px |
| Group → Group | 32px |

### Input States
| State | Border | Background | Label |
|---|---|---|---|
| Default | 1px neutral-300 | White | neutral-600 |
| Hover | 1px neutral-800 | White | neutral-600 |
| Focused | 2px accent | White | accent |
| Error | 2px negative | red 4% bg | negative |
| Disabled | 1px neutral-200 | neutral-100 | neutral-400 |

### Input Sizes
| Size | Height | Use |
|---|---|---|
| Small | 40px | Inline filters |
| Medium | 48px | Default |
| Large | 56px | Main fields |

### Validation Rules
- Inline, real-time onBlur
- Don't validate while typing (except password/search)
- Error message: specific not generic
- Error = red border + icon + message

### Label Rules
- ALWAYS visible (not inside field)
- Position: ABOVE the field
- Required: red asterisk *
- Optional: "(optional)" in gray

### Input Types
- Text Field: Height 48-56px, padding 16px, border-radius 8px
- Text Area: Min height 88-120px, resize vertical only
- Select: Visual identical to text field + chevron ▼
- Password: 👁 toggle icon, strength indicator
- PIN/OTP: 48×56px per field, auto-focus next

---

## NAVIGATION

### Bottom Navigation
| Rule | Value |
|---|---|
| Number of items | 3-5 (NEVER >5) |
| Height | 56-83px |
| Icon | 24px |
| Label | 10-12px below icon |
| Active | Filled icon + accent + indicator |
| Touch target | 48×48px minimum |

### Top Navigation (Header)
| Rule | Value |
|---|---|
| Height | 44-56px |
| Back button | ← arrow, 44×44px, left |
| Title | Centered or left-aligned |
| Actions | Maximum 2 icons right |

### Tabs
| Rule | Value |
|---|---|
| Number of tabs | 2-5 |
| Active indicator | 2-3px accent line below |
| Scroll | If >4 tabs, horizontal scroll |

### Drawer/Side Menu
| Rule | Value |
|---|---|
| Width | 80% max 320px |
| Overlay | 50-60% opacity |
| Items | 48px height per item |

---

## CARDS & LISTS

### Card Anatomy
```
┌──────────────────────────────┐
│  ┌────────────────────────┐  │  ← Image: 16:9 or 4:3
│  │       Thumbnail        │  │
│  └────────────────────────┘  │
│  Title Text                  │  ← heading-md 16-18px SemiBold
│  Subtitle or description     │  ← body-md 14px, neutral-600
│  Tag   ·   Meta info         │  ← body-sm 12px
│  [ Action ]                  │
└──────────────────────────────┘
```

### Card Rules
- Border-radius: 12-16px
- Padding: 16-24px (uniform)
- Gap between cards: 12-16px
- Shadow light: 0 2px 8px rgba(0,0,0,0.08)
- Shadow dark: None (use lighter bg)

### List Item
| Position | Element | Size |
|---|---|---|
| Leading | Avatar/Icon | 40-48px |
| Center (primary) | Title | 16px SemiBold |
| Center (secondary) | Subtitle | 14px, neutral-600 |
| Trailing | Value/Time/Chevron | 14px |

### List Spacing
- Height per item: 56px (1 line), 72px (2 lines)
- Horizontal padding: 16px
- Leading → Center: 12-16px
- Divider: 1px, inset from left

---

## FEEDBACK & STATES

### Feedback Timing
| Action Type | Duration | Feedback |
|---|---|---|
| Instant | <300ms | Immediate visual change |
| Quick | 300ms-2s | Inline spinner or skeleton |
| Slow | 2s-10s | Progress bar + text |
| Very Long | >10s | Progress + "Notify when ready" |

### Toast/Snackbar
| Property | Value |
|---|---|
| Position | Bottom, above nav, 16px margin |
| Width | Full-width - 32px |
| Height | 48-56px |
| Border-radius | 8-12px |
| Duration | 3-5 seconds |
| Max chars | ~60 |

### Toast Types
| Type | Icon | Color |
|---|---|---|
| Success | ✓ | Green |
| Error | ✕ | Red |
| Warning | ⚠ | Yellow |
| Info | ℹ | Blue/Neutral |

### Loading States
- Spinner: 24px, accent color
- Skeleton: Animated shimmer effect
- Progress bar: For determinate operations

---

## MOTION & TRANSITIONS

### Duration Scale
| Token | Duration | Use |
|---|---|---|
| none | 0ms | Instant feedback |
| xs | 50ms | Micro-interactions |
| sm | 100ms | Simple state changes |
| md | 200ms | Standard transitions |
| lg | 300ms | Complex movements |
| xl | 400ms | Full page transitions |
| xxl | 500ms+ | Avoid except large elements |

### Easing Curves
| Curve | cubic-bezier | Use |
|---|---|---|
| Standard | cubic-bezier(0.4, 0.0, 0.2, 1) | Most transitions |
| Emphasized | cubic-bezier(0.2, 0.0, 0, 1.0) | Important transitions |
| Decelerate | cubic-bezier(0.05, 0.7, 0.1, 1.0) | Elements entering |
| Accelerate | cubic-bezier(0.3, 0.0, 0.8, 0.15) | Elements exiting |

### Screen Transitions
| Transition | Direction | Duration |
|---|---|---|
| Push (forward) | Slide in from right | 300ms |
| Pop (back) | Slide out to right | 250ms |
| Modal open | Slide up | 300ms |
| Modal close | Slide down | 250ms |
| Tab switch | Cross-fade | 200ms |

---

## MICRO-INTERACTIONS

### Toggle/Switch
- Track: neutral → accent/green
- Knob: Slides 150-200ms
- Haptic: light impact

### Like/Favorite
- Scale: 1.0 → 1.3 → 1.0 (bounce)
- Color: neutral → red #FF3B5C
- Duration: 300-400ms
- Optional: Particle burst

### Pull to Refresh
- Threshold: 60-80px overscroll
- Spinner: 24px accent, linear rotation
- Complete: Spinner disappears, content slides in

---

## ICONS

### Icon Sizes
| Token | Size | Use |
|---|---|---|
| icon-xs | 16×16px | Inline with small text |
| icon-sm | 20×20px | Small buttons |
| icon-md | 24×24px | **Default** — lists, nav |
| icon-lg | 28×28px | Emphasized icons |
| icon-xl | 32×32px | Empty states |
| icon-2xl | 40×40px | Card leading icons |
| icon-3xl | 48×48px | Hero icons |

### Golden Rule
> Every icon in the same context MUST have the same visual bounding box.

### Icon Containers
- Wrap icons in fixed-size container frame
- Container guarantees uniform outer dimensions
- Use same container size for all icons in same row

---

## GESTALT PRINCIPLES

### Proximity
- Within group: 8-12px
- Between groups: 24-32px
- Section separation: ≥ 2× item spacing

### Similarity
- Same color/shape/size = related

### Continuity
- Elements arranged on a line = perceived as related

### Closure
- Mind fills in gaps to complete shapes

---

## RESPONSIVENESS

### Auto-Layout Rules
- FILL: Component stretches to fill available space
- HUG: Component only takes space it needs
- FIXED: Component has exact dimensions

### Constraint Map
| Element | Horizontal | Vertical |
|---|---|---|
| Status bar | Left & Right | Top |
| Header | Left & Right | Top |
| Bottom nav | Left & Right | Bottom |
| Content area | Left & Right | Top & Bottom |
| FAB | Right | Bottom |
| Modal card | Center | Center |

### Breakpoints
| Breakpoint | Width | Layout |
|---|---|---|
| Mobile S | 320px | Single column |
| Mobile L | 428px | Single column |
| Tablet | 768px | 2 columns |
| Desktop | 1024px | 3 columns + sidebar |
| Desktop L | 1440px | Full layout |

---

## ANTI-PATTERNS

### AP-01: Cylindrical Button
- Circular buttons MUST have width = height
- cornerRadius = width / 2 exactly

### AP-02: Color Soup
- Use ONE accent color for primary CTAs
- Variations by style (filled/outlined/ghost), not color

### AP-03: Mixed Border-Radius
- Use consistent values: 4px, 8px, 12px, 16px only

### AP-04: Invisible Text
- NEVER light gray (#CCCCCC) on white (#FFFFFF)

### AP-05: Equal Visual Weight
- 2+ filled buttons same color = hierarchy violation

### AP-06: Placeholder as Label
- Placeholder disappears = user forgets field purpose

### AP-07: Inconsistent Card Padding
- All cards same type = same padding

### AP-08: Multiple Toasts
- Never show more than 1 toast at a time

---

## MOBILE RULES

### Touch Targets
- Minimum: 44×44px (iOS) / 48×48dp (Android)
- Spacing between: minimum 8px
- FAB: 56×56px, bottom-right corner

### Safe Areas
- Top: 44px iOS status bar
- Bottom: 34px iOS home indicator
- Left/Right: 16-24px margins

### Text Sizes
| Element | Minimum |
|---|---|
| Body | 16px |
| Caption | 12px |
| Screen title | 20-28px |

---

## ACCESSIBILITY

- Contrast ratio: 4.5:1 minimum (WCAG AA)
- Large text (>18px): 3:1 minimum
- Focus indicators: 2px accent ring
- Touch targets: 44×44px minimum
- Labels: ALL form inputs
- Semantic HTML: proper heading hierarchy
- Icons: Never convey info by color alone
- Error messages: Icon + text + color

---

## NIELSEN USABILITY HEURISTICS

1. **Visibility of system status** — Always show loading, progress
2. **Match system and real world** — Use familiar patterns
3. **User control and freedom** — Easy undo, back, cancel
4. **Consistency and standards** — Same actions = same results
5. **Error prevention** — Prevent errors before they happen
6. **Recognition not recall** — Show options, don't make user remember
7. **Flexibility and efficiency** — Shortcuts for experts
8. **Aesthetic and minimalist design** — Only essential information
9. **Help recognize/recover errors** — Clear error messages
10. **Help and documentation** — Contextual help when needed