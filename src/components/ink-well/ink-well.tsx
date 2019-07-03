import { Component, h, Element, Prop } from "@stencil/core";

@Component({
  tag: "ink-well",
  styles: `
    :host {
        display: contents;
    }`
})
export class InkWell {
  @Prop() color: string = "rgba(123, 123, 123, 0.52)";

  @Element() host: HTMLElement;

  child: Element;
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
    let default_zIndex: string | number = 2;
    const rect = this.getRect(this.child);
    const diagonal = (rect.width + rect.height) / 2;
    const top = e.clientY - rect.top - diagonal / 2;
    const left = e.clientX - rect.left - diagonal / 2;

    const positon = getComputedStyle(this.child).position;

    this.child.style.overflow = "hidden";
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
      diagonal: diagonal,
      zIndex: default_zIndex
    });
  };

  createWell(props) {
    const { top, left, color, diagonal, zIndex } = props;
    const well = document.createElement("div");

    Object.assign(
      well.style,
      {
        top: `${top}px`,
        left: `${left}px`,
        background: color,
        zIndex: zIndex - 1,
        width: `${diagonal}px`,
        height: `${diagonal}px`
      },
      {
        opacity: 0,
        position: "absolute",
        borderRadius: "100px",
        transform: "scale3d(0, 0, 0)"
      }
    );

    const animation = well.animate(
      [
        {
          opacity: 1,
          transform: "scale(0)"
        },
        {
          opacity: 0,
          transform: `scale(${diagonal / (diagonal / 4)})`
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
