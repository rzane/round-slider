import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  Context,
  Degrees,
  pointToValue,
  degreesToRadians,
  mouseEventToPoint,
  radiansToPoint,
  valueToRadians,
  getBoundaries,
  getViewBox,
  renderArc,
  isValidPress,
} from "./utilities";

@customElement("round-slider")
export class RoundSlider extends LitElement {
  @property({ type: Number })
  public value: number = 0;

  @property({ type: Number })
  public min = 0;

  @property({ type: Number })
  public max = 100;

  @property({ type: Number })
  public step = 1;

  @property({ type: String, attribute: "aria-label" })
  public ariaLabel: string = "";

  @property({ type: Number })
  public arc: Degrees = 270;

  @property({ type: Number })
  public rotate: Degrees = 135;

  @property({ type: Boolean })
  public disabled: boolean = false;

  private isDragging = false;
  private previousValue = this.value;

  constructor() {
    super();
    this.addEventListener("keydown", this.onKeyDown);
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("mouseup", this.onRelease);
    document.addEventListener("touchend", this.onRelease, { passive: false });
    document.addEventListener("mousemove", this.onDrag);
    document.addEventListener("touchmove", this.onDrag, { passive: false });
  }

  disconnectedCallback(): void {
    document.removeEventListener("mouseup", this.onRelease);
    document.removeEventListener("touchend", this.onRelease);
    document.removeEventListener("mousemove", this.onDrag);
    document.removeEventListener("touchmove", this.onDrag);
    super.disconnectedCallback();
  }

  private get context(): Context {
    return {
      min: this.min,
      max: this.max,
      step: this.step,
      arc: Math.min(degreesToRadians(this.arc), 2 * Math.PI - 0.01),
      rotate: degreesToRadians(this.rotate),
    };
  }

  private mouseEventToValue(event: TouchEvent | MouseEvent) {
    const mouse = mouseEventToPoint(event);
    const bounds = getBoundaries(this.context);
    const el = this.getBoundingClientRect();
    const x = mouse.x - (el.left + (bounds.left * el.width) / bounds.width);
    const y = mouse.y - (el.top + (bounds.top * el.height) / bounds.height);
    return pointToValue({ x, y }, this.context);
  }

  private onPressThumb = (event: TouchEvent | MouseEvent): void => {
    if (isValidPress(event)) {
      this.isDragging = true;
    }
  };

  private onPressTrack = (event: TouchEvent | MouseEvent): void => {
    if (isValidPress(event)) {
      this.isDragging = true;
      this.setValue(this.mouseEventToValue(event));
    }
  };

  private onDrag = (event: TouchEvent | MouseEvent): void => {
    if (this.isDragging) {
      event.preventDefault();
      this.setValue(this.mouseEventToValue(event));
    }
  };

  private onRelease = (_event: MouseEvent | TouchEvent): void => {
    if (this.isDragging) {
      this.isDragging = false;
      this.mightHaveChanged();
    }
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    const keys: Record<string, () => void> = {
      ArrowLeft: () => this.setValue(this.value - this.step),
      ArrowDown: () => this.setValue(this.value - this.step),
      ArrowRight: () => this.setValue(this.value + this.step),
      ArrowUp: () => this.setValue(this.value + this.step),
      Home: () => this.setValue(this.min),
      End: () => this.setValue(this.max),
    };

    if (keys[event.key]) {
      event.preventDefault();
      keys[event.key]();
      this.mightHaveChanged();
    }
  };

  private setValue(value: number): void {
    if (value !== this.value && value >= this.min && value <= this.max && !this.disabled) {
      this.value = value;
      this.emit("input");
    }
  }

  private mightHaveChanged() {
    if (this.value !== this.previousValue) {
      this.previousValue = this.value;
      this.emit("change");
    }
  }

  private emit(name: string) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  protected render() {
    const viewBox = getViewBox(this.context);

    const track = renderArc(0, this.context.arc);
    const progress = renderArc(
      valueToRadians(this.min, this.context),
      valueToRadians(this.value, this.context),
    );

    const point = radiansToPoint(valueToRadians(this.value, this.context));
    const thumb = `
      M ${point.x} ${point.y}
      L ${point.x + 0.001} ${point.y + 0.001}
    `;

    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox=${viewBox}
        focusable="false"
        transform="rotate(${this.rotate})"
      >
        <g>
          <path class="track" part="track" d=${track} />
          <path class="progress" part="progress" d=${progress} />
          <path
            class="track--slop"
            d=${track}
            @mousedown=${this.onPressTrack}
            @touchstart=${this.onPressTrack}
          />
        </g>

        <g>
          <path
            class="thumb"
            part="thumb"
            d=${thumb}
            tabindex="0"
            role="slider"
            aria-valuemin=${this.min}
            aria-valuemax=${this.max}
            aria-valuenow=${this.value}
            aria-label=${this.ariaLabel}
            aria-disabled=${this.disabled}
          />
          <path
            class="thumb--slop"
            d=${thumb}
            @mousedown=${this.onPressThumb}
            @touchstart=${this.onPressThumb}
          />
        </g>
      </svg>
    `;
  }

  static styles = css`
    :host {
      display: inline-block;
      width: 100%;
    }

    svg {
      display: block;
      overflow: visible;
    }

    .track {
      fill: none;
      stroke: #ebebeb;
      stroke-width: 8;
      stroke-linecap: round;
      vector-effect: non-scaling-stroke;
    }

    .track--slop {
      fill: none;
      stroke: rgba(0, 0, 0, 0);
      stroke-width: 32;
      stroke-linecap: round;
      vector-effect: non-scaling-stroke;
    }

    .progress {
      fill: none;
      stroke: #0a5aff;
      stroke-width: 8;
      stroke-linecap: round;
      vector-effect: non-scaling-stroke;
    }

    .progress:hover {
      stroke: #0545bc;
    }

    .thumb {
      stroke: #0a5aff;
      stroke-width: 16;
      stroke-linecap: round;
      vector-effect: non-scaling-stroke;
    }

    .thumb:focus {
      outline: unset;
      stroke: #0545bc;
    }

    .thumb--slop {
      stroke: rgba(0, 0, 0, 0);
      stroke-width: 32;
      stroke-linecap: round;
      vector-effect: non-scaling-stroke;
    }

    :host[disabled]::part(thumb),
    :host[disabled]::part(progress) {
      stroke: #bfbfbf;
    }
  `;
}
