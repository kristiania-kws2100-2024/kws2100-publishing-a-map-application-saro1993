import { Feature } from "ol";
import { Polygon } from "ol/geom";
import { FeatureLike } from "ol/Feature";
import { Fill, Stroke, Style, Text, Circle } from "ol/style"; // Import Circle here

export type CivilFeature = {
  getProperties(): CivilProperties;
} & Feature<Polygon>;

export interface CivilProperties {
  navn: string;
  url: string;
}

export const normalCivilStyle = (feature: FeatureLike) => {
  const civil = feature.getProperties() as CivilProperties;
  return new Style({
    fill: new Fill({
      color: "rgba(255, 255, 255, 0.4)", // Transparent white color for region fill
    }),
    stroke: new Stroke({
      color: "#319FD3", // Blue color for region border
      width: 1,
    }),
    text: new Text({
      text: civil.navn,
      font: "bold 12px sans-serif",
      fill: new Fill({
        color: "#000", // Black color for text
      }),
    }),
    // No image for the bubble in normal style
    image: undefined,
  });
};

export const hoverCivilStyle = (feature: FeatureLike) => {
  const civil = feature.getProperties() as CivilProperties;
  return new Style({
    fill: new Fill({
      color: "rgba(255, 255, 0, 0.4)", // Transparent yellow color for highlighted region fill on hover
    }),
    stroke: new Stroke({
      color: "#FFD700", // Gold color for highlighted region border on hover
      width: 2,
    }),
    text: new Text({
      text: civil.navn,
      font: "bold 14px sans-serif",
      fill: new Fill({
        color: "#000", // Black color for text
      }),
    }),
    // Link bubble for hover style
    image: new Circle({
      fill: new Fill({ color: "rgba(0, 0, 0, 1)" }), // Solid black color for the bubble
      radius: 10,
    }),
  });
};
