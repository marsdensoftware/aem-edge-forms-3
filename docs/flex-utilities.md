# Bootstrap Flex Utilities

This document provides a guide on how to use the Bootstrap flex utilities that have been added to the project.

## Basic Flex Utilities

### Display Flex

To create a flex container, add the `d-flex` class to an element:

```html
<div class="d-flex">
  <!-- Flex items go here -->
</div>
```

For inline flex containers, use `d-inline-flex`:

```html
<span class="d-inline-flex">
  <!-- Flex items go here -->
</span>
```

### Flex Direction

Control the direction of flex items with these classes:

- `flex-row`: Items are placed horizontally (default)
- `flex-column`: Items are placed vertically
- `flex-row-reverse`: Items are placed horizontally in reverse order
- `flex-column-reverse`: Items are placed vertically in reverse order

```html
<div class="d-flex flex-row">
  <!-- Items will be arranged horizontally -->
</div>

<div class="d-flex flex-column">
  <!-- Items will be arranged vertically -->
</div>
```

### Flex Wrap

Control how flex items wrap with these classes:

- `flex-wrap`: Items wrap onto multiple lines
- `flex-nowrap`: Items stay on a single line (default)
- `flex-wrap-reverse`: Items wrap onto multiple lines in reverse order

```html
<div class="d-flex flex-wrap">
  <!-- Items will wrap onto multiple lines -->
</div>
```

### Justify Content

Align flex items along the main axis with these classes:

- `justify-content-start`: Items are aligned at the start (default)
- `justify-content-end`: Items are aligned at the end
- `justify-content-center`: Items are centered
- `justify-content-between`: Items are evenly distributed with the first item at the start and the last item at the end
- `justify-content-around`: Items are evenly distributed with equal space around them
- `justify-content-evenly`: Items are evenly distributed with equal space between them

```html
<div class="d-flex justify-content-center">
  <!-- Items will be centered horizontally -->
</div>
```

### Align Items

Align flex items along the cross axis with these classes:

- `align-items-start`: Items are aligned at the start
- `align-items-end`: Items are aligned at the end
- `align-items-center`: Items are centered
- `align-items-baseline`: Items are aligned at their baselines
- `align-items-stretch`: Items are stretched to fill the container (default)

```html
<div class="d-flex align-items-center">
  <!-- Items will be centered vertically -->
</div>
```

### Align Self

Override the alignment for individual flex items with these classes:

- `align-self-start`: Item is aligned at the start
- `align-self-end`: Item is aligned at the end
- `align-self-center`: Item is centered
- `align-self-baseline`: Item is aligned at its baseline
- `align-self-stretch`: Item is stretched to fill the container (default)

```html
<div class="d-flex">
  <div>Regular item</div>
  <div class="align-self-center">Centered item</div>
  <div>Regular item</div>
</div>
```

### Flex Grow and Shrink

Control how flex items grow and shrink with these classes:

- `flex-grow-0`: Item won't grow
- `flex-grow-1`: Item will grow to fill available space
- `flex-shrink-0`: Item won't shrink
- `flex-shrink-1`: Item will shrink if necessary (default)

```html
<div class="d-flex">
  <div class="flex-grow-1">This item will grow</div>
  <div>This item won't grow</div>
</div>
```

## Responsive Variants

All flex utilities have responsive variants for different screen sizes:

- `d-sm-flex`, `d-md-flex`, `d-lg-flex`, `d-xl-flex`, `d-xxl-flex`
- `flex-sm-row`, `flex-md-row`, `flex-lg-row`, `flex-xl-row`, `flex-xxl-row`
- And so on for all other flex utilities

Example of responsive flex behavior:

```html
<div class="d-flex flex-column flex-md-row">
  <!-- Items will be arranged vertically on small screens and horizontally on medium and larger screens -->
</div>
```

## Common Use Cases

### Centering Content

To center content both horizontally and vertically:

```html
<div class="d-flex justify-content-center align-items-center" style="height: 200px;">
  <div>Centered content</div>
</div>
```

### Creating Equal-Width Columns

To create equal-width columns that fill the available space:

```html
<div class="d-flex">
  <div class="flex-grow-1">Column 1</div>
  <div class="flex-grow-1">Column 2</div>
  <div class="flex-grow-1">Column 3</div>
</div>
```

### Creating a Navbar

To create a simple navbar with items aligned to the right:

```html
<nav class="d-flex justify-content-between align-items-center">
  <div>Logo</div>
  <div class="d-flex">
    <div class="mx-2">Link 1</div>
    <div class="mx-2">Link 2</div>
    <div class="mx-2">Link 3</div>
  </div>
</nav>
```

## Further Reading

For more information on Bootstrap flex utilities, visit the [Bootstrap documentation](https://getbootstrap.com/docs/5.3/utilities/flex/).
