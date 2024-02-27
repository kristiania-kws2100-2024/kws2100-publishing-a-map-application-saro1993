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
const emergencyFileLocation = "data/Offentlige _tilfluktsrom.json";

const emergencyLayer = new VectorLayer({
  source: new VectorSource({
    url: emergencyFileLocation,
    format: new GeoJSON(),
  }),
  style: emergencyStyle,
});

type emergencyProperties = {
  romnr: number;
  plasser: number;
  adresse: string;
};

type EmergencyFeature = {
  getProperties(): emergencyProperties;
} & Feature<Point>;

function emergencyStyle(f: FeatureLike) {
  const feature = f as EmergencyFeature;
  const _radius = 2 + Math.sqrt(feature.getProperties().plasser) / 4;
  const emergency = feature.getProperties();
  return new Style({
    image: new Circle({
      stroke: new Stroke({ color: "white", width: 1 }),
      fill: new Fill({
        color: emergency.plasser > 100 ? "blue" : "purple",
      }),
      radius: _radius,
    }),
  });
}

function activeEmergencyStyle(f: FeatureLike, resolution: number) {
  const feature = f as EmergencyFeature;
  const _radius = 2 + Math.sqrt(feature.getProperties().plasser) / 4;
  const emergency = feature.getProperties();
  return new Style({
    image: new Circle({
      stroke: new Stroke({ color: "white", width: 3 }),
      fill: new Fill({
        color: emergency.plasser > 10 ? "blue" : "purple",
      }),
      radius: _radius,
    }),
    text:
      resolution < 75
        ? new Text({
            text: emergency.adresse,
            offsetY: -15,
            font: "bold 14px sans-serif",
            fill: new Fill({ color: "black" }),
            stroke: new Stroke({ color: "white", width: 2 }),
          })
        : undefined,
  });
}

export function EmergencyLayerCheckbox() {
  const { map } = useContext(MapContext);
  const [checked, setChecked] = useState(false);

  const [activeFeature, setActiveFeature] = useState<EmergencyFeature>();

  function handlePointerMove(e: MapBrowserEvent<MouseEvent>) {
    const resolution = map.getView().getResolution();
    if (!resolution || resolution > 100) {
      return;
    }
    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(e.pixel, (f) => features.push(f), {
      hitTolerance: 5,
      layerFilter: (l) => l === emergencyLayer,
    });
    if (features.length === 1) {
      setActiveFeature(features[0] as EmergencyFeature);
    } else {
      setActiveFeature(undefined);
    }
  }

  useEffect(() => {
    activeFeature?.setStyle(activeEmergencyStyle);
    return () => activeFeature?.setStyle(undefined);
  }, [activeFeature]);

  useLayer(emergencyLayer, checked);

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
        Show emergency shelterss
        {activeFeature &&
          " (" +
            activeFeature.getProperties().adresse +
            " " +
            activeFeature.getProperties().romnr +
            ")"}
      </label>
    </div>
  );
}
