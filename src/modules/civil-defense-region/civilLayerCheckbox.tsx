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

const civilLayer = new VectorLayer({
  source: new VectorSource({
    url: civilFileLocation,
    format: new GeoJSON(),
  }),
});

type CivilProperties = {
  navn: string;
  url: string;
};

type CivilFeature = Feature<Point> & {
  getProperties(): CivilProperties;
};

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
  const { map, setFeatureLayers } = useContext(MapContext);
  const [checked, setChecked] = useState(false);
  const [activeFeature, setActiveFeature] = useState<CivilFeature>();

  useEffect(() => {
    // Add civilLayer to the map layers when checked
    if (checked && civilLayer) {
      setFeatureLayers((prevLayers) => [...prevLayers, civilLayer]);
    } else {
      setFeatureLayers((prevLayers) =>
        prevLayers.filter((layer) => layer !== civilLayer),
      );
    }
  }, [checked, setFeatureLayers]);

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
    // Set style for active feature
    activeFeature?.setStyle((f: FeatureLike, resolution: number) =>
      activeCivilStyle(f, resolution),
    );
    return () => activeFeature?.setStyle(undefined);
  }, [activeFeature]);

  useEffect(() => {
    // Add pointer move event listener when checked
    if (checked) {
      map?.on("pointermove", handlePointerMove);
    } else {
      map?.un("pointermove", handlePointerMove);
    }
    return () => map?.un("pointermove", handlePointerMove);
  }, [checked, map]);

  return (
    <div>
      <label>
        <input
          type={"checkbox"}
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        Show Civil Defense Regions
        {activeFeature && (
          <>
            {" ("}
            {activeFeature.getProperties().navn}{" "}
            {activeFeature.getProperties().url}
            {")"}
          </>
        )}
      </label>
    </div>
  );
}
