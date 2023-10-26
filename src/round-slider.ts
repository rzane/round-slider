import { LitElement, html, css } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";

function convertDegreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function convertRadiansToCoordinates(radians: number): { x: number; y: number } {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

@customElement("round-slider")
export class RoundSlider extends LitElement {
  @property({ type: Number }) public value: number = 0;
  @property({ type: Number }) public min = 0;
  @property({ type: Number }) public max = 100;
  @property({ type: Number }) public step = 1;
  @property({ type: String }) public valueLabel: string = "";
  @property({ type: Number }) public startAngle = 135;
  @property({ type: Number }) public arcLength = 270;

  @state() isDragging = false;

  @query('svg', true) svg!: SVGElement;

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
    return convertDegreesToRadians(this.startAngle);
  }

  private get lengthRadians(): number {
    return Math.min(convertDegreesToRadians(this.arcLength), 2 * Math.PI - 0.01);
  }

  private convertValueToRadians(value: number): number {
    value = Math.min(this.max, Math.max(this.min, value));
    const fraction = (value - this.min) / (this.max - this.min);
    return this.startRadians + fraction * this.lengthRadians;
  }

  private convertRadiansToValue(radians: number): number {
    return (
      Math.round(
        ((radians / this.lengthRadians) * (this.max - this.min) + this.min) / this.step
      ) * this.step
    );
  }

  private convertCoordinatesToRadians(x: number, y: number): number {
    return (Math.atan2(y, x) - this.startRadians + 8 * Math.PI) % (2 * Math.PI);
  }

  private mouseEventToValue(event: TouchEvent | MouseEvent) {
    const [mouseX, mouseY] = event instanceof MouseEvent
      ? [event.clientX, event.clientY]
      : [event.touches[0].clientX, event.touches[0].clientY];

    const bounds = this.getBoundaries();
    const rect = this.svg.getBoundingClientRect();
    const x = mouseX - (rect.left + (bounds.left * rect.width) / bounds.width);
    const y = mouseY - (rect.top + (bounds.top * rect.height) / bounds.height);
    const radians = this.convertCoordinatesToRadians(x, y);
    return this.convertRadiansToValue(radians);
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
  }

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
      End: () => this.setValue(this.max)
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

  private isAngleOnArc(degrees: number): boolean {
    const a = ((this.startAngle + this.arcLength / 2 - degrees + 180 + 360) % 360) - 180;
    return a < this.arcLength / 2 && a > -this.arcLength / 2;
  }

  private getBoundaries() {
    const arcStart = convertRadiansToCoordinates(this.startRadians);
    const arcEnd = convertRadiansToCoordinates(this.startRadians + this.lengthRadians);

    const top = this.isAngleOnArc(270) ? 1 : Math.max(-arcStart.y, -arcEnd.y);
    const bottom = this.isAngleOnArc(90) ? 1 : Math.max(arcStart.y, arcEnd.y);
    const left = this.isAngleOnArc(180) ? 1 : Math.max(-arcStart.x, -arcEnd.x);
    const right = this.isAngleOnArc(0) ? 1 : Math.max(arcStart.x, arcEnd.x);

    return { top, left, height: top + bottom, width: left + right };
  }

  private renderArc(start: number, end: number): string {
    const diff = end - start;
    const startXY = convertRadiansToCoordinates(start);
    const endXY = convertRadiansToCoordinates(end + 0.001);
    return `M ${startXY.x} ${startXY.y} A 1 1, 0, ${diff > Math.PI ? "1" : "0"} 1, ${endXY.x} ${endXY.y}`;
  }

  protected render() {
    const bounds = this.getBoundaries();

    const theta = this.convertValueToRadians(this.value);
    const handle = convertRadiansToCoordinates(theta);

    const path = this.renderArc(this.startRadians, this.startRadians + this.lengthRadians);

    return html`
      <svg
        @mousedown=${this.onDragStart}
        @touchstart=${this.onDragStart}
        xmln="http://www.w3.org/2000/svg"
        viewBox="${-bounds.left} ${-bounds.top} ${bounds.width} ${bounds.height}"
        focusable="false"
      >
        <g class="slider">
          <path
            class="path"
            d=${path}
            vector-effect="non-scaling-stroke"
          />
          <path
            class="bar"
            vector-effect="non-scaling-stroke"
            d=${this.renderArc(this.convertValueToRadians(this.min), this.convertValueToRadians(this.value))}
          />
          <path
            class="shadowpath"
            d=${path}
            vector-effect="non-scaling-stroke"
            stroke="rgba(0,0,0,0)"
            stroke-linecap="butt"
          />
        </g>

        <path
          class="handle"
          d="M ${handle.x} ${handle.y} L ${handle.x + 0.001} ${handle.y + 0.001}"
          vector-effect="non-scaling-stroke"
          tabindex="0"
          role="slider"
          aria-valuemin=${this.min}
          aria-valuemax=${this.max}
          aria-valuenow=${this.value}
          aria-label=${this.valueLabel}
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
    }

    .handle {
      stroke: black;
      stroke-linecap: round;
      stroke-width: 24px;
      cursor: pointer;
      transition: stroke 200ms ease-out, stroke-width 200ms ease-out;
    }

    .handle:focus {
      stroke: #545454;
      stroke-width: 28px;
      outline: unset;
    }
  `;
}
