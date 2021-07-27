export type PlacementType = "top" | "right" | "bottom" | "left";
export type ActionType = "hover" | "click" | "focus";

export type FukidashiProps = {
  text: string | string[];
  trigger?: ActionType | ActionType[];
  placement?: PlacementType;
  width?: number;
  delay?: number;
  onSpeechingDone?: Function;
};
