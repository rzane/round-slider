import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  Context,
  pointToValue,
  degreesToRadians,
  mouseEventToPoint,
  radiansToPoint,
  valueToRadians,
  getBoundaries,
  getViewBox,
  renderArc,
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
  public arcLength = 270;

  @property({ type: Number })
  public startAngle = 135;

  private isDragging = false;

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

  private get startRadians(): number {
    return degreesToRadians(this.startAngle);
  }

  private get lengthRadians(): number {
    return Math.min(degreesToRadians(this.arcLength), 2 * Math.PI - 0.01);
  }

  private get context(): Context {
    return {
      min: this.min,
      max: this.max,
      step: this.step,
      lengthRadians: this.lengthRadians,
      startRadians: this.startRadians,
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

  private onPressThumb = (): void => {
    this.isDragging = true;
  };

  private onPressTrack = (event: TouchEvent | MouseEvent): void => {
    this.isDragging = true;
    this.setValue(this.mouseEventToValue(event));
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
      this.emit("change");
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
    }
  };

  private setValue(value: number): void {
    if (value !== this.value && value >= this.min && value <= this.max) {
      this.value = value;
      this.emit("input");
    }
  }

  private emit(name: string) {
    const event = new CustomEvent(name, {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  protected render() {
    const viewBox = getViewBox(this.context);

    const track = renderArc(0, this.lengthRadians);
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
        transform="rotate(${this.startAngle})"
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
  `;
}
