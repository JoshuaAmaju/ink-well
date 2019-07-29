import { Component, h, Element, Prop } from "@stencil/core";

@Component({
  tag: "ink-well",
  shadow: true,
  styles: `
    :host {
        display: contents;
    }`
})
export class InkWell {
  @Prop() color: string = "rgba(123, 123, 123, 0.52)";

  @Element() host: Element;

  child: any;
  isAnimating: boolean = false;
  maxChildCount: number = 1;

  connectedCallback() {
    if (this.host.childElementCount > this.maxChildCount) {
      throw "ink-well can only take one direct element child.";
    }
  }

  componentDidLoad() {
    this.child = this.host.children[0];
    this.host.addEventListener("click", this.clickListener);
  }

  clickListener = e => {
    if (this.isAnimating) return;
    const rect = this.getRect(this.child);
    const top = e.clientY - rect.top;
    const left = e.clientX - rect.left;
    let default_zIndex: string | number = 2;

    const positon = getComputedStyle(this.child).position;
    if (positon === "static") this.child.style.position = "relative";

    for (let i = 0; i < this.child.childElementCount; i++) {
      const child = this.child.children[i];
      const child_style = getComputedStyle(child);
      const child_positon = child_style.getPropertyValue("position");
      const zIndex = child_style.getPropertyValue("z-index");

      default_zIndex = zIndex !== "auto" && parseInt(zIndex) > 1 ? zIndex : 2;
      child.style.zIndex = default_zIndex;

      if (child_positon === "static") child.style.position = "relative";
    }

    this.createWell({
      top: top,
      left: left,
      color: this.color,
      zIndex: default_zIndex
    });
  };

  createWell(props) {
    const { top, left, color, zIndex } = props;
    const well = document.createElement("div");

    Object.assign(well.style, {
      top: 0,
      left: 0,
      opacity: 0,
      width: "100%",
      height: "100%",
      background: color,
      zIndex: zIndex - 1,
      position: "absolute"
    });

    const animation = well.animate(
      [
        {
          opacity: 1,
          clipPath: `circle(2px at ${left}px ${top}px)`
        },
        {
          opacity: 0,
          clipPath: `circle(120% at ${left}px ${top}px)`
        }
      ],
      {
        duration: 700
      }
    );

    this.isAnimating = true;

    animation.onfinish = () => {
      this.child.removeChild(well);
      this.child.style.removeProperty("position");
      this.child.style.removeProperty("overflow");

      for (let i = 0; i < this.child.childElementCount; i++) {
        const child = this.child.children[i];
        child.style.removeProperty("z-index");
        child.style.removeProperty("position");
      }

      this.isAnimating = false;
    };

    this.child.appendChild(well);
  }

  getRect(element: HTMLElement) {
    return element.getBoundingClientRect();
  }

  render() {
    return <slot />;
  }
}
