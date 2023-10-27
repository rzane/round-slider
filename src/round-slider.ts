import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
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

  @query("svg", true) svg!: SVGElement;

  constructor() {
    super();
    this.addEventListener("keydown", this.onKeyDown);
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("mouseup", this.onDragEnd);
    document.addEventListener("touchend", this.onDragEnd, { passive: false });
    document.addEventListener("mousemove", this.onDrag);
    document.addEventListener("touchmove", this.onDrag, { passive: false });
  }

  disconnectedCallback(): void {
    document.removeEventListener("mouseup", this.onDragEnd);
    document.removeEventListener("touchend", this.onDragEnd);
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
      lengthDegrees: this.arcLength,
      lengthRadians: this.lengthRadians,
      startDegrees: this.startAngle,
      startRadians: this.startRadians,
    };
  }

  private mouseEventToValue(event: TouchEvent | MouseEvent) {
    const mouse = mouseEventToPoint(event);

    const bounds = getBoundaries(this.context);
    const svg = this.svg.getBoundingClientRect();
    const x = mouse.x - (svg.left + (bounds.left * svg.width) / bounds.width);
    const y = mouse.y - (svg.top + (bounds.top * svg.height) / bounds.height);
    return pointToValue({ x, y }, this.context);
  }

  private onDragStart = (event: TouchEvent | MouseEvent): void => {
    const target = event.target as SVGElement;
    const isShadowpath = target.classList.contains("shadowpath");
    const isHandle = target.classList.contains("handle");

    if (isHandle) {
      this.isDragging = true;
    } else if (isShadowpath) {
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

  private onDragEnd = (_event: MouseEvent | TouchEvent): void => {
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
    const handle = radiansToPoint(valueToRadians(this.value, this.context));

    const path = renderArc(
      this.startRadians,
      this.startRadians + this.lengthRadians,
    );

    const bar = renderArc(
      valueToRadians(this.min, this.context),
      valueToRadians(this.value, this.context),
    );

    return html`
      <svg
        @mousedown=${this.onDragStart}
        @touchstart=${this.onDragStart}
        xmlns="http://www.w3.org/2000/svg"
        viewBox=${viewBox}
        focusable="false"
      >
        <g class="slider">
          <path class="path" d=${path} />
          <path class="bar" d=${bar} />
          <path class="shadowpath" d=${path} />
        </g>

        <path
          class="handle"
          d="M ${handle.x} ${handle.y} L ${handle.x + 0.001} ${handle.y +
          0.001}"
          tabindex="0"
          role="slider"
          aria-valuemin=${this.min}
          aria-valuemax=${this.max}
          aria-valuenow=${this.value}
          aria-label=${this.ariaLabel}
        />
      </svg>
    `;
  }

  static styles = css`
    :host {
      display: inline-block;
      width: 100%;
    }

    svg {
      overflow: visible;
      display: block;
      margin: 12px;
    }

    path {
      vector-effect: non-scaling-stroke;
    }

    .slider {
      fill: none;
      stroke-width: 3;
      stroke-linecap: round;
    }

    .path {
      stroke: #cbcbcb;
    }

    .bar {
      stroke: black;
    }

    .shadowpath {
      stroke-width: 36px;
      stroke: rgba(0, 0, 0, 0);
      stroke-linecap: butt;
    }

    .handle {
      stroke: black;
      stroke-linecap: round;
      stroke-width: 24px;
      cursor: pointer;
      transition:
        stroke 200ms ease-out,
        stroke-width 200ms ease-out;
    }

    .handle:focus {
      stroke: #545454;
      stroke-width: 28px;
      outline: unset;
    }
  `;
}
