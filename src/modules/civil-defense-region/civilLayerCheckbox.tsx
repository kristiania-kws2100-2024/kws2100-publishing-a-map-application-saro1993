import { useContext, useEffect, useState } from "react";
import { useLayer } from "../map/useLayer";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import { Feature, MapBrowserEvent } from "ol";
import { Point } from "ol/geom";
import { FeatureLike } from "ol/Feature";
import { MapContext } from "../map/mapContext";
const civilFileLocation = "data/Sivilforsvarsdistrikter.json";
console.log(civilFileLocation);

const civilLayer = new VectorLayer({
  source: new VectorSource({
    url: civilFileLocation,
    format: new GeoJSON(),
  }),
  style: civilStyle,
});

type civilProperties = {
  navn: string;
  url: string;
};

type CivilFeature = {
  getProperties(): civilProperties;
} & Feature<Point>;

function civilStyle(f: FeatureLike) {
  const feature = f as CivilFeature;
  const civil = feature.getProperties();
  return new Style({
    image: new Circle({
      stroke: new Stroke({ color: "white", width: 1 }),
      fill: new Fill({
        color: civil.navn === "Oslo" ? "blue" : "purple",
      }),
      radius: 5,
    }),
  });
}

function activeCivilStyle(f: FeatureLike, resolution: number) {
  const feature = f as CivilFeature;
  const civil = feature.getProperties();
  return new Style({
    image: new Circle({
      stroke: new Stroke({ color: "white", width: 3 }),
      fill: new Fill({
        color: civil.navn === "Oslo" ? "blue" : "purple",
      }),
      radius: 10,
    }),
    text:
      resolution < 75
        ? new Text({
            text: civil.navn,
            offsetY: -15,
            font: "bold 14px sans-serif",
            fill: new Fill({ color: "black" }),
            stroke: new Stroke({ color: "white", width: 2 }),
          })
        : undefined,
  });
}

export function CivilLayerCheckbox() {
  const { map } = useContext(MapContext);
  const [checked, setChecked] = useState(false);

  const [activeFeature, setActiveFeature] = useState<CivilFeature>();

  function handlePointerMove(e: MapBrowserEvent<MouseEvent>) {
    const resolution = map.getView().getResolution();
    if (!resolution || resolution > 100) {
      return;
    }
    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(e.pixel, (f) => features.push(f), {
      hitTolerance: 5,
      layerFilter: (l) => l === civilLayer,
    });
    if (features.length === 1) {
      setActiveFeature(features[0] as CivilFeature);
    } else {
      setActiveFeature(undefined);
    }
  }

  useEffect(() => {
    activeFeature?.setStyle(activeCivilStyle);
    return () => activeFeature?.setStyle(undefined);
  }, [activeFeature]);

  useLayer(civilLayer, checked);

  useEffect(() => {
    if (checked) {
      map?.on("pointermove", handlePointerMove);
    }
    return () => map?.un("pointermove", handlePointerMove);
  }, [checked]);

  return (
    <div>
      <label>
        <input
          type={"checkbox"}
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        Show Civil Defense Regions
        {activeFeature &&
          " (" +
            activeFeature.getProperties().navn +
            " " +
            activeFeature.getProperties().url +
            ")"}
      </label>
    </div>
  );
}
