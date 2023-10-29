# @rzane/round-slider

This is a circular range input implemented as a web component.

## Properties

- `value` - The value of the slider
- `min` - Lower limit of values
- `max` - Higher limit of values
- `step` - Step size of slider
- `arc` - Length in degrees of slider bar (default: 270)
- `rotate` - Rotate the slider by a number of degrees (default: 135)
- `disabled` - Boolean property disabling the slider (default: false)
- `aria-label` - Provides an accessible label

## Events

The slider dispatches two events

- `input` - Emitted as the value is changing
- `change` Emitted when the value changes

You can get the slider's value from the `event.target.value`.

## CSS styles

The following css variables can be used to change the styles:

- `--color` - color of the foreground
- `--bg-color` - color of background
- `--track-size` - controls the size of the track
- `--thumb-size` - controls the size of the thumb
- `--slop-size` - controls the size of the hit area
- `--clearance` - controls the spacing between the arc and the surrounding box

Custom styles can be applied to some of the elements within the slider using the `::part()` pseudo-element.

```css
round-slider::part(track) {
}
round-slider::part(progress) {
}
round-slider::part(thumb) {
}
```

## Prior Art

This package is a fork of [thomasloven/round-slider](https://github.com/thomasloven/round-slider), with a few differences.

- Clicking on the slider's progress immediately moves the handle to that point.
- It was difficult to select the min/max values, so I added some custom snapping logic.
- The slider should remain focused after dragging the slider.
- I wanted more flexibility with regard to styling.
- I removed support for functionality that I don't personally need.
