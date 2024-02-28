import { useContext, useEffect, useState } from "react";
import { useLayer } from "../map/useLayer";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { MapBrowserEvent } from "ol";
import { FeatureLike } from "ol/Feature";
import { MapContext } from "../map/mapContext";
import {
  shelterStyle,
  activeShelterStyle,
  ShelterFeature,
} from "./emergencyStyle"; // Import shelterStyle and activeShelterStyle from emergencyStyle.tsx

const emergencyFileLocation = "./data/Offentlige_tilfluktsrom.json";

const emergencyLayer = new VectorLayer({
  source: new VectorSource({
    url: emergencyFileLocation,
    format: new GeoJSON(),
  }),
  style: shelterStyle, // Use shelterStyle instead of emergencyStyle
});

export function EmergencyLayerCheckbox() {
  const { map } = useContext(MapContext);
  const [checked, setChecked] = useState(false);
  const [activeFeature, setActiveFeature] = useState<ShelterFeature>(); // Change EmergencyFeature to ShelterFeature

  function handlePointerMove(e: MapBrowserEvent<MouseEvent>) {
    map.getView().getResolution();
    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(e.pixel, (f) => features.push(f), {
      hitTolerance: 5,
      layerFilter: (l) => l === emergencyLayer,
    });
    if (features.length === 1) {
      setActiveFeature(features[0] as ShelterFeature); // Change EmergencyFeature to ShelterFeature
    } else {
      setActiveFeature(undefined);
    }
  }

  useEffect(() => {
    activeFeature?.setStyle(activeShelterStyle); // Use activeShelterStyle instead of activeEmergencyStyle
    return () => activeFeature?.setStyle(undefined);
  }, [activeFeature, map]); // Include activeFeature and map in the dependency array

  useLayer(emergencyLayer, checked);

  useEffect(() => {
    if (checked) {
      map?.on("pointermove", handlePointerMove);
    }
    return () => map?.un("pointermove", handlePointerMove);
  }, [checked, map, handlePointerMove]);

  return (
      <div>
        <label>
          <input
              type={"checkbox"}
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
          />
          Show emergency shelters
        </label>
      </div>
  );
}
