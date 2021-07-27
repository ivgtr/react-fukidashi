import { css } from "@linaria/core";
import React, { useMemo } from "react";
import { PlacementType } from "../../types";

type Props = {
  placement: PlacementType;
  width: number;
  gap: number;
};

const styles = {
  box: css`
    position: absolute;
    top: var(--box-top, auto);
    right: var(--box-right, auto);
    bottom: var(--box-bottom, auto);
    left: var(--box-left, auto);
    width: 300px;
    background-color: #fff;
    border: 2px solid #444;
    border-radius: 5px;
    transform: translateY(var(--transform-top, 0));
    &::before {
      position: absolute;
      top: var(--arrow-before-top, auto);
      right: var(--arrow-before-right, auto);
      bottom: var(--arrow-before-bottom, auto);
      left: var(--arrow-before-left, auto);
      width: 20px;
      height: 20px;
      clip-path: polygon(0 0, 100% 0, 100% 100%);
      content: "";
      background-color: #444;
      transform: rotate(var(--transform-rotate, 0));
    }
    &::after {
      position: absolute;
      top: var(--arrow-after-top, auto);
      right: var(--arrow-after-right, auto);
      bottom: var(--arrow-after-bottom, auto);
      left: var(--arrow-after-left, auto);
      width: 16px;
      height: 16px;
      clip-path: polygon(0 0, 100% 0, 100% 100%);
      content: "";
      background-color: #fff;
      transform: rotate(var(--transform-rotate, 0deg));
    }
  `,
};

export const Box: React.FC<Props> = ({ children, placement, width, gap }) => {
  const setPosition = useMemo(() => {
    let position = {};
    switch (placement) {
      case "top":
        position = {
          "--box-bottom": `calc(100% + ${gap}px)`,
          "--box-left": "calc(50% - 150px)",
          "--arrow-before-top": "100%",
          "--arrow-before-left": "10%",
          "--arrow-after-top": "calc(100% - 2px)",
          "--arrow-after-left": "calc(10% + 1px)",
        };
        break;
      case "right":
        position = {
          "--box-top": `50%`,
          "--box-left": `calc(100% + ${gap}px)`,
          "--transform-top": "-50%",
          "--arrow-before-top": "10%",
          "--arrow-before-right": "100%",
          "--arrow-after-top": "calc(10% + 1px)",
          "--arrow-after-right": "calc(100% - 2px)",
          "--transform-rotate": "90deg",
        };
        break;
      case "bottom":
        position = {
          "--box-top": `calc(100% + ${gap}px)`,
          "--box-left": "calc(50% - 150px)",
          "--arrow-before-bottom": "100%",
          "--arrow-before-right": "10%",
          "--arrow-after-bottom": "calc(100% - 2px)",
          "--arrow-after-right": "calc(10% + 1px)",
          "--transform-rotate": "180deg",
        };
        break;
      case "left":
        position = {
          "--box-top": `50%`,
          "--box-right": `calc(100% + ${gap}px)`,
          "--transform-top": "-50%",
          "--arrow-before-bottom": "10%",
          "--arrow-before-left": "100%",
          "--arrow-after-bottom": "calc(10% + 1px)",
          "--arrow-after-left": "calc(100% - 2px)",
          "--transform-rotate": "270deg",
        };
        break;
      default:
        position = { "--box-bottom": `calc(100% + ${gap}px)`, "--box-left": "calc(50% - 150px)" };
        break;
    }

    return position as React.CSSProperties;
  }, [placement]);

  return (
    <div className={styles.box} style={setPosition}>
      {children}
    </div>
  );
};
