import { Feature } from "ol";
import { Point } from "ol/geom";
import { FeatureLike } from "ol/Feature";
import { Fill, RegularShape, Stroke, Style, Text } from "ol/style";

export type ShelterFeature = Feature<Point> & {
  getProperties(): ShelterProperties;
};

export interface ShelterProperties {
  romnr: number;
  plasser: number;
  adresse: string;
}

export const shelterStyle = (feature: FeatureLike) => {
  const shelter = feature.getProperties() as ShelterProperties;
  return new Style({
    image: new RegularShape({
      fill: new Fill({ color: shelter.plasser <= 1000 ? "red" : "blue" }),
      stroke: new Stroke({ color: "white" }),
      points: 3, // Number of points for the square
      radius: 10 + shelter.plasser / 500, // Size of the square
      angle: Math.PI, // Rotation angle (45 degrees)
    }),
  });
};

export const activeShelterStyle = (feature: FeatureLike) => {
  const shelter = feature.getProperties() as ShelterProperties;
  return new Style({
    image: new RegularShape({
      fill: new Fill({ color: "white" }),
      stroke: new Stroke({ color: "royal blue", width: 3 }),
      points: 3,
      radius: 10 + shelter.plasser / 500,
      angle: Math.PI / 4,
    }),

    text: new Text({
      text:
        shelter.adresse +
        ". " +
        shelter.plasser +
        " plasser. " +
        " Romnummer - " +
        shelter.romnr,
      font: "bold italic 20px Roboto", // Using Roboto font family
      stroke: new Stroke({ color: "white", width: 2 }),
      fill: new Fill({ color: "black" }),
      backgroundFill: new Fill({ color: "rgba(32,105,243,0.63)" }),
      backgroundStroke: new Stroke({ color: "rgba(0,0,0,0.5)", width: 2 }),
      offsetY: -10,
    }),
  });
};
